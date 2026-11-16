// =============================================================
//  lib/fichiers.js — Fichiers envoyés depuis l'admin :
//   • preuves     : captures d'écran de paiement Mobile Money
//   • miniatures  : images des gabarits
//   • videos      : vidéos finales (MP4 / WebM)
//
//  Les fichiers sont rangés dans donnees/fichiers/… (hors du
//  dossier public) et ne sont visibles qu'une fois connecté.
// =============================================================
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const multer = require('multer');
const config = require('../config');

const racine = path.join(config.dossierDonnees, 'fichiers');

// Dossier → genre de fichier accepté
const DOSSIERS = { preuves: 'image', miniatures: 'image', videos: 'video' };
for (const dossier of Object.keys(DOSSIERS)) fs.mkdirSync(path.join(racine, dossier), { recursive: true });

// Types acceptés → extension enregistrée
const EXTENSIONS = {
  'image/jpeg': '.jpg',
  'image/png': '.png',
  'image/webp': '.webp',
  'video/mp4': '.mp4',
  'video/webm': '.webm',
};

// Forme d'un nom de fichier fabriqué par l'app (sécurité : pas de "../")
const NOM_VALIDE = /^[0-9a-f-]{36}\.(jpg|png|webp|mp4|webm)$/;

/** Chemin complet d'un fichier, ou null si le nom est suspect */
function chemin(dossier, nom) {
  if (!DOSSIERS[dossier] || !NOM_VALIDE.test(String(nom))) return null;
  return path.join(racine, dossier, nom);
}

/** Vérifie les premiers octets : un .jpg doit vraiment être une image JPEG, etc. */
function signatureValide(fichier, extension) {
  const tete = Buffer.alloc(12);
  const fd = fs.openSync(fichier, 'r');
  try {
    fs.readSync(fd, tete, 0, 12, 0);
  } finally {
    fs.closeSync(fd);
  }
  const ascii = (debut, fin) => tete.toString('latin1', debut, fin);
  switch (extension) {
    case '.jpg':
      return tete[0] === 0xff && tete[1] === 0xd8 && tete[2] === 0xff;
    case '.png':
      return tete[0] === 0x89 && ascii(1, 4) === 'PNG';
    case '.webp':
      return ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP';
    case '.mp4':
      return ascii(4, 8) === 'ftyp';
    case '.webm':
      return tete[0] === 0x1a && tete[1] === 0x45 && tete[2] === 0xdf && tete[3] === 0xa3;
    default:
      return false;
  }
}

/**
 * Middleware de téléversement d'UN fichier.
 *   televerser('preuves', 'preuve')  → champ <input name="preuve">
 * Résultat : req.file (si fichier valide) ou req.erreurFichier (message).
 * Le formulaire doit avoir enctype="multipart/form-data".
 */
function televerser(dossier, champ) {
  const genre = DOSSIERS[dossier];
  const tailleMaxMo = genre === 'video' ? config.tailleMaxVideoMo : config.tailleMaxImageMo;

  const recepteur = multer({
    storage: multer.diskStorage({
      destination: path.join(racine, dossier),
      filename: (req, fichier, rappel) => rappel(null, crypto.randomUUID() + EXTENSIONS[fichier.mimetype]),
    }),
    limits: { fileSize: tailleMaxMo * 1024 * 1024, files: 1, fields: 60, fieldSize: 100 * 1024 },
    fileFilter: (req, fichier, rappel) => {
      const accepte = EXTENSIONS[fichier.mimetype] && fichier.mimetype.startsWith(genre);
      if (accepte) return rappel(null, true);
      const message = genre === 'video' ? 'Format vidéo non accepté : envoyez un MP4 ou un WebM.' : 'Image non acceptée : envoyez une photo JPG, PNG ou WebP.';
      return rappel(new Error(message));
    },
  }).single(champ);

  return (req, res, suite) => {
    recepteur(req, res, (erreur) => {
      req.body ??= {};
      if (erreur) {
        req.erreurFichier = erreur.code === 'LIMIT_FILE_SIZE' ? `Fichier trop lourd (maximum ${tailleMaxMo} Mo).` : erreur.message || "Le fichier n'a pas pu être envoyé.";
        if (req.file) supprimer(dossier, req.file.filename);
        req.file = undefined;
        return suite();
      }
      if (req.file && !signatureValide(req.file.path, path.extname(req.file.filename))) {
        supprimer(dossier, req.file.filename);
        req.file = undefined;
        req.erreurFichier = "Ce fichier ne semble pas être une vraie " + (genre === 'video' ? 'vidéo.' : 'image.');
      }
      return suite();
    });
  };
}

/** Supprime un fichier (sans erreur s'il n'existe plus) */
function supprimer(dossier, nom) {
  const c = chemin(dossier, nom);
  if (c) fs.rm(c, { force: true }, () => {});
}

/** Copie un fichier existant dans un dossier (sert aux données DÉMO) */
function copierDans(dossier, source, extension) {
  const nom = crypto.randomUUID() + extension;
  fs.copyFileSync(source, path.join(racine, dossier, nom));
  return nom;
}

module.exports = { televerser, chemin, supprimer, copierDans, racine };
