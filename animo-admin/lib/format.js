// =============================================================
//  lib/format.js — Mise en forme : montants FCFA, dates en
//  français, numéros WhatsApp. Utilisé par le code et les pages.
// =============================================================

const ESPACE = ' '; // espace insécable : "25 000 FCFA" ne se coupe pas

// ---------- Nombres et montants ----------

/** 1234567 → "1 234 567" */
function nombre(n) {
  const entier = Math.round(Number(n) || 0);
  const signe = entier < 0 ? '-' : '';
  return signe + String(Math.abs(entier)).replace(/\B(?=(\d{3})+(?!\d))/g, ESPACE);
}

/** 25000 → "25 000 FCFA" (toujours avec séparateur de milliers) */
function fcfa(montant) {
  return `${nombre(montant)}${ESPACE}FCFA`;
}

/** Version courte pour les axes de graphique : 150000 → "150 k" */
function compact(n) {
  const v = Number(n) || 0;
  if (v >= 1_000_000) return `${String(Math.round(v / 100_000) / 10).replace('.', ',')}${ESPACE}M`;
  if (v >= 10_000) return `${Math.round(v / 1000)}${ESPACE}k`;
  return nombre(v);
}

/** Lit un montant tapé par l'admin : "15 000", "15.000 F" → 15000 (ou null) */
function lireMontant(texte) {
  const chiffres = String(texte ?? '').replace(/\D/g, '');
  return chiffres ? Number(chiffres) : null;
}

/** Lit un nombre entier positif ou renvoie la valeur par défaut */
function lireEntier(texte, parDefaut = null) {
  const n = Number(String(texte ?? '').trim());
  return Number.isInteger(n) && n >= 0 ? n : parDefaut;
}

/** "1 vidéo" / "3 vidéos" */
function pluriel(n, singulier, pluriel_) {
  return `${nombre(n)}${ESPACE}${Math.abs(n) > 1 ? pluriel_ || `${singulier}s` : singulier}`;
}

// ---------- Dates ----------
// Les dates sont stockées en texte "AAAA-MM-JJ HH:MM:SS" (heure locale).

const MOIS_COURTS = ['janv.', 'févr.', 'mars', 'avr.', 'mai', 'juin', 'juil.', 'août', 'sept.', 'oct.', 'nov.', 'déc.'];
const MOIS_LONGS = ['janvier', 'février', 'mars', 'avril', 'mai', 'juin', 'juillet', 'août', 'septembre', 'octobre', 'novembre', 'décembre'];
const JOURS = ['dimanche', 'lundi', 'mardi', 'mercredi', 'jeudi', 'vendredi', 'samedi'];

const deux = (n) => String(n).padStart(2, '0');

/** Date JS → "2026-11-16 14:05:00" */
function versTexte(d) {
  return `${d.getFullYear()}-${deux(d.getMonth() + 1)}-${deux(d.getDate())} ${deux(d.getHours())}:${deux(d.getMinutes())}:${deux(d.getSeconds())}`;
}

/** Maintenant, au format de la base */
function maintenant() {
  return versTexte(new Date());
}

/** Aujourd'hui : "2026-11-16" */
function aujourdhui() {
  return maintenant().slice(0, 10);
}

/** Premier jour du mois en cours : "2026-11-01" */
function debutDuMois() {
  return `${aujourdhui().slice(0, 7)}-01`;
}

/** "2026-11-16" + 3 → "2026-11-19" (fonctionne aussi avec un nombre négatif) */
function ajouterJours(jour, n) {
  const [a, m, j] = String(jour).slice(0, 10).split('-').map(Number);
  return new Date(Date.UTC(a, m - 1, j + n)).toISOString().slice(0, 10);
}

/** Nombre de jours entre deux jours "AAAA-MM-JJ" (b - a) */
function ecartJours(a, b) {
  const t = (s) => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  return Math.round((t(b) - t(a)) / 86_400_000);
}

/** "2026-11-16 14:05:00" → "16 nov. 2026" */
function date(texte) {
  if (!texte) return '—';
  const [a, m, j] = String(texte).slice(0, 10).split('-').map(Number);
  return `${j}${ESPACE}${MOIS_COURTS[m - 1]}${ESPACE}${a}`;
}

/** "2026-11-16" → "16 nov." (sans l'année) */
function jourMois(texte) {
  if (!texte) return '—';
  const [, m, j] = String(texte).slice(0, 10).split('-').map(Number);
  return `${j}${ESPACE}${MOIS_COURTS[m - 1]}`;
}

/** "2026-11-16 14:05:00" → "16 nov. 2026 à 14:05" */
function dateHeure(texte) {
  if (!texte) return '—';
  const heure = String(texte).slice(11, 16);
  return heure ? `${date(texte)} à ${heure}` : date(texte);
}

/** Date relative courte : "aujourd'hui 14:05", "hier", "16 nov." */
function quand(texte) {
  if (!texte) return '—';
  const jour = String(texte).slice(0, 10);
  const auj = aujourdhui();
  if (jour === auj) return `aujourd'hui ${String(texte).slice(11, 16)}`.trim();
  if (jour === ajouterJours(auj, -1)) return 'hier';
  if (jour.slice(0, 4) === auj.slice(0, 4)) return jourMois(jour);
  return date(jour);
}

/** "lundi 16 novembre 2026" */
function dateLongue(jour = aujourdhui()) {
  const [a, m, j] = jour.split('-').map(Number);
  const nomJour = JOURS[new Date(Date.UTC(a, m - 1, j)).getUTCDay()];
  return `${nomJour} ${j} ${MOIS_LONGS[m - 1]} ${a}`;
}

/** "novembre 2026" */
function moisEnCours() {
  const [a, m] = aujourdhui().split('-').map(Number);
  return `${MOIS_LONGS[m - 1]} ${a}`;
}

/** 75 → "1 min 15 s" ; 30 → "30 s" */
function duree(secondes) {
  const s = Number(secondes) || 0;
  if (s < 60) return `${s}${ESPACE}s`;
  const min = Math.floor(s / 60);
  const reste = s % 60;
  return reste ? `${min}${ESPACE}min ${reste}${ESPACE}s` : `${min}${ESPACE}min`;
}

// ---------- Téléphone WhatsApp ----------

/**
 * Met un numéro au format international "+2250700000000".
 * - "07 00 00 00 00"     → +225 0700000000 (indicatif par défaut)
 * - "00221 77 000 00 00" → +221770000000
 * Renvoie null si le numéro n'est pas valable.
 */
function normaliserWhatsapp(texte, indicatifParDefaut = '225') {
  let n = String(texte ?? '').trim().replace(/[\s.\-()/]/g, '');
  if (!n) return null;
  if (n.startsWith('00')) n = `+${n.slice(2)}`;
  if (!n.startsWith('+')) n = `+${String(indicatifParDefaut).replace(/\D/g, '')}${n}`;
  return /^\+\d{8,15}$/.test(n) ? n : null;
}

/** "+2250700000000" → "+225 07 00 00 00 00" (affichage lisible) */
function telephone(numero) {
  const n = String(numero || '');
  if (!/^\+\d{8,15}$/.test(n)) return n || '—';
  const indicatif = n.slice(0, 4); // les indicatifs d'Afrique francophone ont 3 chiffres
  const reste = n.slice(4).replace(/(\d{2})(?=\d)/g, `$1${ESPACE}`);
  return `${indicatif}${ESPACE}${reste}`;
}

// ---------- Divers ----------

/** "Boutique Awa Mode" → "BA" (pastille ronde) */
function initiales(nom) {
  const mots = String(nom || '?').replace(/\(.*?\)/g, '').trim().split(/\s+/);
  return ((mots[0]?.[0] || '?') + (mots[1]?.[0] || '')).toUpperCase();
}

/** Lit du JSON sans planter si le texte est abîmé */
function json(texte, parDefaut) {
  try {
    return JSON.parse(texte);
  } catch {
    return parDefaut;
  }
}

module.exports = {
  nombre,
  fcfa,
  compact,
  lireMontant,
  lireEntier,
  pluriel,
  versTexte,
  maintenant,
  aujourdhui,
  debutDuMois,
  ajouterJours,
  ecartJours,
  date,
  jourMois,
  dateHeure,
  quand,
  dateLongue,
  moisEnCours,
  duree,
  normaliserWhatsapp,
  telephone,
  initiales,
  json,
};
