// =============================================================
//  lib/vues.js — Petites aides utilisées dans les pages (views/) :
//  icônes, badges de statut, badge DÉMO, liens de filtres.
// =============================================================

// Menu de navigation : [rubrique, adresse, libellé, icône]
const NAV = [
  ['tableau', '/', 'Accueil', 'accueil'],
  ['clients', '/clients', 'Clients', 'clients'],
  ['commandes', '/commandes', 'Vidéos', 'videos'],
  ['paiements', '/paiements', 'Paiements', 'paiements'],
  ['gabarits', '/gabarits', 'Gabarits', 'gabarits'],
  ['offres', '/offres', 'Offres', 'offres'],
  ['parametres', '/parametres', 'Paramètres', 'parametres'],
];

// Statuts : [libellé, couleur, icône] — la couleur n'est jamais seule,
// il y a toujours le texte et une icône.
const STATUTS = {
  client: {
    essai: ['Essai', 'violet', 'horloge'],
    actif: ['Actif', 'vert', 'check'],
    expire: ['Expiré', 'gris', 'calendrier'],
    suspendu: ['Suspendu', 'rouge', 'pause'],
  },
  commande: {
    en_attente: ['En attente', 'ambre', 'horloge'],
    en_cours: ['En cours', 'violet', 'relancer'],
    terminee: ['Terminée', 'vert', 'check'],
    echec: ['Échec', 'rouge', 'alerte'],
  },
  paiement: {
    en_attente: ['À valider', 'ambre', 'horloge'],
    valide: ['Validé', 'vert', 'check'],
    refuse: ['Refusé', 'rouge', 'croix'],
  },
};

/** Icône du fichier views/partials/icones.ejs : icone('clients') */
function icone(nom, classe = '') {
  if (!/^[a-z-]+$/.test(nom) || !/^[a-z -]*$/.test(classe)) return '';
  return `<svg class="ic ${classe}" aria-hidden="true" focusable="false"><use href="#i-${nom}"></use></svg>`;
}

/** Badge coloré : badgeStatut('client', 'actif') */
function badgeStatut(type, valeur) {
  const d = STATUTS[type]?.[valeur];
  if (!d) return '';
  return `<span class="badge ${d[1]}">${icone(d[2])}${d[0]}</span>`;
}

/** Badge DÉMO affiché à côté de chaque donnée de démonstration */
function badgeDemo(estDemo) {
  return estDemo ? '<span class="badge-demo" title="Donnée de démonstration : pas réelle">DÉMO</span>' : '';
}

/** Fabrique "?q=awa&statut=actif" en ignorant les valeurs vides */
function qs(parametres) {
  const p = new URLSearchParams();
  for (const [cle, valeur] of Object.entries(parametres)) {
    if (valeur !== '' && valeur !== null && valeur !== undefined) p.set(cle, valeur);
  }
  const texte = p.toString();
  return texte ? `?${texte}` : '';
}

/** Vrai si le texte est une couleur hexadécimale (#6D28FF) */
function estCouleur(texte) {
  return /^#[0-9a-f]{3}([0-9a-f]{3})?$/i.test(String(texte).trim());
}

module.exports = { NAV, STATUTS, icone, badgeStatut, badgeDemo, qs, estCouleur };
