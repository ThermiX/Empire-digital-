// =============================================================
//  db/database.js — Connexion à la base SQLite.
//  SQLite = un simple fichier (donnees/animo.db), rien à installer.
//  On utilise le module SQLite intégré à Node.js (node:sqlite).
// =============================================================
const fs = require('node:fs');
const path = require('node:path');
const { DatabaseSync } = require('node:sqlite');
const config = require('../config');

fs.mkdirSync(config.dossierDonnees, { recursive: true });

const fichierBase = path.join(config.dossierDonnees, 'animo.db');
const base = new DatabaseSync(fichierBase);

// Réglages conseillés : écriture plus sûre, liens entre tables vérifiés
base.exec('PRAGMA journal_mode = WAL;');
base.exec('PRAGMA foreign_keys = ON;');
base.exec('PRAGMA busy_timeout = 5000;');

// Crée les tables si elles n'existent pas encore
base.exec(fs.readFileSync(path.join(__dirname, 'schema.sql'), 'utf8'));

// SQLite n'accepte ni undefined ni true/false : on convertit.
function nettoyer(params) {
  return params.map((v) => {
    if (v === undefined) return null;
    if (v === true) return 1;
    if (v === false) return 0;
    return v;
  });
}

// ---- Raccourcis utilisés partout dans le code ----------------
// Les "?" dans la requête sont remplacés, dans l'ordre, par les
// valeurs données : jamais de concaténation de texte venant de
// l'utilisateur (protection contre les injections SQL).

/** Renvoie toutes les lignes trouvées (tableau). */
function tous(sql, ...params) {
  return base.prepare(sql).all(...nettoyer(params));
}

/** Renvoie la première ligne trouvée, ou undefined. */
function un(sql, ...params) {
  return base.prepare(sql).get(...nettoyer(params));
}

/** Renvoie une seule valeur (ex. : SELECT COUNT(*) …). */
function valeur(sql, ...params) {
  const ligne = un(sql, ...params);
  return ligne ? Object.values(ligne)[0] : undefined;
}

/** Exécute INSERT / UPDATE / DELETE. Renvoie { changes, lastInsertRowid }. */
function executer(sql, ...params) {
  return base.prepare(sql).run(...nettoyer(params));
}

/** Exécute plusieurs requêtes "tout ou rien". */
function transaction(fonction) {
  base.exec('BEGIN');
  try {
    const resultat = fonction();
    base.exec('COMMIT');
    return resultat;
  } catch (erreur) {
    base.exec('ROLLBACK');
    throw erreur;
  }
}

module.exports = { base, tous, un, valeur, executer, transaction, fichierBase };
