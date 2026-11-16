// =============================================================
//  routes/parametres.js — PAGE 7 : Paramètres
//   GET  /parametres                  formulaire
//   POST /parametres                  marque, WhatsApp, message auto
//   POST /parametres/mot-de-passe     changer le mot de passe
//   POST /parametres/sessions/fermer  déconnecter les autres appareils
//   POST /parametres/demo/charger     ajouter les données DÉMO
//   POST /parametres/demo/supprimer   retirer les données DÉMO
// =============================================================
const express = require('express');
const db = require('../db/database');
const demo = require('../db/demo');
const f = require('../lib/format');
const securite = require('../lib/securite');
const { flash } = securite;
const { noter, texte, enregistrerParametres, remplirMessage, urlDeBase } = require('../lib/outils');

const router = express.Router();

// Valeurs d'exemple pour l'aperçu du message
function exemple(req, valeurs) {
  return {
    nom: 'Boutique Exemple',
    gabarit: 'Promo flash',
    lien: `${urlDeBase(req)}/v/exemple`,
    marque: valeurs.nom_marque,
    contact: valeurs.whatsapp_contact ? f.telephone(valeurs.whatsapp_contact) : '',
    numero: 123,
  };
}

function afficher(req, res, { valeurs = res.locals.parametres, erreurs = {}, erreursMdp = {} } = {}) {
  const ex = exemple(req, valeurs);
  res.render('parametres', {
    titre: 'Paramètres',
    rubrique: 'parametres',
    valeurs,
    erreurs,
    erreursMdp,
    exemple: ex,
    apercu: remplirMessage(valeurs.message_video_prete, ex),
    demo: demo.compterDemo(),
    autresSessions: db.valeur('SELECT COUNT(*) FROM sessions WHERE admin_id = ? AND id_hash != ?', req.admin.id, req.session.id_hash),
    journal: db.tous(
      `SELECT j.*, a.email FROM journal j LEFT JOIN admins a ON a.id = j.admin_id ORDER BY j.id DESC LIMIT 30`,
    ),
  });
}

router.get('/', (req, res) => afficher(req, res));

// ---------- Marque & messages ----------
router.post('/', (req, res) => {
  const b = req.body;
  const valeurs = {
    nom_marque: texte(b.nom_marque, 60),
    whatsapp_contact: texte(b.whatsapp_contact, 30),
    indicatif_pays: String(b.indicatif_pays || '').replace(/\D/g, '').slice(0, 4),
    duree_essai_jours: String(f.lireEntier(b.duree_essai_jours, '') ?? ''),
    message_video_prete: String(b.message_video_prete || '').replace(/\r\n/g, '\n').trim().slice(0, 1500),
  };

  const erreurs = {};
  if (!valeurs.nom_marque) erreurs.nom_marque = 'Indiquez le nom de la marque.';
  if (!valeurs.indicatif_pays) erreurs.indicatif_pays = 'Indicatif invalide (ex. : 225).';
  if (valeurs.whatsapp_contact) {
    const numero = f.normaliserWhatsapp(valeurs.whatsapp_contact, valeurs.indicatif_pays || '225');
    if (numero) valeurs.whatsapp_contact = numero;
    else erreurs.whatsapp_contact = 'Numéro WhatsApp invalide.';
  }
  const essai = Number(valeurs.duree_essai_jours);
  if (!Number.isInteger(essai) || essai < 1 || essai > 60) erreurs.duree_essai_jours = 'Entre 1 et 60 jours.';
  if (!valeurs.message_video_prete.includes('{lien}')) erreurs.message_video_prete = 'Le message doit contenir {lien} (le lien de la vidéo).';

  if (Object.keys(erreurs).length) return afficher(req, res, { valeurs, erreurs });

  enregistrerParametres(valeurs);
  noter(req, 'Paramètres modifiés');
  flash(req, 'succes', 'Paramètres enregistrés.');
  res.redirect(303, '/parametres');
});

// ---------- Mot de passe ----------
router.post('/mot-de-passe', async (req, res) => {
  const { actuel = '', nouveau = '', confirmation = '' } = req.body;
  const admin = db.un('SELECT * FROM admins WHERE id = ?', req.admin.id);
  const erreursMdp = {};
  if (!(await securite.verifierMotDePasse(String(actuel), admin.mot_de_passe_hash))) erreursMdp.actuel = 'Mot de passe actuel incorrect.';
  else if (!securite.motDePasseAssezFort(nouveau)) erreursMdp.nouveau = 'Le nouveau mot de passe doit faire au moins 10 caractères.';
  else if (nouveau !== confirmation) erreursMdp.confirmation = 'Les deux mots de passe ne sont pas identiques.';
  else if (nouveau === actuel) erreursMdp.nouveau = "Choisissez un mot de passe différent de l'actuel.";

  if (Object.keys(erreursMdp).length) {
    res.status(400);
    return afficher(req, res, { erreursMdp });
  }

  db.executer('UPDATE admins SET mot_de_passe_hash = ? WHERE id = ?', await securite.hacherMotDePasse(nouveau), admin.id);
  // Par sécurité, les autres appareils sont déconnectés
  db.executer('DELETE FROM sessions WHERE admin_id = ? AND id_hash != ?', admin.id, req.session.id_hash);
  noter(req, 'Mot de passe changé', 'Autres appareils déconnectés');
  flash(req, 'succes', 'Mot de passe changé. Vos autres appareils ont été déconnectés.');
  res.redirect(303, '/parametres');
});

// ---------- Sessions ----------
router.post('/sessions/fermer', (req, res) => {
  const { changes } = db.executer('DELETE FROM sessions WHERE admin_id = ? AND id_hash != ?', req.admin.id, req.session.id_hash);
  noter(req, 'Autres appareils déconnectés', `${changes} session(s)`);
  flash(req, 'succes', changes ? `${changes} autre(s) appareil(s) déconnecté(s).` : 'Aucun autre appareil connecté.');
  res.redirect(303, '/parametres');
});

// ---------- Données DÉMO ----------
router.post('/demo/charger', (req, res) => {
  const r = demo.chargerDemo();
  if (r.deja) {
    flash(req, 'erreur', 'Les données DÉMO sont déjà chargées.');
  } else {
    noter(req, 'Données DÉMO chargées');
    flash(req, 'succes', `Données DÉMO ajoutées (${r.clients} clients, ${r.commandes} commandes). Elles portent toutes le badge DÉMO.`);
  }
  res.redirect(303, '/parametres#demo');
});

router.post('/demo/supprimer', (req, res) => {
  const r = demo.supprimerDemo();
  noter(req, 'Données DÉMO supprimées', `${r.total} lignes`);
  flash(req, 'succes', `${r.total} lignes DÉMO supprimées. Vos vraies données n'ont pas été touchées.`);
  res.redirect(303, '/parametres#demo');
});

module.exports = router;
