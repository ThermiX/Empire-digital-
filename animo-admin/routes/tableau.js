// =============================================================
//  routes/tableau.js — PAGE 1 : Tableau de bord
//   GET /            chiffres réels (sans les données DÉMO)
//   GET /?vue=demo   chiffres en incluant les données DÉMO
// =============================================================
const express = require('express');
const db = require('../db/database');
const f = require('../lib/format');
const { serieJournaliere } = require('../lib/graphique');

const router = express.Router();

router.get('/', (req, res) => {
  const existeDemo = db.valeur(
    `SELECT EXISTS (SELECT 1 FROM clients WHERE est_demo = 1)
         OR EXISTS (SELECT 1 FROM offres WHERE est_demo = 1)
         OR EXISTS (SELECT 1 FROM gabarits WHERE est_demo = 1)`,
  );
  const avecDemo = Boolean(existeDemo) && req.query.vue === 'demo';

  // Filtre ajouté à chaque requête : on exclut les lignes DÉMO
  // (texte fixe écrit ici, jamais tapé par l'utilisateur)
  const sansDemo = avecDemo ? '' : 'AND est_demo = 0';

  const auj = f.aujourdhui();
  const demain = f.ajouterJours(auj, 1);
  const debutMois = f.debutDuMois();
  const debut30Jours = f.ajouterJours(auj, -29);

  // ---- Les chiffres clés ----
  const chiffres = {
    clients: db.valeur(`SELECT COUNT(*) FROM clients WHERE 1 = 1 ${sansDemo}`),
    essais: db.valeur(`SELECT COUNT(*) FROM clients WHERE statut = 'essai' ${sansDemo}`),
    actifs: db.valeur(`SELECT COUNT(*) FROM clients WHERE statut = 'actif' ${sansDemo}`),
    videosJour: db.valeur(
      `SELECT COUNT(*) FROM commandes WHERE statut = 'terminee' AND termine_le >= ? AND termine_le < ? ${sansDemo}`,
      auj,
      demain,
    ),
    videosMois: db.valeur(`SELECT COUNT(*) FROM commandes WHERE statut = 'terminee' AND termine_le >= ? ${sansDemo}`, debutMois),
    revenusMois: db.valeur(
      `SELECT COALESCE(SUM(montant_fcfa), 0) FROM paiements WHERE statut = 'valide' AND date_paiement >= ? ${sansDemo}`,
      debutMois,
    ),
    paiementsMois: db.valeur(`SELECT COUNT(*) FROM paiements WHERE statut = 'valide' AND date_paiement >= ? ${sansDemo}`, debutMois),
  };

  // ---- Ce qui demande une action ----
  const aTraiter = {
    paiements: db.valeur(`SELECT COUNT(*) FROM paiements WHERE statut = 'en_attente' ${sansDemo}`),
    attente: db.valeur(`SELECT COUNT(*) FROM commandes WHERE statut = 'en_attente' ${sansDemo}`),
    echecs: db.valeur(`SELECT COUNT(*) FROM commandes WHERE statut = 'echec' ${sansDemo}`),
    bientotExpires: db.valeur(
      `SELECT COUNT(*) FROM clients WHERE statut = 'actif' AND fin_abonnement <= ? ${sansDemo}`,
      f.ajouterJours(auj, 3),
    ),
  };

  // ---- Graphiques des 30 derniers jours ----
  const videos30 = db.tous(
    `SELECT substr(termine_le, 1, 10) AS jour, COUNT(*) AS valeur
     FROM commandes WHERE statut = 'terminee' AND termine_le >= ? ${sansDemo}
     GROUP BY jour`,
    debut30Jours,
  );
  const revenus30 = db.tous(
    `SELECT substr(date_paiement, 1, 10) AS jour, SUM(montant_fcfa) AS valeur
     FROM paiements WHERE statut = 'valide' AND date_paiement >= ? ${sansDemo}
     GROUP BY jour`,
    debut30Jours,
  );

  // ---- Premiers pas (tant que rien n'est configuré) ----
  const demarrage = {
    offres: db.valeur('SELECT COUNT(*) FROM offres WHERE est_demo = 0'),
    gabarits: db.valeur('SELECT COUNT(*) FROM gabarits WHERE est_demo = 0'),
    clients: db.valeur('SELECT COUNT(*) FROM clients WHERE est_demo = 0'),
  };

  res.render('tableau', {
    titre: 'Tableau de bord',
    rubrique: 'tableau',
    existeDemo: Boolean(existeDemo),
    avecDemo,
    chiffres,
    aTraiter,
    demarrage,
    graphiqueVideos: serieJournaliere(videos30, { entier: true, unite: (n) => f.pluriel(n, 'vidéo') }),
    graphiqueRevenus: serieJournaliere(revenus30, { entier: false, unite: f.fcfa }),
  });
});

module.exports = router;
