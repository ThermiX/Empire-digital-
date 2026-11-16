// =============================================================
//  routes/commandes.js — PAGE 3 : Commandes de vidéos
//   GET  /commandes                  liste filtrable
//   GET  /commandes/nouvelle         saisir une commande à la main
//   POST /commandes                  enregistrer la commande
//   GET  /commandes/:id              fiche : aperçu vidéo + actions
//   GET  /commandes/:id/telecharger  télécharger la vidéo
//   POST /commandes/:id/video        joindre la vidéo finale (MP4)
//   POST /commandes/:id/relancer     remettre dans la file de rendu
//   POST /commandes/:id/statut       changer le statut à la main
//   POST /commandes/:id/envoye       noter l'envoi WhatsApp (appel JS)
//
//  Le RENDU des vidéos (fabrication) n'est pas fait ici : un futur
//  moteur de rendu prendra les commandes "en_attente". En attendant,
//  vous pouvez fabriquer la vidéo vous-même et la joindre.
// =============================================================
const crypto = require('node:crypto');
const express = require('express');
const db = require('../db/database');
const f = require('../lib/format');
const fichiers = require('../lib/fichiers');
const { flash } = require('../lib/securite');
const { noter, idParam, motifRecherche, pagination, texte, lienWhatsApp, remplirMessage, urlDeBase } = require('../lib/outils');

const router = express.Router();

const STATUTS = { en_attente: 'En attente', en_cours: 'En cours', terminee: 'Terminée', echec: 'Échec' };

function chargerCommande(id) {
  return db.un(
    `SELECT c.*, cl.nom AS client_nom, cl.whatsapp AS client_whatsapp, cl.statut AS client_statut,
            g.nom AS gabarit_nom, g.miniature AS gabarit_miniature, g.duree_secondes, g.format, g.champs AS gabarit_champs
     FROM commandes c
     JOIN clients cl ON cl.id = c.client_id
     LEFT JOIN gabarits g ON g.id = c.gabarit_id
     WHERE c.id = ?`,
    id,
  );
}

/** Supprime un fichier vidéo s'il ne sert plus à aucune commande */
function nettoyerVideo(nom) {
  if (nom && !db.valeur('SELECT COUNT(*) FROM commandes WHERE fichier_video = ?', nom)) fichiers.supprimer('videos', nom);
}

// ---------- Liste ----------
router.get('/', (req, res) => {
  const q = texte(req.query.q, 100);
  const statut = Object.hasOwn(STATUTS, req.query.statut) ? req.query.statut : '';

  const conditions = [];
  const params = [];
  if (q) {
    conditions.push(`(cl.nom LIKE ? ESCAPE '\\' OR g.nom LIKE ? ESCAPE '\\' OR c.id = ?)`);
    params.push(motifRecherche(q), motifRecherche(q), Number(q.replace('#', '')) || 0);
  }
  if (statut) {
    conditions.push('c.statut = ?');
    params.push(statut);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const jointures = 'FROM commandes c JOIN clients cl ON cl.id = c.client_id LEFT JOIN gabarits g ON g.id = c.gabarit_id';

  const total = db.valeur(`SELECT COUNT(*) ${jointures} ${where}`, ...params);
  const pages = pagination(req, total);
  const commandes = db.tous(
    `SELECT c.*, cl.nom AS client_nom, g.nom AS gabarit_nom, g.miniature AS gabarit_miniature
     ${jointures} ${where} ORDER BY c.cree_le DESC, c.id DESC LIMIT ? OFFSET ?`,
    ...params,
    pages.parPage,
    pages.decalage,
  );
  const compteurs = Object.fromEntries(db.tous('SELECT statut, COUNT(*) AS n FROM commandes GROUP BY statut').map((l) => [l.statut, l.n]));

  res.render('commandes/liste', { titre: 'Vidéos', rubrique: 'commandes', commandes, q, statut, STATUTS, compteurs, pages });
});

// ---------- Nouvelle commande (saisie manuelle) ----------
function afficherFormulaire(req, res, { valeurs = {}, erreurs = {} } = {}) {
  res.render('commandes/formulaire', {
    titre: 'Nouvelle commande',
    rubrique: 'commandes',
    valeurs: { client_id: Number(req.query.client_id) || '', ...valeurs },
    erreurs,
    clients: db.tous(`SELECT id, nom, statut, est_demo FROM clients WHERE statut != 'suspendu' ORDER BY nom COLLATE NOCASE`),
    gabarits: db.tous('SELECT id, nom, duree_secondes, est_demo FROM gabarits WHERE actif = 1 ORDER BY nom COLLATE NOCASE'),
  });
}

router.get('/nouvelle', (req, res) => afficherFormulaire(req, res));

router.post('/', (req, res) => {
  const valeurs = {
    client_id: Number(req.body.client_id) || null,
    gabarit_id: Number(req.body.gabarit_id) || null,
    brief: texte(req.body.brief, 3000),
  };
  const erreurs = {};
  const client = valeurs.client_id && db.un('SELECT * FROM clients WHERE id = ?', valeurs.client_id);
  const gabarit = valeurs.gabarit_id && db.un('SELECT * FROM gabarits WHERE id = ?', valeurs.gabarit_id);
  if (!client) erreurs.client_id = 'Choisissez le client.';
  if (!gabarit) erreurs.gabarit_id = 'Choisissez le gabarit.';
  if (Object.keys(erreurs).length) return afficherFormulaire(req, res, { valeurs, erreurs });

  const contenu = valeurs.brief ? { 'Brief (saisi par l’admin)': valeurs.brief } : {};
  const { lastInsertRowid } = db.executer(
    `INSERT INTO commandes (client_id, gabarit_id, statut, contenu, cree_le, est_demo) VALUES (?, ?, 'en_attente', ?, ?, ?)`,
    client.id,
    gabarit.id,
    JSON.stringify(contenu),
    f.maintenant(),
    client.est_demo, // une commande pour un client DÉMO est aussi DÉMO
  );
  noter(req, 'Commande créée', `#${lastInsertRowid} — ${client.nom}`);
  flash(req, 'succes', `Commande #${lastInsertRowid} créée (en attente).`);
  res.redirect(303, `/commandes/${lastInsertRowid}`);
});

// ---------- Fiche ----------
router.get('/:id', (req, res, next) => {
  const commande = idParam(req) && chargerCommande(idParam(req));
  if (!commande) return next();
  const p = res.locals.parametres;

  // Lien public de la vidéo et message WhatsApp prêt à envoyer
  const lienVideo = commande.fichier_video && commande.jeton_partage ? `${urlDeBase(req)}/v/${commande.jeton_partage}` : '';
  const message = remplirMessage(p.message_video_prete, {
    nom: commande.client_nom,
    gabarit: commande.gabarit_nom || 'personnalisée',
    lien: lienVideo,
    marque: p.nom_marque,
    contact: p.whatsapp_contact ? f.telephone(p.whatsapp_contact) : '',
    numero: commande.id,
  });

  res.render('commandes/fiche', {
    titre: `Commande #${commande.id}`,
    rubrique: 'commandes',
    commande,
    STATUTS,
    contenu: f.json(commande.contenu, {}),
    champs: f.json(commande.gabarit_champs, []),
    lienVideo,
    message,
    lienWhatsApp: lienWhatsApp(commande.client_whatsapp, message),
  });
});

// ---------- Télécharger ----------
router.get('/:id/telecharger', (req, res, next) => {
  const commande = idParam(req) && chargerCommande(idParam(req));
  const chemin = commande && fichiers.chemin('videos', commande.fichier_video);
  if (!chemin) return next();
  const extension = commande.fichier_video.split('.').pop();
  res.download(chemin, `animo-commande-${commande.id}.${extension}`);
});

// ---------- Joindre la vidéo finale ----------
router.post('/:id/video', fichiers.televerser('videos', 'video'), (req, res, next) => {
  const commande = idParam(req) && chargerCommande(idParam(req));
  if (!commande) {
    if (req.file) fichiers.supprimer('videos', req.file.filename);
    return next();
  }
  if (!req.file) {
    flash(req, 'erreur', req.erreurFichier || 'Choisissez un fichier vidéo.');
    return res.redirect(303, `/commandes/${commande.id}`);
  }
  const jeton = commande.jeton_partage || crypto.randomBytes(24).toString('base64url');
  db.executer(
    `UPDATE commandes SET fichier_video = ?, jeton_partage = ?, statut = 'terminee', termine_le = ?, erreur = NULL WHERE id = ?`,
    req.file.filename,
    jeton,
    f.maintenant(),
    commande.id,
  );
  nettoyerVideo(commande.fichier_video);
  noter(req, 'Vidéo jointe', `Commande #${commande.id} — ${commande.client_nom}`);
  flash(req, 'succes', 'Vidéo enregistrée : la commande est terminée. Envoyez-la au client sur WhatsApp 👇');
  res.redirect(303, `/commandes/${commande.id}`);
});

// ---------- Relancer le rendu ----------
router.post('/:id/relancer', (req, res, next) => {
  const commande = idParam(req) && chargerCommande(idParam(req));
  if (!commande) return next();
  db.executer(
    `UPDATE commandes SET statut = 'en_attente', erreur = NULL, termine_le = NULL, nb_rendus = nb_rendus + 1 WHERE id = ?`,
    commande.id,
  );
  noter(req, 'Rendu relancé', `Commande #${commande.id}`);
  flash(req, 'succes', `Commande #${commande.id} remise dans la file de rendu (en attente).`);
  res.redirect(303, `/commandes/${commande.id}`);
});

// ---------- Changer le statut à la main ----------
router.post('/:id/statut', (req, res, next) => {
  const commande = idParam(req) && chargerCommande(idParam(req));
  if (!commande) return next();
  const statut = Object.hasOwn(STATUTS, req.body.statut) ? req.body.statut : null;
  if (!statut) {
    flash(req, 'erreur', 'Statut inconnu.');
  } else if (statut === 'terminee' && !commande.fichier_video) {
    flash(req, 'erreur', "Pour terminer la commande, joignez d'abord la vidéo finale.");
  } else {
    const erreur = statut === 'echec' ? texte(req.body.erreur, 500) || 'Échec signalé par l’admin' : null;
    const termineLe = statut === 'terminee' ? commande.termine_le || f.maintenant() : null;
    db.executer('UPDATE commandes SET statut = ?, erreur = ?, termine_le = ? WHERE id = ?', statut, erreur, termineLe, commande.id);
    noter(req, 'Statut de commande changé', `#${commande.id} → ${STATUTS[statut]}`);
    flash(req, 'succes', `Statut : ${STATUTS[statut]}.`);
  }
  res.redirect(303, `/commandes/${commande.id}`);
});

// ---------- Envoi WhatsApp noté (appelé par le bouton, en arrière-plan) ----------
router.post('/:id/envoye', (req, res) => {
  const id = idParam(req);
  const changement = id ? db.executer('UPDATE commandes SET envoye_le = ? WHERE id = ?', f.maintenant(), id) : { changes: 0 };
  if (changement.changes) noter(req, 'Vidéo envoyée au client (WhatsApp)', `Commande #${id}`);
  res.json({ ok: changement.changes > 0 });
});

module.exports = router;
