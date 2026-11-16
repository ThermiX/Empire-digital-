// =============================================================
//  routes/fichiers.js — Affiche les fichiers privés (connexion
//  obligatoire) : preuves de paiement, miniatures, vidéos.
//   GET /fichiers/:dossier/:nom
// =============================================================
const express = require('express');
const fichiers = require('../lib/fichiers');

const router = express.Router();

router.get('/:dossier/:nom', (req, res) => {
  const chemin = fichiers.chemin(req.params.dossier, req.params.nom);
  if (!chemin) return res.status(404).send('Fichier introuvable');
  // sendFile gère la lecture par morceaux (avancer dans une vidéo)
  res.sendFile(chemin, { headers: { 'Cache-Control': 'private, max-age=3600' } }, (erreur) => {
    if (erreur && !res.headersSent) res.status(404).send('Fichier introuvable');
  });
});

module.exports = router;
