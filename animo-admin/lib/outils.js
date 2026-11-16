// =============================================================
//  lib/outils.js — Petits outils partagés par les pages :
//  paramètres de la marque, journal, WhatsApp, pagination…
// =============================================================
const db = require('../db/database');
const config = require('../config');
const f = require('./format');

// ---------- Paramètres de la marque (table "parametres") ----------

// Valeurs utilisées tant que l'admin n'a rien changé dans Paramètres
const PARAMETRES_PAR_DEFAUT = {
  nom_marque: 'Animo',
  whatsapp_contact: '',
  indicatif_pays: '225',
  duree_essai_jours: '3',
  message_video_prete:
    'Bonjour {nom} 👋\n\n' +
    'Votre vidéo « {gabarit} » est prête ! 🎬\n' +
    'Regardez-la et téléchargez-la ici : {lien}\n\n' +
    'Une question ? Écrivez-nous au {contact}.\n' +
    "Merci de votre confiance,\nL'équipe {marque}",
};

/** Renvoie tous les paramètres { cle: valeur } */
function lireParametres() {
  const enregistres = Object.fromEntries(db.tous('SELECT cle, valeur FROM parametres').map((l) => [l.cle, l.valeur]));
  return { ...PARAMETRES_PAR_DEFAUT, ...enregistres };
}

/** Enregistre plusieurs paramètres d'un coup */
function enregistrerParametres(valeurs) {
  db.transaction(() => {
    for (const [cle, valeur] of Object.entries(valeurs)) {
      db.executer(
        'INSERT INTO parametres (cle, valeur) VALUES (?, ?) ON CONFLICT(cle) DO UPDATE SET valeur = excluded.valeur',
        cle,
        String(valeur ?? ''),
      );
    }
  });
}

// ---------- Journal des actions ----------

/** Note une action de l'admin (visible dans Paramètres) */
function noter(req, action, details = '') {
  db.executer('INSERT INTO journal (admin_id, action, details, le) VALUES (?, ?, ?, ?)', req.admin?.id ?? null, action, details, f.maintenant());
}

// ---------- WhatsApp ----------

/** Lien qui ouvre WhatsApp vers ce numéro, avec un message déjà écrit */
function lienWhatsApp(numero, message = '') {
  const chiffres = String(numero || '').replace(/\D/g, '');
  return `https://wa.me/${chiffres}${message ? `?text=${encodeURIComponent(message)}` : ''}`;
}

/** Remplace {nom}, {lien}… dans un modèle de message */
function remplirMessage(modele, valeurs) {
  return String(modele || '').replace(/\{(\w+)\}/g, (tout, cle) => (Object.hasOwn(valeurs, cle) ? String(valeurs[cle] ?? '') : tout));
}

/** Adresse de base du site (pour fabriquer les liens envoyés aux clients) */
function urlDeBase(req) {
  return config.urlPublique || `${req.protocol}://${req.get('host')}`;
}

// ---------- Requêtes ----------

/** Lit l'identifiant numérique dans l'adresse (/clients/12) */
function idParam(req) {
  const id = Number(req.params.id);
  return Number.isInteger(id) && id > 0 ? id : null;
}

/** Protège les caractères spéciaux d'une recherche LIKE */
function motifRecherche(texte) {
  return `%${String(texte).replace(/[\\%_]/g, (c) => `\\${c}`)}%`;
}

/** Calcule la page demandée (?page=2) et le décalage SQL */
function pagination(req, total) {
  const pages = Math.max(1, Math.ceil(total / config.parPage));
  const page = Math.min(pages, Math.max(1, Number.parseInt(req.query.page, 10) || 1));
  // Lien vers une autre page en gardant les filtres actuels
  const lien = (numero) => {
    const params = new URLSearchParams(req.query);
    params.set('page', numero);
    return `?${params.toString()}`;
  };
  return { page, pages, total, decalage: (page - 1) * config.parPage, parPage: config.parPage, lien };
}

/** Petit texte nettoyé (formulaires) : espaces retirés, longueur limitée */
function texte(valeur, longueurMax = 200) {
  return String(valeur ?? '').trim().slice(0, longueurMax);
}

module.exports = {
  lireParametres,
  enregistrerParametres,
  noter,
  lienWhatsApp,
  remplirMessage,
  urlDeBase,
  idParam,
  motifRecherche,
  pagination,
  texte,
};
