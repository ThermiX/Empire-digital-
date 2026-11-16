// =============================================================
//  routes/offres.js — PAGE 6 : Offres d'abonnement
//   GET  /offres                 liste
//   GET  /offres/nouvelle        formulaire de création
//   POST /offres                 enregistrer
//   GET  /offres/:id/modifier    formulaire de modification
//   POST /offres/:id             enregistrer les modifications
//   POST /offres/:id/basculer    proposer / ne plus proposer
//
//  Changer le prix d'une offre ne modifie pas les paiements passés.
// =============================================================
const express = require('express');
const db = require('../db/database');
const f = require('../lib/format');
const { flash } = require('../lib/securite');
const { noter, idParam, texte } = require('../lib/outils');

const router = express.Router();

function lireFormulaire(req) {
  const b = req.body;
  const valeurs = {
    nom: texte(b.nom, 80),
    prix_saisi: texte(b.prix_fcfa, 20),
    prix_fcfa: f.lireMontant(b.prix_fcfa),
    videos_par_mois: f.lireEntier(b.videos_par_mois),
    duree_jours: f.lireEntier(b.duree_jours),
    description: texte(b.description, 500),
    active: b.active === 'oui',
  };
  const erreurs = {};
  if (!valeurs.nom) erreurs.nom = "Donnez un nom à l'offre (ex. : Pro).";
  if (valeurs.prix_fcfa === null) erreurs.prix_fcfa = 'Indiquez le prix en FCFA (0 pour une offre gratuite).';
  if (valeurs.videos_par_mois === null || valeurs.videos_par_mois > 1000) erreurs.videos_par_mois = 'Nombre de vidéos entre 0 et 1000.';
  if (!valeurs.duree_jours || valeurs.duree_jours > 366) erreurs.duree_jours = 'Durée entre 1 et 366 jours.';
  return { valeurs, erreurs };
}

function afficherFormulaire(res, { offre, erreurs = {}, nouveau }) {
  res.render('offres/formulaire', { titre: nouveau ? 'Nouvelle offre' : `Modifier ${offre.nom}`, rubrique: 'offres', offre, erreurs, nouveau });
}

// ---------- Liste ----------
router.get('/', (req, res) => {
  const offres = db.tous(
    `SELECT o.*,
            (SELECT COUNT(*) FROM clients c WHERE c.offre_id = o.id AND c.statut = 'actif') AS nb_actifs,
            (SELECT COUNT(*) FROM clients c WHERE c.offre_id = o.id) AS nb_clients
     FROM offres o ORDER BY o.active DESC, o.prix_fcfa`,
  );
  res.render('offres/liste', { titre: 'Offres', rubrique: 'offres', offres });
});

// ---------- Création ----------
router.get('/nouvelle', (req, res) => {
  afficherFormulaire(res, { offre: { active: 1, duree_jours: 30 }, nouveau: true });
});

router.post('/', (req, res) => {
  const { valeurs, erreurs } = lireFormulaire(req);
  if (Object.keys(erreurs).length) return afficherFormulaire(res, { offre: valeurs, erreurs, nouveau: true });
  const { lastInsertRowid } = db.executer(
    `INSERT INTO offres (nom, prix_fcfa, videos_par_mois, duree_jours, description, active, cree_le) VALUES (?, ?, ?, ?, ?, ?, ?)`,
    valeurs.nom,
    valeurs.prix_fcfa,
    valeurs.videos_par_mois,
    valeurs.duree_jours,
    valeurs.description,
    valeurs.active,
    f.maintenant(),
  );
  noter(req, 'Offre créée', `${valeurs.nom} — ${f.fcfa(valeurs.prix_fcfa)}`);
  flash(req, 'succes', `Offre « ${valeurs.nom} » créée.`);
  res.redirect(303, `/offres#offre-${lastInsertRowid}`);
});

// ---------- Modification ----------
router.get('/:id/modifier', (req, res, next) => {
  const offre = idParam(req) && db.un('SELECT * FROM offres WHERE id = ?', idParam(req));
  if (!offre) return next();
  afficherFormulaire(res, { offre, nouveau: false });
});

router.post('/:id', (req, res, next) => {
  const offre = idParam(req) && db.un('SELECT * FROM offres WHERE id = ?', idParam(req));
  if (!offre) return next();
  const { valeurs, erreurs } = lireFormulaire(req);
  if (Object.keys(erreurs).length) return afficherFormulaire(res, { offre: { ...valeurs, id: offre.id, est_demo: offre.est_demo }, erreurs, nouveau: false });
  db.executer(
    'UPDATE offres SET nom = ?, prix_fcfa = ?, videos_par_mois = ?, duree_jours = ?, description = ?, active = ? WHERE id = ?',
    valeurs.nom,
    valeurs.prix_fcfa,
    valeurs.videos_par_mois,
    valeurs.duree_jours,
    valeurs.description,
    valeurs.active,
    offre.id,
  );
  noter(req, 'Offre modifiée', `${valeurs.nom} — ${f.fcfa(valeurs.prix_fcfa)}`);
  flash(req, 'succes', 'Offre enregistrée.');
  res.redirect(303, `/offres#offre-${offre.id}`);
});

// ---------- Proposer / ne plus proposer ----------
router.post('/:id/basculer', (req, res, next) => {
  const offre = idParam(req) && db.un('SELECT * FROM offres WHERE id = ?', idParam(req));
  if (!offre) return next();
  const active = offre.active ? 0 : 1;
  db.executer('UPDATE offres SET active = ? WHERE id = ?', active, offre.id);
  noter(req, active ? 'Offre réactivée' : 'Offre retirée', offre.nom);
  flash(req, 'succes', active ? `« ${offre.nom} » est de nouveau proposée.` : `« ${offre.nom} » n'est plus proposée. Les abonnés actuels la gardent.`);
  res.redirect(303, `/offres#offre-${offre.id}`);
});

module.exports = router;
