// =============================================================
//  routes/clients.js — PAGE 2 : Clients
//   GET  /clients                 liste + recherche + filtres
//   GET  /clients/nouveau         formulaire d'ajout
//   POST /clients                 enregistrer un nouveau client
//   GET  /clients/:id             fiche (vidéos + paiements)
//   GET  /clients/:id/modifier    formulaire de modification
//   POST /clients/:id             enregistrer les modifications
//   POST /clients/:id/activer     → statut actif
//   POST /clients/:id/suspendre   → statut suspendu
//   POST /clients/:id/prolonger   → ajoute des jours
//   POST /clients/:id/supprimer   → supprime (si aucun paiement validé)
// =============================================================
const express = require('express');
const db = require('../db/database');
const f = require('../lib/format');
const abonnements = require('../lib/abonnements');
const fichiers = require('../lib/fichiers');
const { flash } = require('../lib/securite');
const { noter, idParam, motifRecherche, pagination, texte, lienWhatsApp } = require('../lib/outils');

const router = express.Router();

const STATUTS = { essai: 'Essai', actif: 'Actif', expire: 'Expiré', suspendu: 'Suspendu' };

function chargerClient(id) {
  return db.un(
    `SELECT c.*, o.nom AS offre_nom, o.prix_fcfa AS offre_prix, o.videos_par_mois, o.duree_jours
     FROM clients c LEFT JOIN offres o ON o.id = c.offre_id WHERE c.id = ?`,
    id,
  );
}

/** Lit et vérifie le formulaire client. Renvoie { valeurs, erreurs } */
function lireFormulaire(req, res, idActuel = 0) {
  const b = req.body;
  const valeurs = {
    nom: texte(b.nom, 120),
    whatsapp_saisi: texte(b.whatsapp, 30),
    activite: texte(b.activite, 80),
    ville: texte(b.ville, 80),
    offre_id: Number(b.offre_id) || null,
    notes: texte(b.notes, 2000),
  };
  valeurs.whatsapp = f.normaliserWhatsapp(valeurs.whatsapp_saisi, res.locals.parametres.indicatif_pays);

  const erreurs = {};
  if (!valeurs.nom) erreurs.nom = 'Indiquez le nom du client ou de son commerce.';
  if (!valeurs.whatsapp) {
    erreurs.whatsapp = 'Numéro invalide. Exemple : 07 00 00 00 00 ou +225 07 00 00 00 00.';
  } else {
    const doublon = db.un('SELECT nom FROM clients WHERE whatsapp = ? AND id != ?', valeurs.whatsapp, idActuel);
    if (doublon) erreurs.whatsapp = `Ce numéro est déjà celui de « ${doublon.nom} ».`;
  }
  if (valeurs.offre_id && !db.un('SELECT id FROM offres WHERE id = ?', valeurs.offre_id)) erreurs.offre_id = 'Offre inconnue.';
  return { valeurs, erreurs };
}

// Attention : la page reçoit "leClient" et non "client" (mot réservé par EJS).
function afficherFormulaire(res, { client, erreurs = {}, nouveau }) {
  res.render('clients/formulaire', {
    titre: nouveau ? 'Nouveau client' : `Modifier ${client.nom}`,
    rubrique: 'clients',
    leClient: client,
    erreurs,
    nouveau,
    offres: db.tous('SELECT id, nom, prix_fcfa, est_demo FROM offres WHERE active = 1 OR id = ? ORDER BY prix_fcfa', client.offre_id || 0),
  });
}

// ---------- Liste ----------
router.get('/', (req, res) => {
  const q = texte(req.query.q, 100);
  const statut = Object.hasOwn(STATUTS, req.query.statut) || req.query.statut === 'bientot' ? req.query.statut : '';

  const conditions = [];
  const params = [];
  if (q) {
    // Recherche dans le nom, la ville et le numéro (espaces ignorés)
    conditions.push(`(c.nom LIKE ? ESCAPE '\\' OR c.ville LIKE ? ESCAPE '\\' OR c.whatsapp LIKE ? ESCAPE '\\')`);
    params.push(motifRecherche(q), motifRecherche(q), motifRecherche(q.replace(/[\s.\-()]/g, '')));
  }
  if (statut === 'bientot') {
    conditions.push(`c.statut = 'actif' AND c.fin_abonnement <= ?`);
    params.push(f.ajouterJours(f.aujourdhui(), 3));
  } else if (statut) {
    conditions.push('c.statut = ?');
    params.push(statut);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';

  const total = db.valeur(`SELECT COUNT(*) FROM clients c ${where}`, ...params);
  const pages = pagination(req, total);
  const clients = db.tous(
    `SELECT c.*, o.nom AS offre_nom FROM clients c LEFT JOIN offres o ON o.id = c.offre_id
     ${where} ORDER BY c.date_inscription DESC, c.id DESC LIMIT ? OFFSET ?`,
    ...params,
    pages.parPage,
    pages.decalage,
  );
  const compteurs = Object.fromEntries(db.tous('SELECT statut, COUNT(*) AS n FROM clients GROUP BY statut').map((l) => [l.statut, l.n]));

  res.render('clients/liste', { titre: 'Clients', rubrique: 'clients', clients, q, statut, STATUTS, compteurs, pages });
});

// ---------- Ajout ----------
router.get('/nouveau', (req, res) => {
  afficherFormulaire(res, { client: {}, nouveau: true });
});

router.post('/', (req, res) => {
  const { valeurs, erreurs } = lireFormulaire(req, res);
  if (Object.keys(erreurs).length) return afficherFormulaire(res, { client: valeurs, erreurs, nouveau: true });

  // Un nouveau client commence en période d'essai
  const jours = Math.max(1, Number(res.locals.parametres.duree_essai_jours) || 3);
  const fin = f.ajouterJours(f.aujourdhui(), jours - 1);
  const { lastInsertRowid } = db.executer(
    `INSERT INTO clients (nom, whatsapp, activite, ville, offre_id, notes, statut, date_inscription, fin_abonnement)
     VALUES (?, ?, ?, ?, ?, ?, 'essai', ?, ?)`,
    valeurs.nom,
    valeurs.whatsapp,
    valeurs.activite,
    valeurs.ville,
    valeurs.offre_id,
    valeurs.notes,
    f.maintenant(),
    fin,
  );
  noter(req, 'Client ajouté', valeurs.nom);
  flash(req, 'succes', `${valeurs.nom} est ajouté, en essai jusqu'au ${f.date(fin)}.`);
  res.redirect(303, `/clients/${lastInsertRowid}`);
});

// ---------- Fiche ----------
router.get('/:id', (req, res, next) => {
  const id = idParam(req);
  const client = id && chargerClient(id);
  if (!client) return next();

  const commandes = db.tous(
    `SELECT c.*, g.nom AS gabarit_nom FROM commandes c LEFT JOIN gabarits g ON g.id = c.gabarit_id
     WHERE c.client_id = ? ORDER BY c.cree_le DESC LIMIT 50`,
    id,
  );
  const paiements = db.tous(
    `SELECT p.*, o.nom AS offre_nom FROM paiements p LEFT JOIN offres o ON o.id = p.offre_id
     WHERE p.client_id = ? ORDER BY p.date_paiement DESC, p.id DESC`,
    id,
  );
  const auj = f.aujourdhui();

  res.render('clients/fiche', {
    titre: client.nom,
    rubrique: 'clients',
    leClient: client, // pas "client" : mot réservé par EJS
    STATUTS,
    commandes,
    paiements,
    totalPaye: paiements.filter((p) => p.statut === 'valide').reduce((s, p) => s + p.montant_fcfa, 0),
    videosMois: abonnements.videosDuMois(id),
    joursRestants: client.fin_abonnement ? f.ecartJours(auj, client.fin_abonnement) + 1 : null,
    offres: db.tous('SELECT * FROM offres WHERE active = 1 OR id = ? ORDER BY prix_fcfa', client.offre_id || 0),
    lienWhatsApp: lienWhatsApp(client.whatsapp),
  });
});

// ---------- Modification ----------
router.get('/:id/modifier', (req, res, next) => {
  const client = idParam(req) && chargerClient(idParam(req));
  if (!client) return next();
  afficherFormulaire(res, { client: { ...client, whatsapp_saisi: client.whatsapp }, nouveau: false });
});

router.post('/:id', (req, res, next) => {
  const id = idParam(req);
  const client = id && chargerClient(id);
  if (!client) return next();

  const { valeurs, erreurs } = lireFormulaire(req, res, id);
  if (Object.keys(erreurs).length) return afficherFormulaire(res, { client: { ...valeurs, id }, erreurs, nouveau: false });

  db.executer(
    'UPDATE clients SET nom = ?, whatsapp = ?, activite = ?, ville = ?, offre_id = ?, notes = ? WHERE id = ?',
    valeurs.nom,
    valeurs.whatsapp,
    valeurs.activite,
    valeurs.ville,
    valeurs.offre_id,
    valeurs.notes,
    id,
  );
  noter(req, 'Client modifié', valeurs.nom);
  flash(req, 'succes', 'Modifications enregistrées.');
  res.redirect(303, `/clients/${id}`);
});

// ---------- Actions : activer / suspendre / prolonger ----------
router.post('/:id/activer', (req, res, next) => {
  const client = idParam(req) && chargerClient(idParam(req));
  if (!client) return next();
  const offre = db.un('SELECT * FROM offres WHERE id = ?', Number(req.body.offre_id) || 0);
  if (!offre) {
    flash(req, 'erreur', "Choisissez l'offre à activer.");
    return res.redirect(303, `/clients/${client.id}`);
  }
  const fin = abonnements.activer(client, offre);
  noter(req, 'Client activé', `${client.nom} — ${offre.nom}, jusqu'au ${f.date(fin)}`);
  flash(req, 'succes', `${client.nom} est actif (${offre.nom}) jusqu'au ${f.date(fin)}.`);
  res.redirect(303, `/clients/${client.id}`);
});

router.post('/:id/suspendre', (req, res, next) => {
  const client = idParam(req) && chargerClient(idParam(req));
  if (!client) return next();
  abonnements.suspendre(client);
  noter(req, 'Client suspendu', client.nom);
  flash(req, 'succes', `${client.nom} est suspendu. Il ne peut plus commander de vidéos.`);
  res.redirect(303, `/clients/${client.id}`);
});

router.post('/:id/prolonger', (req, res, next) => {
  const client = idParam(req) && chargerClient(idParam(req));
  if (!client) return next();
  const jours = f.lireEntier(req.body.jours, 0);
  if (jours < 1 || jours > 366) {
    flash(req, 'erreur', 'Nombre de jours invalide (entre 1 et 366).');
    return res.redirect(303, `/clients/${client.id}`);
  }
  const fin = abonnements.prolonger(client, jours);
  noter(req, 'Abonnement prolongé', `${client.nom} : +${jours} j, jusqu'au ${f.date(fin)}`);
  flash(req, 'succes', `Prolongé de ${jours} jours : jusqu'au ${f.date(fin)}.`);
  res.redirect(303, `/clients/${client.id}`);
});

// ---------- Suppression (erreur de saisie, client test…) ----------
router.post('/:id/supprimer', (req, res, next) => {
  const client = idParam(req) && chargerClient(idParam(req));
  if (!client) return next();
  if (db.valeur(`SELECT COUNT(*) FROM paiements WHERE client_id = ? AND statut = 'valide'`, client.id) > 0) {
    flash(req, 'erreur', 'Impossible : ce client a des paiements validés (gardés pour la comptabilité). Suspendez-le plutôt.');
    return res.redirect(303, `/clients/${client.id}`);
  }
  // Fichiers à effacer (seulement s'ils ne servent à personne d'autre)
  const videos = db.tous(
    `SELECT DISTINCT fichier_video AS nom FROM commandes WHERE client_id = ? AND fichier_video IS NOT NULL
     AND fichier_video NOT IN (SELECT fichier_video FROM commandes WHERE client_id != ? AND fichier_video IS NOT NULL)`,
    client.id,
    client.id,
  );
  const preuves = db.tous('SELECT preuve AS nom FROM paiements WHERE client_id = ? AND preuve IS NOT NULL', client.id);
  db.executer('DELETE FROM clients WHERE id = ?', client.id); // commandes et paiements suivent (ON DELETE CASCADE)
  videos.forEach((v) => fichiers.supprimer('videos', v.nom));
  preuves.forEach((p) => fichiers.supprimer('preuves', p.nom));
  noter(req, 'Client supprimé', client.nom);
  flash(req, 'succes', `${client.nom} a été supprimé.`);
  res.redirect(303, '/clients');
});

module.exports = router;
