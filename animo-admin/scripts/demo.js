// =============================================================
//  scripts/demo.js — Charger / supprimer les données DÉMO
//  depuis le terminal :
//    npm run demo              → ajoute les données fictives
//    npm run demo:supprimer    → les retire toutes
//  (Les mêmes boutons existent dans Paramètres.)
// =============================================================
require('../config');
const demo = require('../db/demo');

const action = process.argv[2];

if (action === 'charger') {
  const r = demo.chargerDemo();
  if (r.deja) console.log('ℹ️  Les données DÉMO sont déjà chargées.');
  else console.log(`✅ DÉMO chargée : ${r.clients} clients, ${r.commandes} commandes, ${r.paiements} paiements, ${r.gabarits} gabarits, ${r.offres} offres.`);
} else if (action === 'supprimer') {
  const r = demo.supprimerDemo();
  console.log(`🗑️  ${r.total} lignes DÉMO supprimées. Vos vraies données sont intactes.`);
} else {
  console.log('Usage : node scripts/demo.js charger|supprimer');
  process.exit(1);
}
