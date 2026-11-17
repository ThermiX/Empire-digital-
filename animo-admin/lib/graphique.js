// =============================================================
//  lib/graphique.js — Prépare les données des petits graphiques
//  en colonnes du tableau de bord (30 derniers jours).
//  Le dessin lui-même est dans views/partials/graphique.ejs (SVG).
// =============================================================
const f = require('./format');

/** Arrondit vers le haut à une valeur "ronde" : 7 → 10, 23 000 → 25 000 */
function maximumRond(max, entier) {
  if (max <= 0) return entier ? 2 : 10_000;
  const puissance = 10 ** Math.floor(Math.log10(max));
  for (const m of [1, 2, 2.5, 4, 5, 6, 8, 10]) {
    const candidat = m * puissance;
    // Pour des nombres entiers (vidéos), la moitié de l'échelle doit rester entière
    if (candidat >= max && (!entier || Number.isInteger(candidat / 2))) return candidat;
  }
  return 10 * puissance;
}

/**
 * lignes : [{ jour: '2026-11-03', valeur: 4 }, …] (jours sans valeur = 0)
 * options.entier : true pour des quantités (vidéos), false pour des montants
 * options.unite  : fonction qui écrit une valeur ("3 vidéos", "15 000 FCFA")
 */
function serieJournaliere(lignes, { nbJours = 30, entier = true, unite = f.nombre } = {}) {
  const parJour = new Map(lignes.map((l) => [String(l.jour), Number(l.valeur) || 0]));
  const fin = f.aujourdhui();

  const jours = [];
  for (let i = nbJours - 1; i >= 0; i--) {
    const jour = f.ajouterJours(fin, -i);
    jours.push({ jour, valeur: parJour.get(jour) || 0 });
  }

  const max = Math.max(0, ...jours.map((j) => j.valeur));
  const echelle = maximumRond(max, entier);
  const largeurCase = 100 / nbJours; // en % de la largeur

  return {
    total: jours.reduce((somme, j) => somme + j.valeur, 0),
    max,
    graduations: {
      haut: entier ? f.nombre(echelle) : f.compact(echelle),
      milieu: entier ? f.nombre(echelle / 2) : f.compact(echelle / 2),
    },
    debut: f.jourMois(jours[0].jour),
    milieu: f.jourMois(jours[Math.floor(nbJours / 2)].jour),
    colonnes: jours.map((j, i) => ({
      ...j,
      libelle: f.jourMois(j.jour),
      texte: unite(j.valeur),
      aujourdhui: j.jour === fin,
      proportion: j.valeur / echelle, // 0 → 1
      x: i * largeurCase, // début de la case (%)
      largeur: largeurCase,
    })),
  };
}

/**
 * Revenus CUMULÉS du mois en cours, comparés au mois précédent.
 *   courant, precedent : [{ jour: '2026-11-03', valeur: 15000 }, …] (paiements validés par jour)
 * Une "case" par jour du mois (1, 2, 3…) : le mois en cours s'arrête à aujourd'hui,
 * le mois précédent est tracé en entier pour voir où l'on se situe.
 */
function serieCumulMois(courant, precedent) {
  const auj = f.aujourdhui();
  const debutMois = f.debutDuMois();
  const debutPrec = f.debutMoisPrecedent(auj);
  const jourActuel = Number(auj.slice(8, 10));
  const joursDansMois = (debut) => f.ecartJours(debut, f.debutMoisPrecedent(f.ajouterJours(debut, 62))); // 28 à 31
  const nbCourant = joursDansMois(debutMois);
  const nbPrecedent = joursDansMois(debutPrec);
  const nbCases = Math.max(nbCourant, nbPrecedent);

  const parJour = (lignes) => new Map(lignes.map((l) => [String(l.jour), Number(l.valeur) || 0]));
  const mapCourant = parJour(courant);
  const mapPrecedent = parJour(precedent);
  const nomCourant = f.moisCourt(debutMois);
  const nomPrecedent = f.moisCourt(debutPrec);

  let cumulCourant = 0;
  let cumulPrecedent = 0;
  const cases = [];
  for (let j = 1; j <= nbCases; j++) {
    const c = { jour: j, x: ((j - 1) * 100) / nbCases, largeur: 100 / nbCases, aujourdhui: j === jourActuel, courant: null, precedent: null };
    if (j <= jourActuel) {
      const duJour = mapCourant.get(f.ajouterJours(debutMois, j - 1)) || 0;
      cumulCourant += duJour;
      c.courant = { cumul: cumulCourant, duJour };
    }
    if (j <= nbPrecedent) {
      cumulPrecedent += mapPrecedent.get(f.ajouterJours(debutPrec, j - 1)) || 0;
      c.precedent = { cumul: cumulPrecedent };
    }
    cases.push(c);
  }

  const echelle = maximumRond(Math.max(cumulCourant, cumulPrecedent), false);
  for (const c of cases) {
    if (c.courant) c.courant.proportion = c.courant.cumul / echelle;
    if (c.precedent) c.precedent.proportion = c.precedent.cumul / echelle;
    // Textes de la bulle
    if (c.courant) {
      c.texte = f.fcfa(c.courant.cumul);
      c.libelle = `${c.aujourdhui ? "Aujourd'hui" : `${c.jour} ${nomCourant}`} · ${c.courant.duJour ? `+${f.fcfa(c.courant.duJour)} ce jour` : 'rien ce jour'}`;
      c.extra = c.precedent ? `Au ${c.jour} ${nomPrecedent} : ${f.fcfa(c.precedent.cumul)}` : '';
    } else {
      c.texte = c.precedent ? f.fcfa(c.precedent.cumul) : '—';
      c.libelle = `Au ${c.jour} ${nomPrecedent} (mois précédent)`;
      c.extra = c.jour <= nbCourant ? `${c.jour} ${nomCourant} : à venir` : '';
    }
  }

  return {
    cases,
    nbCases,
    jourActuel,
    nomCourant,
    nomPrecedent,
    totalCourant: cumulCourant,
    totalPrecedent: cumulPrecedent,
    graduations: { haut: f.compact(echelle), milieu: f.compact(echelle / 2) },
  };
}

module.exports = { serieJournaliere, serieCumulMois };
