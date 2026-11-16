// =============================================================
//  scripts/creer-admin.js — Crée le compte administrateur
//  (ou change son mot de passe s'il existe déjà).
//
//  Dans un terminal :   npm run creer-admin
//  → l'email et le mot de passe sont demandés (mot de passe masqué).
//
//  Sans terminal (hébergeur) : définissez ADMIN_EMAIL et
//  ADMIN_MOT_DE_PASSE ; le compte est créé au premier démarrage
//  s'il n'existe encore aucun admin. Retirez ensuite le mot de passe.
// =============================================================
require('../config');
const readline = require('node:readline');
const db = require('../db/database');
const securite = require('../lib/securite');
const f = require('../lib/format');

const EMAIL_VALIDE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Crée l'admin, ou remplace son mot de passe (et le déconnecte partout) */
async function enregistrerAdmin(email, motDePasse) {
  const empreinte = await securite.hacherMotDePasse(motDePasse);
  const existant = db.un('SELECT id FROM admins WHERE email = ?', email);
  if (existant) {
    db.executer('UPDATE admins SET mot_de_passe_hash = ? WHERE id = ?', empreinte, existant.id);
    db.executer('DELETE FROM sessions WHERE admin_id = ?', existant.id);
    return 'modifié';
  }
  db.executer('INSERT INTO admins (email, mot_de_passe_hash, cree_le) VALUES (?, ?, ?)', email, empreinte, f.maintenant());
  return 'créé';
}

/** Au démarrage du serveur : crée le premier admin depuis les variables d'environnement */
async function creerAdminDepuisEnv() {
  const email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  const motDePasse = process.env.ADMIN_MOT_DE_PASSE || '';
  if (!email || !motDePasse) return;
  if (db.valeur('SELECT COUNT(*) FROM admins') > 0) return; // seulement la première fois
  if (!EMAIL_VALIDE.test(email) || !securite.motDePasseAssezFort(motDePasse)) {
    console.warn('⚠️  ADMIN_EMAIL ou ADMIN_MOT_DE_PASSE invalide (10 caractères minimum) : compte non créé.');
    return;
  }
  await enregistrerAdmin(email, motDePasse);
  console.log(`👤 Compte admin créé pour ${email}. Pensez à retirer ADMIN_MOT_DE_PASSE de vos réglages.`);
}

// ---------- Saisie dans le terminal ----------

function demander(question) {
  return new Promise((resolve) => {
    const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
    rl.question(question, (reponse) => {
      rl.close();
      resolve(reponse.trim());
    });
  });
}

/** Comme demander(), mais les caractères tapés sont remplacés par des • */
function demanderCache(question) {
  return new Promise((resolve) => {
    const entree = process.stdin;
    process.stdout.write(question);
    entree.setRawMode(true);
    entree.resume();
    entree.setEncoding('utf8');
    let saisie = '';
    const surTouche = (touches) => {
      for (const c of touches) {
        if (c === '\r' || c === '\n') {
          entree.setRawMode(false);
          entree.pause();
          entree.off('data', surTouche);
          process.stdout.write('\n');
          return resolve(saisie);
        }
        if (c === '\u0003') process.exit(1); // Ctrl+C
        if (c === '\u007f' || c === '\b') {
          if (saisie) {
            saisie = [...saisie].slice(0, -1).join('');
            process.stdout.write('\b \b');
          }
          continue;
        }
        saisie += c;
        process.stdout.write('•');
      }
    };
    entree.on('data', surTouche);
  });
}

async function principal() {
  let email = String(process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  let motDePasse = process.env.ADMIN_MOT_DE_PASSE || '';

  if (!email || !motDePasse) {
    if (!process.stdin.isTTY) {
      console.error('Lancez cette commande dans un terminal, ou définissez ADMIN_EMAIL et ADMIN_MOT_DE_PASSE.');
      process.exit(1);
    }
    console.log('\n👤 Création du compte administrateur Animo\n');
    email = (await demander('Email : ')).toLowerCase();
    motDePasse = await demanderCache('Mot de passe (10 caractères minimum) : ');
    const confirmation = await demanderCache('Retapez le mot de passe : ');
    if (motDePasse !== confirmation) {
      console.error('❌ Les deux mots de passe sont différents.');
      process.exit(1);
    }
  }

  if (!EMAIL_VALIDE.test(email)) {
    console.error('❌ Email invalide.');
    process.exit(1);
  }
  if (!securite.motDePasseAssezFort(motDePasse)) {
    console.error('❌ Mot de passe trop court : 10 caractères minimum.');
    process.exit(1);
  }

  const resultat = await enregistrerAdmin(email, motDePasse);
  console.log(`✅ Compte admin ${resultat} : ${email}`);
}

if (require.main === module) principal();

module.exports = { creerAdminDepuisEnv, enregistrerAdmin };
