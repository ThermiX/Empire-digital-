// =============================================================
//  lib/securite.js — Tout ce qui protège l'espace admin :
//   • mots de passe hachés (scrypt, jamais stockés en clair)
//   • sessions avec déconnexion automatique après inactivité
//   • blocage après plusieurs mots de passe faux
//   • jeton CSRF sur chaque formulaire
//   • en-têtes de sécurité du navigateur
// =============================================================
const crypto = require('node:crypto');
const { promisify } = require('node:util');
const db = require('../db/database');
const config = require('../config');

const scrypt = promisify(crypto.scrypt);

const NOM_COOKIE = 'animo_session';
const PARAMS_SCRYPT = { N: 16384, r: 8, p: 1 };

// Anti force brute : au-delà, il faut attendre 15 minutes
const FENETRE_TENTATIVES_MS = 15 * 60 * 1000;
const MAX_ECHECS_PAR_EMAIL = 5;
const MAX_ECHECS_PAR_IP = 20;

// ---------- Mots de passe ----------

/** Transforme un mot de passe en empreinte "scrypt$N$r$p$sel$hash" */
async function hacherMotDePasse(motDePasse) {
  const sel = crypto.randomBytes(16);
  const hash = await scrypt(String(motDePasse), sel, 64, PARAMS_SCRYPT);
  return ['scrypt', PARAMS_SCRYPT.N, PARAMS_SCRYPT.r, PARAMS_SCRYPT.p, sel.toString('base64'), hash.toString('base64')].join('$');
}

/** Vérifie un mot de passe contre son empreinte (comparaison à temps constant) */
async function verifierMotDePasse(motDePasse, empreinteStockee) {
  const morceaux = String(empreinteStockee || '').split('$');
  if (morceaux.length !== 6 || morceaux[0] !== 'scrypt') return false;
  const [, N, r, p, sel, hash] = morceaux;
  const attendu = Buffer.from(hash, 'base64');
  const calcule = await scrypt(String(motDePasse), Buffer.from(sel, 'base64'), attendu.length, {
    N: Number(N),
    r: Number(r),
    p: Number(p),
  });
  return crypto.timingSafeEqual(attendu, calcule);
}

// Empreinte factice : quand l'email n'existe pas, on fait quand même le
// calcul pour que la réponse prenne le même temps (on ne révèle rien).
let empreinteFactice = null;
async function verifierSansCompte(motDePasse) {
  empreinteFactice ??= await hacherMotDePasse(crypto.randomBytes(16).toString('hex'));
  await verifierMotDePasse(motDePasse, empreinteFactice);
  return false;
}

/** Règle minimale pour un mot de passe admin */
function motDePasseAssezFort(motDePasse) {
  return typeof motDePasse === 'string' && motDePasse.length >= 10;
}

// ---------- Anti force brute ----------

function tropDeTentatives(ip, email) {
  const depuis = Date.now() - FENETRE_TENTATIVES_MS;
  const parEmail = db.valeur('SELECT COUNT(*) FROM tentatives_connexion WHERE email = ? AND le > ?', email, depuis);
  const parIp = db.valeur('SELECT COUNT(*) FROM tentatives_connexion WHERE ip = ? AND le > ?', ip, depuis);
  return parEmail >= MAX_ECHECS_PAR_EMAIL || parIp >= MAX_ECHECS_PAR_IP;
}

function noterEchec(ip, email) {
  db.executer('INSERT INTO tentatives_connexion (ip, email, le) VALUES (?, ?, ?)', ip, email, Date.now());
  // Ménage : on oublie les tentatives anciennes
  db.executer('DELETE FROM tentatives_connexion WHERE le < ?', Date.now() - 24 * 3600 * 1000);
}

function effacerEchecs(ip, email) {
  db.executer('DELETE FROM tentatives_connexion WHERE email = ? OR ip = ?', email, ip);
}

// ---------- Cookies & sessions ----------

const empreinte = (jeton) => crypto.createHash('sha256').update(jeton).digest('hex');

/** Lit un cookie dans la requête (sans bibliothèque) */
function lireCookie(req, nom) {
  for (const morceau of String(req.headers.cookie || '').split(';')) {
    const i = morceau.indexOf('=');
    if (i > 0 && morceau.slice(0, i).trim() === nom) {
      try {
        return decodeURIComponent(morceau.slice(i + 1).trim());
      } catch {
        return null;
      }
    }
  }
  return null;
}

function optionsCookie(req) {
  return {
    httpOnly: true, // invisible pour le JavaScript de la page
    sameSite: 'lax', // pas envoyé par les formulaires d'autres sites
    secure: req.secure, // HTTPS uniquement quand le site est en HTTPS
    path: '/',
    // Pas de date d'expiration : le cookie disparaît à la fermeture du navigateur.
  };
}

/** Ouvre une session après un mot de passe correct */
function ouvrirSession(req, res, adminId) {
  const jeton = crypto.randomBytes(32).toString('base64url');
  const jetonCsrf = crypto.randomBytes(24).toString('base64url');
  const t = Date.now();
  db.executer(
    `INSERT INTO sessions (id_hash, admin_id, jeton_csrf, cree_le, derniere_activite, ip, appareil)
     VALUES (?, ?, ?, ?, ?, ?, ?)`,
    empreinte(jeton),
    adminId,
    jetonCsrf,
    t,
    t,
    req.ip,
    String(req.get('user-agent') || '').slice(0, 200),
  );
  res.cookie(NOM_COOKIE, jeton, optionsCookie(req));
  // Ménage des vieilles sessions
  db.executer('DELETE FROM sessions WHERE derniere_activite < ?', t - config.sessionMaxHeures * 3600 * 1000);
}

/** Ferme la session en cours */
function fermerSession(req, res) {
  if (req.session) db.executer('DELETE FROM sessions WHERE id_hash = ?', req.session.id_hash);
  res.clearCookie(NOM_COOKIE, { path: '/' });
}

/**
 * Middleware : retrouve la session à partir du cookie.
 * Déconnexion automatique si :
 *  - aucune activité depuis X minutes (DECONNEXION_APRES_MINUTES)
 *  - la session a plus de 12 heures
 */
function chargerSession(req, res, next) {
  const jeton = lireCookie(req, NOM_COOKIE);
  if (!jeton) return next();

  const session = db.un(
    `SELECT s.*, a.email FROM sessions s JOIN admins a ON a.id = s.admin_id WHERE s.id_hash = ?`,
    empreinte(jeton),
  );
  if (!session) {
    res.clearCookie(NOM_COOKIE, { path: '/' });
    return next();
  }

  const t = Date.now();
  const inactive = t - session.derniere_activite > config.inactiviteMinutes * 60 * 1000;
  const tropVieille = t - session.cree_le > config.sessionMaxHeures * 3600 * 1000;
  if (inactive || tropVieille) {
    db.executer('DELETE FROM sessions WHERE id_hash = ?', session.id_hash);
    res.clearCookie(NOM_COOKIE, { path: '/' });
    req.sessionExpiree = true;
    return next();
  }

  db.executer('UPDATE sessions SET derniere_activite = ? WHERE id_hash = ?', t, session.id_hash);
  req.session = session;
  req.admin = { id: session.admin_id, email: session.email };
  res.locals.admin = req.admin;
  res.locals.csrf = session.jeton_csrf;
  res.locals.inactiviteMs = config.inactiviteMinutes * 60 * 1000;
  next();
}

/** Middleware : bloque l'accès si l'admin n'est pas connecté */
function exigerConnexion(req, res, next) {
  if (req.admin) return next();

  // Appel JavaScript (fetch) : réponse courte
  if (req.get('x-csrf-token') !== undefined) {
    return res.status(401).json({ ok: false, message: 'Session expirée' });
  }

  const params = new URLSearchParams();
  if (req.sessionExpiree || req.body?.raison === 'inactivite') params.set('raison', 'inactivite');
  if (req.method === 'GET' && req.originalUrl !== '/') params.set('suite', req.originalUrl);
  const qs = params.toString();
  return res.redirect(303, `/connexion${qs ? `?${qs}` : ''}`);
}

/** Évite les redirections vers un autre site après la connexion */
function adresseDeRetourSure(suite) {
  const s = String(suite || '');
  if (!s.startsWith('/') || s.startsWith('//') || s.includes('\\') || s.startsWith('/connexion')) return '/';
  return s;
}

/**
 * Middleware CSRF : chaque formulaire envoie un jeton secret (_csrf).
 * Un site pirate ne connaît pas ce jeton : il ne peut donc pas
 * déclencher d'action à votre place.
 * (Formulaires avec fichier : le jeton est dans l'adresse ?_csrf=…)
 */
function verifierCsrf(req, res, next) {
  if (['GET', 'HEAD', 'OPTIONS'].includes(req.method)) return next();

  const recu = Buffer.from(String(req.body?._csrf || req.query?._csrf || req.get('x-csrf-token') || ''));
  const attendu = Buffer.from(String(req.session?.jeton_csrf || ''));
  if (attendu.length > 0 && recu.length === attendu.length && crypto.timingSafeEqual(recu, attendu)) {
    return next();
  }

  res.status(403);
  if (req.get('x-csrf-token') !== undefined) return res.json({ ok: false, message: 'Jeton invalide' });
  return res.render('erreur', {
    titre: 'Action refusée',
    message: 'Ce formulaire a expiré. Revenez en arrière, rechargez la page et recommencez.',
  });
}

/** Middleware : les pages admin ne sont jamais gardées en cache
 *  (le bouton "retour" après déconnexion n'affiche rien) */
function pasDeCache(req, res, next) {
  res.set('Cache-Control', 'no-store');
  next();
}

/** Middleware : en-têtes de sécurité envoyés avec chaque page */
function entetes(req, res, next) {
  res.set({
    'Content-Security-Policy': [
      "default-src 'self'",
      "img-src 'self' data: blob:",
      "media-src 'self' blob:",
      "style-src 'self'",
      "font-src 'self'",
      "script-src 'self'",
      "connect-src 'self'",
      "form-action 'self'",
      "frame-ancestors 'none'",
      "base-uri 'none'",
      "object-src 'none'",
    ].join('; '),
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'Referrer-Policy': 'same-origin',
    'Permissions-Policy': 'geolocation=(), microphone=(), camera=()',
    'Cross-Origin-Opener-Policy': 'same-origin',
  });
  if (req.secure) res.set('Strict-Transport-Security', 'max-age=31536000');
  next();
}

// ---------- Messages "flash" (affichés une fois après une action) ----------

/** Enregistre un message à afficher sur la page suivante */
function flash(req, type, message) {
  if (!req.session) return;
  db.executer('UPDATE sessions SET flash = ? WHERE id_hash = ?', JSON.stringify({ type, message }), req.session.id_hash);
}

/** Middleware : récupère (et efface) le message flash pour la page affichée */
function lireFlash(req, res, next) {
  if (req.method === 'GET' && req.session?.flash && !req.path.startsWith('/fichiers/')) {
    try {
      res.locals.flash = JSON.parse(req.session.flash);
    } catch {
      /* message abîmé : ignoré */
    }
    db.executer('UPDATE sessions SET flash = NULL WHERE id_hash = ?', req.session.id_hash);
  }
  next();
}

module.exports = {
  hacherMotDePasse,
  verifierMotDePasse,
  verifierSansCompte,
  motDePasseAssezFort,
  tropDeTentatives,
  noterEchec,
  effacerEchecs,
  ouvrirSession,
  fermerSession,
  chargerSession,
  exigerConnexion,
  adresseDeRetourSure,
  verifierCsrf,
  pasDeCache,
  entetes,
  flash,
  lireFlash,
};
