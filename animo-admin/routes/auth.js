// =============================================================
//  routes/auth.js — Connexion et déconnexion de l'admin.
//   GET  /connexion    formulaire
//   POST /connexion    vérification email + mot de passe
//   POST /deconnexion  fermeture de la session
//   POST /ping         "Rester connecté" (repousse la déconnexion auto)
// =============================================================
const express = require('express');
const db = require('../db/database');
const securite = require('../lib/securite');
const f = require('../lib/format');
const { noter } = require('../lib/outils');

const router = express.Router();

// Messages affichés en haut du formulaire selon la raison
const RAISONS = {
  inactivite: 'Vous avez été déconnecté automatiquement après une période sans activité.',
  deconnecte: 'Vous êtes bien déconnecté. À bientôt !',
};

function afficherConnexion(req, res, { erreur = null, email = '' } = {}) {
  res.set('Cache-Control', 'no-store');
  res.render('connexion', {
    titre: 'Connexion',
    erreur,
    email,
    info: RAISONS[req.query.raison] || null,
    suite: securite.adresseDeRetourSure(req.query.suite || req.body?.suite),
    aucunAdmin: db.valeur('SELECT COUNT(*) FROM admins') === 0,
  });
}

router.get('/connexion', (req, res) => {
  if (req.admin) return res.redirect('/');
  afficherConnexion(req, res);
});

router.post('/connexion', async (req, res) => {
  const email = String(req.body?.email || '').trim().toLowerCase().slice(0, 200);
  const motDePasse = String(req.body?.mot_de_passe || '').slice(0, 200);
  const ip = req.ip || 'inconnue';

  if (securite.tropDeTentatives(ip, email)) {
    res.status(429);
    return afficherConnexion(req, res, {
      email,
      erreur: 'Trop de tentatives. Par sécurité, attendez 15 minutes avant de réessayer.',
    });
  }

  const admin = db.un('SELECT * FROM admins WHERE email = ?', email);
  const correct = admin
    ? await securite.verifierMotDePasse(motDePasse, admin.mot_de_passe_hash)
    : await securite.verifierSansCompte(motDePasse);

  if (!correct) {
    securite.noterEchec(ip, email);
    res.status(401);
    // Message volontairement vague : on ne dit pas si l'email existe
    return afficherConnexion(req, res, { email, erreur: 'Email ou mot de passe incorrect.' });
  }

  securite.effacerEchecs(ip, email);
  securite.ouvrirSession(req, res, admin.id);
  db.executer('UPDATE admins SET derniere_connexion = ? WHERE id = ?', f.maintenant(), admin.id);
  noter({ admin: { id: admin.id } }, 'Connexion', `Depuis ${ip}`);
  res.redirect(303, securite.adresseDeRetourSure(req.body?.suite));
});

router.post('/deconnexion', securite.exigerConnexion, securite.verifierCsrf, (req, res) => {
  const raison = req.body?.raison === 'inactivite' ? 'inactivite' : 'deconnecte';
  noter(req, 'Déconnexion', raison === 'inactivite' ? 'Automatique (inactivité)' : '');
  securite.fermerSession(req, res);
  res.redirect(303, `/connexion?raison=${raison}`);
});

// Appelé par le navigateur quand l'admin est actif sur la page :
// la session a déjà été prolongée par chargerSession.
router.post('/ping', securite.exigerConnexion, securite.verifierCsrf, (req, res) => {
  res.set('Cache-Control', 'no-store');
  res.json({ ok: true, inactiviteMs: res.locals.inactiviteMs });
});

module.exports = router;
