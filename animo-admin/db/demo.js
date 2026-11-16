// =============================================================
//  db/demo.js — Données de DÉMONSTRATION (fictives).
//
//  Elles servent à voir l'app "remplie" avant d'avoir de vrais
//  clients. Chaque ligne a est_demo = 1 et s'affiche avec le badge
//  « DÉMO ». Les numéros WhatsApp sont factices (+225 00 00 00 00 xx).
//  Le tableau de bord ne les compte PAS, sauf si vous choisissez
//  « Avec la DÉMO ».
//
//  Charger :    Paramètres → Données de démonstration (ou npm run demo)
//  Supprimer :  même endroit (ou npm run demo:supprimer)
// =============================================================
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const db = require('./database');
const f = require('../lib/format');
const fichiers = require('../lib/fichiers');

const DOSSIER_DEMO = path.join(__dirname, 'demo');

// ---------- Contenu fictif ----------

const OFFRES = [
  { nom: 'Découverte', prix: 5000, videos: 4, description: 'Pour tester : 4 vidéos par mois.' },
  { nom: 'Pro', prix: 15000, videos: 15, description: 'Pour les boutiques qui publient chaque semaine.' },
  { nom: 'Business', prix: 35000, videos: 40, description: 'Pour les commerces très actifs et les créateurs.' },
];

const GABARITS = [
  {
    nom: 'Promo flash',
    duree: 15,
    format: 'Vertical 9:16',
    miniature: 'promo-flash.jpg',
    description: 'Une promotion courte et rythmée pour WhatsApp Status, TikTok et Reels.',
    champs: [
      { type: 'texte', libelle: 'Nom du produit', obligatoire: true },
      { type: 'texte', libelle: 'Prix promo', obligatoire: true },
      { type: 'photos', libelle: 'Photos du produit', obligatoire: true },
      { type: 'logo', libelle: 'Logo', obligatoire: false },
      { type: 'couleurs', libelle: 'Couleurs de la marque', obligatoire: false },
    ],
  },
  {
    nom: 'Nouvelle collection',
    duree: 20,
    format: 'Vertical 9:16',
    miniature: 'nouvelle-collection.jpg',
    description: 'Présenter plusieurs articles avec un titre fort.',
    champs: [
      { type: 'texte', libelle: 'Titre de la collection', obligatoire: true },
      { type: 'photos', libelle: 'Photos des articles', obligatoire: true },
      { type: 'couleurs', libelle: 'Couleurs de la marque', obligatoire: false },
      { type: 'logo', libelle: 'Logo', obligatoire: false },
    ],
  },
  {
    nom: 'Ouverture de boutique',
    duree: 30,
    format: 'Vertical 9:16',
    miniature: 'ouverture.jpg',
    description: 'Annoncer une ouverture ou un nouveau point de vente, avec voix off.',
    champs: [
      { type: 'texte', libelle: 'Nom de la boutique', obligatoire: true },
      { type: 'texte', libelle: 'Adresse', obligatoire: true },
      { type: 'texte', libelle: "Date d'ouverture", obligatoire: true },
      { type: 'logo', libelle: 'Logo', obligatoire: true },
      { type: 'voix', libelle: 'Message en voix off', obligatoire: false },
    ],
  },
  {
    nom: 'Menu du jour',
    duree: 15,
    format: 'Carré 1:1',
    miniature: 'menu-du-jour.jpg',
    description: 'Pour les restaurants et maquis.',
    champs: [
      { type: 'texte', libelle: 'Plat du jour', obligatoire: true },
      { type: 'texte', libelle: 'Prix', obligatoire: true },
      { type: 'photos', libelle: 'Photo du plat', obligatoire: true },
    ],
  },
  {
    nom: 'Annonce événement',
    duree: 25,
    format: 'Horizontal 16:9',
    miniature: null,
    actif: false,
    description: 'Concert, soirée, salon… (désactivé pour l’exemple).',
    champs: [
      { type: 'texte', libelle: "Nom de l'événement", obligatoire: true },
      { type: 'texte', libelle: 'Date et lieu', obligatoire: true },
      { type: 'photos', libelle: 'Affiche', obligatoire: false },
    ],
  },
];

// [nom, activité, ville, indicatif, statut, offre]
const CLIENTS = [
  ['Boutique Awa Mode', 'Boutique de vêtements', 'Abidjan', '225', 'actif', 'Pro'],
  ['Chez Kofi Grillades', 'Restaurant', 'Lomé', '228', 'actif', 'Découverte'],
  ['Salon Belle Tresse', 'Salon de coiffure', 'Dakar', '221', 'actif', 'Pro'],
  ['Mariam Créations', 'Créatrice de bijoux', 'Bamako', '223', 'essai', null],
  ['Tech Plus', 'Téléphonie', 'Douala', '237', 'actif', 'Business'],
  ['Pâtisserie Délices', 'Pâtisserie', 'Cotonou', '229', 'expire', 'Découverte'],
  ['Studio Yanick', 'Photographe', 'Abidjan', '225', 'actif', 'Pro'],
  ['Épicerie du Quartier', 'Épicerie', 'Ouagadougou', '226', 'essai', null],
  ['Fatou Cosmétiques', 'Cosmétiques', 'Dakar', '221', 'actif', 'Découverte'],
  ['Auto Pièces Sylla', 'Pièces auto', 'Conakry', '224', 'suspendu', 'Pro'],
  ["Le Maquis d'Abobo", 'Restaurant', 'Abidjan', '225', 'actif', 'Pro'],
  ['Kente & Wax', 'Tissus', 'Lomé', '228', 'expire', 'Pro'],
  ['Coach Sandra Fit', 'Créatrice de contenu', 'Libreville', '241', 'actif', 'Business'],
  ['Librairie Savoir', 'Librairie', 'Yaoundé', '237', 'essai', null],
];

// Valeurs d'exemple pour les champs texte (par libellé)
const EXEMPLES = {
  'Nom du produit': ['Robe wax « Soleil »', 'Sneakers Urban', 'Pack beauté karité', 'Smartphone A15', 'Sac en raphia'],
  'Prix promo': ['12 500 FCFA', '25 000 FCFA', '7 500 FCFA', '89 900 FCFA', '18 000 FCFA'],
  'Titre de la collection': ['Collection Tabaski', 'Rentrée 2026', 'Fêtes de fin d’année'],
  'Nom de la boutique': ['Boutique Awa Mode', 'Tech Plus Akwa', 'Fatou Cosmétiques'],
  Adresse: ['Cocody, rue des Jardins', 'Akwa, boulevard de la Liberté', 'Sacré-Cœur 3, villa 12'],
  "Date d'ouverture": ['Samedi 21 novembre', 'Lundi 1er décembre', 'Vendredi 5 décembre'],
  'Plat du jour': ['Attiéké poisson', 'Thiéboudienne', 'Poulet DG', 'Garba', 'Sauce graine'],
  Prix: ['2 500 FCFA', '3 000 FCFA', '1 500 FCFA', '4 000 FCFA'],
};
const VALEURS_PAR_TYPE = {
  logo: ['logo.png (reçu)', 'logo.jpg (reçu)'],
  couleurs: ['#6D28FF, #FF6F61', '#0F766E, #FBBF24', '#111827, #F59E0B', '#B91C1C, #FDE68A'],
  photos: ['3 photos reçues', '2 photos reçues', '1 photo reçue', '5 photos reçues'],
  voix: ['Voix off reçue (12 s)', 'Voix off reçue (9 s)'],
};
const ERREURS = ['Photo trop petite (moins de 500 px)', 'Délai de rendu dépassé', 'Logo illisible : fond transparent manquant'];
const MOYENS = ['Orange Money', 'MTN Mobile Money', 'Wave', 'Moov Money'];

// ---------- Hasard reproductible (mêmes données à chaque chargement) ----------
function generateur(graine) {
  let a = graine >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/** Compte les lignes DÉMO présentes */
function compterDemo() {
  const n = (table) => db.valeur(`SELECT COUNT(*) FROM ${table} WHERE est_demo = 1`);
  const totaux = { offres: n('offres'), gabarits: n('gabarits'), clients: n('clients'), commandes: n('commandes'), paiements: n('paiements') };
  totaux.total = Object.values(totaux).reduce((a, b) => a + b, 0);
  return totaux;
}

/** Ajoute les données DÉMO (une seule fois) */
function chargerDemo() {
  if (compterDemo().total > 0) return { deja: true };

  const hasard = generateur(2026);
  const entre = (min, max) => min + Math.floor(hasard() * (max - min + 1));
  const choisir = (liste) => liste[Math.floor(hasard() * liste.length)];
  const jeton = () => crypto.randomBytes(24).toString('base64url');
  const auj = f.aujourdhui();
  const maintenantMs = Date.now();

  // Un moment au hasard dans la journée (jamais dans le futur)
  const moment = (jour) => {
    if (jour === auj) {
      const d = new Date(maintenantMs - entre(10, 300) * 60_000);
      const texte = f.versTexte(d);
      return texte.slice(0, 10) === auj ? texte : `${auj} 00:05:00`;
    }
    return `${jour} ${String(entre(8, 20)).padStart(2, '0')}:${String(entre(0, 59)).padStart(2, '0')}:00`;
  };
  const plusMinutes = (texte, minutes) => {
    const [j, h] = texte.split(' ');
    const [a, m, d] = j.split('-').map(Number);
    const [hh, mm, ss] = h.split(':').map(Number);
    return f.versTexte(new Date(a, m - 1, d, hh, mm + minutes, ss));
  };
  const dansLePasse = (texte) => texte <= f.maintenant();

  // Copie de la vidéo d'exemple et des miniatures dans donnees/fichiers
  const sourceVideo = path.join(DOSSIER_DEMO, 'video-demo.mp4');
  const videoDemo = fs.existsSync(sourceVideo) ? fichiers.copierDans('videos', sourceVideo, '.mp4') : null;

  db.transaction(() => {
    // --- Offres ---
    const offres = {};
    for (const o of OFFRES) {
      const { lastInsertRowid } = db.executer(
        `INSERT INTO offres (nom, prix_fcfa, videos_par_mois, duree_jours, description, active, est_demo, cree_le)
         VALUES (?, ?, ?, 30, ?, 1, 1, ?)`,
        o.nom,
        o.prix,
        o.videos,
        o.description,
        `${f.ajouterJours(auj, -90)} 09:00:00`,
      );
      offres[o.nom] = { id: Number(lastInsertRowid), prix: o.prix };
    }

    // --- Gabarits ---
    const gabarits = [];
    for (const g of GABARITS) {
      const sourceMiniature = g.miniature && path.join(DOSSIER_DEMO, g.miniature);
      const miniature = sourceMiniature && fs.existsSync(sourceMiniature) ? fichiers.copierDans('miniatures', sourceMiniature, '.jpg') : null;
      const { lastInsertRowid } = db.executer(
        `INSERT INTO gabarits (nom, description, miniature, duree_secondes, format, champs, actif, est_demo, cree_le)
         VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?)`,
        g.nom,
        g.description,
        miniature,
        g.duree,
        g.format,
        JSON.stringify(g.champs),
        g.actif === false ? 0 : 1,
        `${f.ajouterJours(auj, -90)} 09:30:00`,
      );
      if (g.actif !== false) gabarits.push({ ...g, id: Number(lastInsertRowid) });
    }

    // --- Clients + leurs paiements ---
    const clients = [];
    const payer = (client, offre, jour, statut = 'valide', options = {}) => {
      const date = moment(jour);
      const moyen = choisir(MOYENS);
      db.executer(
        `INSERT INTO paiements (client_id, offre_id, montant_fcfa, moyen, reference, numero_payeur, statut, date_paiement, traite_le, note, est_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        client.id,
        offre.id,
        offre.prix,
        moyen,
        options.sansReference ? null : `DEMO-${moyen.slice(0, 2).toUpperCase()}${entre(100000, 999999)}`,
        f.telephone(client.whatsapp),
        statut,
        date,
        statut === 'en_attente' ? null : plusMinutes(date, entre(20, 180)),
        options.note || null,
      );
    };

    CLIENTS.forEach(([nom, activite, ville, indicatif, statut, nomOffre], i) => {
      const whatsapp = `+${indicatif}00000000${String(i + 1).padStart(2, '0')}`;
      let fin;
      if (statut === 'actif') fin = f.ajouterJours(auj, i === 1 ? 2 : entre(4, 27)); // Chez Kofi : finit dans 2 jours
      if (statut === 'essai') fin = f.ajouterJours(auj, entre(0, 2));
      if (statut === 'expire') fin = f.ajouterJours(auj, -entre(3, 20));
      if (statut === 'suspendu') fin = f.ajouterJours(auj, 12);
      const offre = nomOffre ? offres[nomOffre] : null;
      const inscription = statut === 'essai' ? f.ajouterJours(auj, -entre(0, 2)) : f.ajouterJours(auj, -entre(35, 80));

      const { lastInsertRowid } = db.executer(
        `INSERT INTO clients (nom, whatsapp, activite, ville, offre_id, statut, date_inscription, fin_abonnement, est_demo)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, 1)`,
        nom,
        whatsapp,
        activite,
        ville,
        offre?.id,
        statut,
        moment(inscription),
        fin,
      );
      const client = { id: Number(lastInsertRowid), nom, whatsapp, statut };
      clients.push(client);

      // Paiement qui a ouvert la période en cours (30 jours avant la fin)
      if (offre) {
        const debutPeriode = f.ajouterJours(fin, -29);
        payer(client, offre, debutPeriode < auj ? debutPeriode : auj);
        if (i % 3 === 0) payer(client, offre, f.ajouterJours(debutPeriode, -30)); // mois précédent
      }
    });

    // Paiements à valider et refusé
    payer(clients[3], offres.Pro, auj, 'en_attente');
    payer(clients[7], offres['Découverte'], f.ajouterJours(auj, -1), 'en_attente', { sansReference: true });
    payer(clients[4], offres.Business, auj, 'en_attente');
    payer(clients[13], offres['Découverte'], f.ajouterJours(auj, -5), 'refuse', { note: 'Argent non reçu sur le compte' });

    // --- Commandes de vidéos sur 30 jours ---
    const commanditaires = clients.filter((c) => c.statut !== 'suspendu');
    for (let d = 29; d >= 0; d--) {
      const jour = f.ajouterJours(auj, -d);
      const nombre = d === 0 ? 4 : entre(0, 3);
      for (let k = 0; k < nombre; k++) {
        const client = choisir(commanditaires);
        const gabarit = choisir(gabarits);
        const creeLe = moment(jour);

        let statut = 'terminee';
        if (d === 0) statut = ['terminee', 'terminee', 'en_cours', 'en_attente'][k];
        else if (d <= 2 && hasard() < 0.25) statut = 'en_attente';
        else if (hasard() < 0.08) statut = 'echec';

        const contenu = {};
        for (const champ of gabarit.champs) {
          contenu[champ.libelle] = champ.type === 'texte' ? choisir(EXEMPLES[champ.libelle] || ['Texte du client']) : choisir(VALEURS_PAR_TYPE[champ.type]);
        }

        let termineLe = null;
        let envoyeLe = null;
        if (statut === 'terminee') {
          termineLe = plusMinutes(creeLe, entre(3, 45));
          if (!dansLePasse(termineLe)) termineLe = f.maintenant();
          const envoi = plusMinutes(termineLe, entre(5, 90));
          if (hasard() < 0.85 && dansLePasse(envoi)) envoyeLe = envoi;
        }

        db.executer(
          `INSERT INTO commandes (client_id, gabarit_id, statut, contenu, fichier_video, jeton_partage, erreur, nb_rendus, cree_le, termine_le, envoye_le, est_demo)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 1)`,
          client.id,
          gabarit.id,
          statut,
          JSON.stringify(contenu),
          statut === 'terminee' ? videoDemo : null,
          statut === 'terminee' && videoDemo ? jeton() : null,
          statut === 'echec' ? choisir(ERREURS) : null,
          statut === 'echec' ? 1 : 0,
          creeLe,
          termineLe,
          envoyeLe,
        );
      }
    }
  });

  return { deja: false, ...compterDemo() };
}

/** Supprime toutes les données DÉMO (et leurs fichiers) */
function supprimerDemo() {
  const videos = db.tous('SELECT DISTINCT fichier_video AS nom FROM commandes WHERE est_demo = 1 AND fichier_video IS NOT NULL');
  const miniatures = db.tous('SELECT miniature AS nom FROM gabarits WHERE est_demo = 1 AND miniature IS NOT NULL');
  const preuves = db.tous('SELECT preuve AS nom FROM paiements WHERE est_demo = 1 AND preuve IS NOT NULL');
  const avant = compterDemo();

  db.transaction(() => {
    const clientsDemo = 'SELECT id FROM clients WHERE est_demo = 1';
    db.executer(`DELETE FROM paiements WHERE est_demo = 1 OR client_id IN (${clientsDemo})`);
    db.executer(`DELETE FROM commandes WHERE est_demo = 1 OR client_id IN (${clientsDemo})`);
    db.executer('DELETE FROM clients WHERE est_demo = 1');
    db.executer('DELETE FROM gabarits WHERE est_demo = 1');
    db.executer('DELETE FROM offres WHERE est_demo = 1');
  });

  // On n'efface que les fichiers qui ne servent plus à rien
  for (const { nom } of videos) if (!db.valeur('SELECT COUNT(*) FROM commandes WHERE fichier_video = ?', nom)) fichiers.supprimer('videos', nom);
  for (const { nom } of miniatures) if (!db.valeur('SELECT COUNT(*) FROM gabarits WHERE miniature = ?', nom)) fichiers.supprimer('miniatures', nom);
  for (const { nom } of preuves) if (!db.valeur('SELECT COUNT(*) FROM paiements WHERE preuve = ?', nom)) fichiers.supprimer('preuves', nom);
  return avant;
}

module.exports = { chargerDemo, supprimerDemo, compterDemo };
