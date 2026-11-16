// =============================================================
//  routes/gabarits.js — PAGE 4 : Gabarits de vidéos
//   GET  /gabarits                  liste
//   GET  /gabarits/nouveau          formulaire d'ajout
//   POST /gabarits                  enregistrer (avec miniature)
//   GET  /gabarits/:id/modifier     formulaire de modification
//   POST /gabarits/:id              enregistrer les modifications
//   POST /gabarits/:id/basculer     activer / désactiver
// =============================================================
const express = require('express');
const db = require('../db/database');
const config = require('../config');
const f = require('../lib/format');
const fichiers = require('../lib/fichiers');
const { flash } = require('../lib/securite');
const { noter, idParam, texte } = require('../lib/outils');

const router = express.Router();

/** Lit le formulaire (y compris la liste des champs client) */
function lireFormulaire(req) {
  const b = req.body;
  // Les champs arrivent en 3 listes parallèles : type, libellé, obligatoire
  const types = [].concat(b.champ_type ?? []);
  const libelles = [].concat(b.champ_libelle ?? []);
  const obligatoires = [].concat(b.champ_obligatoire ?? []);
  const champs = [];
  libelles.forEach((brut, i) => {
    const libelle = texte(brut, 80);
    const type = Object.hasOwn(config.typesChamps, types[i]) ? types[i] : null;
    if (libelle && type) champs.push({ type, libelle, obligatoire: obligatoires[i] !== 'non' });
  });

  const valeurs = {
    nom: texte(b.nom, 100),
    description: texte(b.description, 1000),
    duree_secondes: f.lireEntier(b.duree_secondes, 0),
    format: config.formats.includes(b.format) ? b.format : config.formats[0],
    actif: b.actif === 'oui',
    champs,
  };
  const erreurs = {};
  if (!valeurs.nom) erreurs.nom = 'Donnez un nom au gabarit.';
  if (valeurs.duree_secondes < 3 || valeurs.duree_secondes > 600) erreurs.duree_secondes = 'Durée entre 3 et 600 secondes.';
  if (req.erreurFichier) erreurs.miniature = req.erreurFichier;
  return { valeurs, erreurs };
}

function afficherFormulaire(res, { gabarit, erreurs = {}, nouveau }) {
  // Toujours au moins 2 lignes vides pour ajouter des champs, même sans JavaScript
  const lignes = [...(gabarit.champs || []), { type: 'texte', libelle: '', obligatoire: true }, { type: 'photos', libelle: '', obligatoire: false }];
  res.render('gabarits/formulaire', {
    titre: nouveau ? 'Nouveau gabarit' : `Modifier ${gabarit.nom}`,
    rubrique: 'gabarits',
    gabarit,
    lignes,
    erreurs,
    nouveau,
  });
}

// ---------- Liste ----------
router.get('/', (req, res) => {
  const gabarits = db.tous(
    `SELECT g.*, (SELECT COUNT(*) FROM commandes c WHERE c.gabarit_id = g.id) AS nb_commandes
     FROM gabarits g ORDER BY g.actif DESC, g.nom COLLATE NOCASE`,
  ).map((g) => ({ ...g, champs: f.json(g.champs, []) }));
  res.render('gabarits/liste', { titre: 'Gabarits', rubrique: 'gabarits', gabarits });
});

// ---------- Ajout ----------
router.get('/nouveau', (req, res) => {
  afficherFormulaire(res, {
    gabarit: { actif: 1, duree_secondes: 15, champs: [{ type: 'texte', libelle: 'Nom du commerce', obligatoire: true }, { type: 'logo', libelle: 'Logo', obligatoire: false }] },
    nouveau: true,
  });
});

router.post('/', fichiers.televerser('miniatures', 'miniature'), (req, res) => {
  const { valeurs, erreurs } = lireFormulaire(req);
  if (Object.keys(erreurs).length) {
    if (req.file) fichiers.supprimer('miniatures', req.file.filename);
    return afficherFormulaire(res, { gabarit: valeurs, erreurs, nouveau: true });
  }
  const { lastInsertRowid } = db.executer(
    `INSERT INTO gabarits (nom, description, miniature, duree_secondes, format, champs, actif, cree_le)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
    valeurs.nom,
    valeurs.description,
    req.file?.filename,
    valeurs.duree_secondes,
    valeurs.format,
    JSON.stringify(valeurs.champs),
    valeurs.actif,
    f.maintenant(),
  );
  noter(req, 'Gabarit créé', valeurs.nom);
  flash(req, 'succes', `Gabarit « ${valeurs.nom} » créé.`);
  res.redirect(303, `/gabarits#gabarit-${lastInsertRowid}`);
});

// ---------- Modification ----------
router.get('/:id/modifier', (req, res, next) => {
  const gabarit = idParam(req) && db.un('SELECT * FROM gabarits WHERE id = ?', idParam(req));
  if (!gabarit) return next();
  afficherFormulaire(res, { gabarit: { ...gabarit, champs: f.json(gabarit.champs, []) }, nouveau: false });
});

router.post('/:id', fichiers.televerser('miniatures', 'miniature'), (req, res, next) => {
  const gabarit = idParam(req) && db.un('SELECT * FROM gabarits WHERE id = ?', idParam(req));
  if (!gabarit) {
    if (req.file) fichiers.supprimer('miniatures', req.file.filename);
    return next();
  }
  const { valeurs, erreurs } = lireFormulaire(req);
  if (Object.keys(erreurs).length) {
    if (req.file) fichiers.supprimer('miniatures', req.file.filename);
    return afficherFormulaire(res, { gabarit: { ...valeurs, id: gabarit.id, miniature: gabarit.miniature, est_demo: gabarit.est_demo }, erreurs, nouveau: false });
  }

  // Miniature : nouvelle image, suppression, ou on garde l'ancienne
  let miniature = gabarit.miniature;
  if (req.file) miniature = req.file.filename;
  else if (req.body.retirer_miniature === 'oui') miniature = null;
  if (miniature !== gabarit.miniature) fichiers.supprimer('miniatures', gabarit.miniature);

  db.executer(
    `UPDATE gabarits SET nom = ?, description = ?, miniature = ?, duree_secondes = ?, format = ?, champs = ?, actif = ?, modifie_le = ?
     WHERE id = ?`,
    valeurs.nom,
    valeurs.description,
    miniature,
    valeurs.duree_secondes,
    valeurs.format,
    JSON.stringify(valeurs.champs),
    valeurs.actif,
    f.maintenant(),
    gabarit.id,
  );
  noter(req, 'Gabarit modifié', valeurs.nom);
  flash(req, 'succes', 'Gabarit enregistré.');
  res.redirect(303, `/gabarits#gabarit-${gabarit.id}`);
});

// ---------- Activer / désactiver ----------
router.post('/:id/basculer', (req, res, next) => {
  const gabarit = idParam(req) && db.un('SELECT * FROM gabarits WHERE id = ?', idParam(req));
  if (!gabarit) return next();
  const actif = gabarit.actif ? 0 : 1;
  db.executer('UPDATE gabarits SET actif = ?, modifie_le = ? WHERE id = ?', actif, f.maintenant(), gabarit.id);
  noter(req, actif ? 'Gabarit activé' : 'Gabarit désactivé', gabarit.nom);
  flash(req, 'succes', actif ? `« ${gabarit.nom} » est proposé aux clients.` : `« ${gabarit.nom} » n'est plus proposé aux clients.`);
  res.redirect(303, `/gabarits#gabarit-${gabarit.id}`);
});

module.exports = router;
