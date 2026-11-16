// =============================================================
//  lib/abonnements.js — Règles des abonnements clients.
//
//  Statuts possibles d'un client :
//   essai    : période d'essai gratuite (durée dans Paramètres)
//   actif    : abonnement payé en cours
//   expire   : date de fin dépassée (mis à jour automatiquement)
//   suspendu : bloqué à la main par l'admin
//
//  fin_abonnement = DERNIER jour couvert (inclus).
// =============================================================
const db = require('../db/database');
const f = require('./format');

/** Passe en "expire" les clients dont la date de fin est dépassée */
function mettreAJourExpirations() {
  return db.executer(
    `UPDATE clients SET statut = 'expire'
     WHERE statut IN ('actif', 'essai') AND fin_abonnement IS NOT NULL AND fin_abonnement < ?`,
    f.aujourdhui(),
  ).changes;
}

// Middleware : vérifie les expirations au plus une fois par minute
let derniereVerification = 0;
function verifierExpirations(req, res, next) {
  if (Date.now() - derniereVerification > 60_000) {
    derniereVerification = Date.now();
    mettreAJourExpirations();
  }
  next();
}

/**
 * ACTIVER : le client passe "actif" avec l'offre choisie.
 *  - client suspendu dont la période n'est pas finie → on reprend, même date de fin
 *  - sinon → nouvelle période qui commence aujourd'hui
 * Renvoie la nouvelle date de fin.
 */
function activer(client, offre) {
  const auj = f.aujourdhui();
  const reprise = client.statut === 'suspendu' && client.fin_abonnement && client.fin_abonnement >= auj;
  const fin = reprise ? client.fin_abonnement : f.ajouterJours(auj, offre.duree_jours - 1);
  db.executer(`UPDATE clients SET statut = 'actif', offre_id = ?, fin_abonnement = ? WHERE id = ?`, offre.id, fin, client.id);
  return fin;
}

/**
 * PROLONGER : ajoute des jours à la date de fin.
 * Si la date est déjà passée, on repart d'aujourd'hui.
 * Un client expiré redevient actif (ou "essai" s'il n'a pas d'offre).
 * Un client suspendu reste suspendu.
 */
function prolonger(client, jours) {
  const auj = f.aujourdhui();
  const fin =
    client.fin_abonnement && client.fin_abonnement >= auj
      ? f.ajouterJours(client.fin_abonnement, jours)
      : f.ajouterJours(auj, jours - 1);
  let statut = client.statut;
  if (statut === 'expire') statut = client.offre_id ? 'actif' : 'essai';
  db.executer('UPDATE clients SET fin_abonnement = ?, statut = ? WHERE id = ?', fin, statut, client.id);
  return fin;
}

/** SUSPENDRE : bloque le client (les dates sont gardées) */
function suspendre(client) {
  db.executer(`UPDATE clients SET statut = 'suspendu' WHERE id = ?`, client.id);
}

/**
 * Paiement validé : démarre ou prolonge l'abonnement payé.
 *  - abonnement payé encore en cours → on ajoute la durée de l'offre à la fin
 *  - sinon (essai, expiré, suspendu…) → nouvelle période dès aujourd'hui
 */
function appliquerPaiement(client, offre) {
  const auj = f.aujourdhui();
  const enCours = client.statut === 'actif' && client.fin_abonnement && client.fin_abonnement >= auj;
  const fin = enCours ? f.ajouterJours(client.fin_abonnement, offre.duree_jours) : f.ajouterJours(auj, offre.duree_jours - 1);
  db.executer(`UPDATE clients SET statut = 'actif', offre_id = ?, fin_abonnement = ? WHERE id = ?`, offre.id, fin, client.id);
  return fin;
}

/** Nombre de vidéos commandées ce mois-ci par un client (hors échecs) */
function videosDuMois(clientId) {
  return db.valeur(
    `SELECT COUNT(*) FROM commandes WHERE client_id = ? AND cree_le >= ? AND statut != 'echec'`,
    clientId,
    f.debutDuMois(),
  );
}

module.exports = {
  mettreAJourExpirations,
  verifierExpirations,
  activer,
  prolonger,
  suspendre,
  appliquerPaiement,
  videosDuMois,
};
