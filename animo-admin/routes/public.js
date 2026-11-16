// =============================================================
//  routes/public.js — Page vidéo envoyée au client par WhatsApp.
//   GET /v/:jeton         page avec le lecteur + bouton télécharger
//   GET /v/:jeton/video   le fichier vidéo
//
//  Le jeton est long et aléatoire : seul le client qui a reçu le
//  lien peut voir sa vidéo. Aucune autre donnée n'est accessible.
// =============================================================
const express = require('express');
const db = require('../db/database');
const fichiers = require('../lib/fichiers');

const router = express.Router();

function trouverCommande(jeton) {
  if (!/^[A-Za-z0-9_-]{20,64}$/.test(String(jeton))) return null;
  return db.un(
    `SELECT c.id, c.fichier_video, cl.nom AS client_nom, g.nom AS gabarit_nom
     FROM commandes c
     JOIN clients cl ON cl.id = c.client_id
     LEFT JOIN gabarits g ON g.id = c.gabarit_id
     WHERE c.jeton_partage = ? AND c.fichier_video IS NOT NULL`,
    jeton,
  );
}

router.get('/v/:jeton', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  const commande = trouverCommande(req.params.jeton);
  if (!commande) {
    return res.status(404).render('video-publique', { titre: 'Vidéo introuvable', commande: null, jeton: null, pagePublique: true });
  }
  res.render('video-publique', { titre: 'Votre vidéo', commande, jeton: req.params.jeton, pagePublique: true });
});

router.get('/v/:jeton/video', (req, res) => {
  res.set('X-Robots-Tag', 'noindex, nofollow');
  const commande = trouverCommande(req.params.jeton);
  const chemin = commande && fichiers.chemin('videos', commande.fichier_video);
  if (!chemin) return res.status(404).send('Vidéo introuvable');
  if (req.query.telecharger) {
    const extension = commande.fichier_video.split('.').pop();
    return res.download(chemin, `video-${commande.id}.${extension}`);
  }
  res.sendFile(chemin);
});

module.exports = router;
