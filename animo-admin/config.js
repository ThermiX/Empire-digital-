// =============================================================
//  config.js — Tous les réglages techniques de l'application.
//  Les valeurs viennent du fichier .env (copiez .env.exemple en .env).
//  Les réglages "métier" (nom de marque, message WhatsApp…) se
//  modifient dans la page Paramètres de l'admin, pas ici.
// =============================================================
const path = require('node:path');

// Charge le fichier .env s'il existe (fonction intégrée à Node.js)
try {
  process.loadEnvFile(path.join(__dirname, '.env'));
} catch {
  // Pas de fichier .env : on garde les valeurs par défaut ci-dessous.
}

const env = process.env;
const oui = (valeur) => ['1', 'oui', 'true', 'yes'].includes(String(valeur || '').toLowerCase());

const config = {
  // Port du serveur web (http://adresse:PORT)
  port: Number(env.PORT) || 3000,

  // Fuseau horaire utilisé pour "aujourd'hui", "ce mois", etc.
  // Exemples : Africa/Abidjan, Africa/Dakar, Africa/Douala, Africa/Kinshasa
  fuseauHoraire: env.FUSEAU_HORAIRE || 'Africa/Abidjan',

  // Dossier où sont rangés la base de données et les fichiers envoyés
  dossierDonnees: path.resolve(__dirname, env.DOSSIER_DONNEES || 'donnees'),

  // Déconnexion automatique après X minutes sans activité
  inactiviteMinutes: Number(env.DECONNEXION_APRES_MINUTES) || 20,
  // Durée maximale d'une session, même active (en heures)
  sessionMaxHeures: 12,

  // Mettre DERRIERE_PROXY=oui si l'app est hébergée derrière HTTPS
  // (Render, Railway, Nginx…) : les cookies deviennent "Secure".
  derriereProxy: oui(env.DERRIERE_PROXY),

  // Adresse publique de l'app (sert à fabriquer le lien vidéo envoyé au client).
  // Exemple : https://admin.animo.africa — vide = adresse utilisée dans le navigateur.
  urlPublique: (env.URL_PUBLIQUE || '').replace(/\/+$/, ''),

  // Tailles maximales des fichiers envoyés
  tailleMaxImageMo: 5,
  tailleMaxVideoMo: Number(env.TAILLE_MAX_VIDEO_MO) || 200,

  // Moyens de paiement proposés dans les formulaires (modifiable librement)
  moyensPaiement: [
    'Orange Money',
    'MTN Mobile Money',
    'Moov Money',
    'Wave',
    'Free Money',
    'Airtel Money',
    'Espèces',
    'Autre',
  ],

  // Types de champs qu'un gabarit peut demander au client
  // clé technique : libellé affiché
  typesChamps: {
    texte: 'Texte',
    logo: 'Logo',
    couleurs: 'Couleurs',
    photos: 'Photos',
    voix: 'Voix off',
  },

  // Formats vidéo proposés pour les gabarits
  formats: ['Vertical 9:16', 'Carré 1:1', 'Horizontal 16:9'],

  // Nombre de lignes par page dans les listes
  parPage: 30,
};

// Toutes les dates de l'app suivent ce fuseau horaire
process.env.TZ = config.fuseauHoraire;

module.exports = config;
