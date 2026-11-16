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

module.exports = { serieJournaliere };
