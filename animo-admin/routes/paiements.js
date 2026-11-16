// =============================================================
//  routes/paiements.js — PAGE 5 : Paiements (FCFA)
//  Au début, le Mobile Money est vérifié à la main :
//  1. le client paie et envoie sa capture sur WhatsApp
//  2. vous enregistrez le paiement (ou il arrive "en attente")
//  3. vous vérifiez sur votre téléphone (SMS / appli Mobile Money)
//  4. « Valider le paiement » + capture de preuve
//     → l'abonnement du client est activé ou prolongé
//
//   GET  /paiements                 liste filtrable
//   GET  /paiements/nouveau         enregistrer un paiement
//   POST /paiements                 (avec capture facultative)
//   GET  /paiements/:id             détail + validation
//   POST /paiements/:id/valider     valider (capture obligatoire)
//   POST /paiements/:id/refuser     refuser (avec motif)
// =============================================================
const express = require('express');
const db = require('../db/database');
const config = require('../config');
const f = require('../lib/format');
const fichiers = require('../lib/fichiers');
const abonnements = require('../lib/abonnements');
const { flash } = require('../lib/securite');
const { noter, idParam, motifRecherche, pagination, texte } = require('../lib/outils');

const router = express.Router();

const STATUTS = { en_attente: 'À valider', valide: 'Validé', refuse: 'Refusé' };

function chargerPaiement(id) {
  return db.un(
    `SELECT p.*, c.nom AS client_nom, c.whatsapp AS client_whatsapp, c.statut AS client_statut, c.fin_abonnement,
            o.nom AS offre_nom, o.duree_jours, o.prix_fcfa AS offre_prix, a.email AS traite_par_email
     FROM paiements p
     JOIN clients c ON c.id = p.client_id
     LEFT JOIN offres o ON o.id = p.offre_id
     LEFT JOIN admins a ON a.id = p.traite_par
     WHERE p.id = ?`,
    id,
  );
}

/** Valide un paiement : statut, preuve, et abonnement du client */
function validerPaiement(req, paiement, { preuve, reference, appliquer }) {
  let message = `Paiement de ${f.fcfa(paiement.montant_fcfa)} validé.`;
  db.transaction(() => {
    db.executer(
      `UPDATE paiements SET statut = 'valide', preuve = ?, reference = ?, traite_le = ?, traite_par = ? WHERE id = ?`,
      preuve,
      reference,
      f.maintenant(),
      req.admin.id,
      paiement.id,
    );
    if (appliquer && paiement.offre_id) {
      const client = db.un('SELECT * FROM clients WHERE id = ?', paiement.client_id);
      const offre = db.un('SELECT * FROM offres WHERE id = ?', paiement.offre_id);
      const fin = abonnements.appliquerPaiement(client, offre);
      message += ` ${client.nom} est actif (${offre.nom}) jusqu'au ${f.date(fin)}.`;
    }
  });
  noter(req, 'Paiement validé', `#${paiement.id} — ${paiement.client_nom} — ${f.fcfa(paiement.montant_fcfa)}`);
  return message;
}

// ---------- Liste ----------
router.get('/', (req, res) => {
  const q = texte(req.query.q, 100);
  const statut = Object.hasOwn(STATUTS, req.query.statut) ? req.query.statut : '';

  const conditions = [];
  const params = [];
  if (q) {
    conditions.push(`(c.nom LIKE ? ESCAPE '\\' OR p.reference LIKE ? ESCAPE '\\' OR p.numero_payeur LIKE ? ESCAPE '\\')`);
    params.push(motifRecherche(q), motifRecherche(q), motifRecherche(q.replace(/\s/g, '')));
  }
  if (statut) {
    conditions.push('p.statut = ?');
    params.push(statut);
  }
  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  const jointures = 'FROM paiements p JOIN clients c ON c.id = p.client_id LEFT JOIN offres o ON o.id = p.offre_id';

  const total = db.valeur(`SELECT COUNT(*) ${jointures} ${where}`, ...params);
  const pages = pagination(req, total);
  const paiements = db.tous(
    `SELECT p.*, c.nom AS client_nom, o.nom AS offre_nom ${jointures} ${where}
     ORDER BY (p.statut = 'en_attente') DESC, p.date_paiement DESC, p.id DESC LIMIT ? OFFSET ?`,
    ...params,
    pages.parPage,
    pages.decalage,
  );
  const compteurs = Object.fromEntries(db.tous('SELECT statut, COUNT(*) AS n FROM paiements GROUP BY statut').map((l) => [l.statut, l.n]));

  // Totaux du mois : réels et DÉMO séparés (jamais mélangés)
  const totaux = Object.fromEntries(
    db
      .tous(
        `SELECT est_demo, COALESCE(SUM(montant_fcfa), 0) AS total FROM paiements
         WHERE statut = 'valide' AND date_paiement >= ? GROUP BY est_demo`,
        f.debutDuMois(),
      )
      .map((l) => [l.est_demo ? 'demo' : 'reel', l.total]),
  );

  res.render('paiements/liste', { titre: 'Paiements', rubrique: 'paiements', paiements, q, statut, STATUTS, compteurs, pages, totaux });
});

// ---------- Nouveau paiement ----------
function afficherFormulaire(req, res, { valeurs = {}, erreurs = {} } = {}) {
  const clientId = Number(req.query.client_id) || '';
  const client = clientId ? db.un('SELECT offre_id FROM clients WHERE id = ?', clientId) : null;
  res.render('paiements/formulaire', {
    titre: 'Enregistrer un paiement',
    rubrique: 'paiements',
    valeurs: { client_id: clientId, offre_id: client?.offre_id || '', date_paiement: f.aujourdhui(), moyen: config.moyensPaiement[0], ...valeurs },
    erreurs,
    clients: db.tous('SELECT id, nom, whatsapp, est_demo FROM clients ORDER BY nom COLLATE NOCASE'),
    offres: db.tous('SELECT id, nom, prix_fcfa, est_demo FROM offres WHERE active = 1 ORDER BY prix_fcfa'),
  });
}

router.get('/nouveau', (req, res) => afficherFormulaire(req, res));

router.post('/', fichiers.televerser('preuves', 'preuve'), (req, res) => {
  const b = req.body;
  const valeurs = {
    client_id: Number(b.client_id) || null,
    offre_id: Number(b.offre_id) || null,
    montant: texte(b.montant, 20),
    moyen: config.moyensPaiement.includes(b.moyen) ? b.moyen : null,
    reference: texte(b.reference, 80),
    numero_payeur: texte(b.numero_payeur, 30),
    date_paiement: /^\d{4}-\d{2}-\d{2}$/.test(b.date_paiement) ? b.date_paiement : '',
    note: texte(b.note, 1000),
    valider: b.valider === 'oui',
  };
  const montant = f.lireMontant(valeurs.montant);
  const client = valeurs.client_id && db.un('SELECT * FROM clients WHERE id = ?', valeurs.client_id);

  const erreurs = {};
  if (!client) erreurs.client_id = 'Choisissez le client.';
  if (!montant) erreurs.montant = 'Indiquez le montant reçu, en FCFA.';
  if (!valeurs.moyen) erreurs.moyen = 'Choisissez le moyen de paiement.';
  if (!valeurs.date_paiement || valeurs.date_paiement > f.aujourdhui()) erreurs.date_paiement = 'Date invalide.';
  if (valeurs.offre_id && !db.un('SELECT id FROM offres WHERE id = ?', valeurs.offre_id)) erreurs.offre_id = 'Offre inconnue.';
  if (req.erreurFichier) erreurs.preuve = req.erreurFichier;
  if (valeurs.valider && !req.file && !erreurs.preuve) erreurs.preuve = 'Pour valider tout de suite, joignez la capture de preuve.';

  if (Object.keys(erreurs).length) {
    if (req.file) fichiers.supprimer('preuves', req.file.filename);
    return afficherFormulaire(req, res, { valeurs, erreurs });
  }

  // L'heure du jour choisi : maintenant si c'est aujourd'hui, sinon midi
  const date = valeurs.date_paiement === f.aujourdhui() ? f.maintenant() : `${valeurs.date_paiement} 12:00:00`;
  const { lastInsertRowid } = db.executer(
    `INSERT INTO paiements (client_id, offre_id, montant_fcfa, moyen, reference, numero_payeur, preuve, statut, date_paiement, note, est_demo)
     VALUES (?, ?, ?, ?, ?, ?, ?, 'en_attente', ?, ?, ?)`,
    client.id,
    valeurs.offre_id,
    montant,
    valeurs.moyen,
    valeurs.reference,
    valeurs.numero_payeur,
    req.file?.filename,
    date,
    valeurs.note,
    client.est_demo,
  );
  noter(req, 'Paiement enregistré', `#${lastInsertRowid} — ${client.nom} — ${f.fcfa(montant)}`);

  if (valeurs.valider) {
    const paiement = chargerPaiement(lastInsertRowid);
    flash(req, 'succes', validerPaiement(req, paiement, { preuve: req.file.filename, reference: valeurs.reference, appliquer: true }));
  } else {
    flash(req, 'succes', `Paiement de ${f.fcfa(montant)} enregistré : à valider.`);
  }
  res.redirect(303, `/paiements/${lastInsertRowid}`);
});

// ---------- Détail ----------
router.get('/:id', (req, res, next) => {
  const paiement = idParam(req) && chargerPaiement(idParam(req));
  if (!paiement) return next();
  res.render('paiements/fiche', { titre: `Paiement #${paiement.id}`, rubrique: 'paiements', paiement, STATUTS });
});

// ---------- Valider ----------
router.post('/:id/valider', fichiers.televerser('preuves', 'preuve'), (req, res, next) => {
  const paiement = idParam(req) && chargerPaiement(idParam(req));
  if (!paiement) {
    if (req.file) fichiers.supprimer('preuves', req.file.filename);
    return next();
  }
  const retour = `/paiements/${paiement.id}`;
  if (paiement.statut === 'valide') {
    if (req.file) fichiers.supprimer('preuves', req.file.filename);
    flash(req, 'erreur', 'Ce paiement est déjà validé.');
    return res.redirect(303, retour);
  }
  // La capture de preuve est obligatoire (nouvelle, ou déjà jointe avant)
  const preuve = req.file?.filename || paiement.preuve;
  if (!preuve) {
    flash(req, 'erreur', req.erreurFichier || 'Ajoutez la capture de preuve du paiement avant de valider.');
    return res.redirect(303, retour);
  }
  if (req.file && paiement.preuve) fichiers.supprimer('preuves', paiement.preuve);

  const message = validerPaiement(req, paiement, {
    preuve,
    reference: texte(req.body.reference, 80) || paiement.reference,
    appliquer: req.body.appliquer === 'oui',
  });
  flash(req, 'succes', message);
  res.redirect(303, retour);
});

// ---------- Refuser ----------
router.post('/:id/refuser', (req, res, next) => {
  const paiement = idParam(req) && chargerPaiement(idParam(req));
  if (!paiement) return next();
  if (paiement.statut !== 'en_attente') {
    flash(req, 'erreur', 'Seul un paiement « à valider » peut être refusé.');
    return res.redirect(303, `/paiements/${paiement.id}`);
  }
  const motif = texte(req.body.motif, 500) || 'Paiement introuvable sur le compte Mobile Money';
  db.executer(
    `UPDATE paiements SET statut = 'refuse', note = ?, traite_le = ?, traite_par = ? WHERE id = ?`,
    motif,
    f.maintenant(),
    req.admin.id,
    paiement.id,
  );
  noter(req, 'Paiement refusé', `#${paiement.id} — ${paiement.client_nom} — ${motif}`);
  flash(req, 'succes', 'Paiement refusé. Pensez à prévenir le client sur WhatsApp.');
  res.redirect(303, `/paiements/${paiement.id}`);
});

module.exports = router;
