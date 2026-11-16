// =============================================================
//  server.js — Point de départ de l'application.
//  Lancer :  npm start   puis ouvrir http://localhost:3000
// =============================================================
const config = require('./config'); // en premier : charge .env et le fuseau horaire
const path = require('node:path');
const os = require('node:os');
const express = require('express');

const db = require('./db/database');
const securite = require('./lib/securite');
const abonnements = require('./lib/abonnements');
const format = require('./lib/format');
const vues = require('./lib/vues');
const { lireParametres } = require('./lib/outils');
const { creerAdminDepuisEnv } = require('./scripts/creer-admin');

const app = express();
app.disable('x-powered-by');
if (config.derriereProxy || config.modeApercu) app.set('trust proxy', true);

// Pages HTML : moteur EJS (dossier views/)
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// ---------- 1. Réglages communs à toutes les requêtes ----------
app.use(securite.entetes);
app.use(express.static(path.join(__dirname, 'public'), { maxAge: '1h' }));
// Police Inter servie localement (pas besoin de Google Fonts)
app.use(
  '/polices',
  express.static(path.join(path.dirname(require.resolve('@fontsource-variable/inter/package.json')), 'files'), {
    maxAge: '30d',
  }),
);
app.use(express.urlencoded({ extended: true, limit: '200kb' }));
app.use(express.json({ limit: '20kb' }));

// Variables disponibles dans toutes les pages
app.use((req, res, next) => {
  req.body ??= {};
  res.locals.f = format; // ex. : f.fcfa(15000) → "15 000 FCFA"
  Object.assign(res.locals, vues); // icone(), badgeStatut(), badgeDemo()…
  res.locals.config = config;
  res.locals.parametres = lireParametres();
  res.locals.flash = null;
  next();
});
app.use(securite.chargerSession);

// ---------- 2. Pages publiques (sans connexion) ----------
app.use(require('./routes/auth')); // /connexion, /deconnexion
app.use(require('./routes/public')); // /v/… : page vidéo envoyée au client

// ---------- 3. Espace admin (connexion obligatoire) ----------
app.use(securite.exigerConnexion);
app.use(securite.verifierCsrf);
app.use(securite.pasDeCache);
app.use(securite.lireFlash);
app.use(abonnements.verifierExpirations);

// Pastilles du menu : nombre de paiements à valider / vidéos en attente
app.use((req, res, next) => {
  if (req.method === 'GET' && !req.path.startsWith('/fichiers/')) {
    res.locals.alertes = {
      paiements: db.valeur(`SELECT COUNT(*) FROM paiements WHERE statut = 'en_attente'`),
      commandes: db.valeur(`SELECT COUNT(*) FROM commandes WHERE statut IN ('en_attente', 'echec')`),
    };
  }
  next();
});

app.use('/', require('./routes/tableau'));
app.use('/clients', require('./routes/clients'));
app.use('/commandes', require('./routes/commandes'));
app.use('/gabarits', require('./routes/gabarits'));
app.use('/paiements', require('./routes/paiements'));
app.use('/offres', require('./routes/offres'));
app.use('/parametres', require('./routes/parametres'));
app.use('/fichiers', require('./routes/fichiers'));

// ---------- 4. Page introuvable & erreurs ----------
app.use((req, res) => {
  res.status(404).render('erreur', { titre: 'Page introuvable', message: "Cette page n'existe pas ou a été supprimée." });
});

app.use((erreur, req, res, next) => {
  console.error(erreur);
  if (res.headersSent) return next(erreur);
  res.status(500).render('erreur', {
    titre: 'Oups, une erreur',
    message: "Une erreur inattendue s'est produite. Réessayez ; si elle revient, regardez le terminal du serveur.",
  });
});

// ---------- 5. Démarrage ----------
creerAdminDepuisEnv().then(() => {
  app.listen(config.port, '0.0.0.0', () => {
    const nbAdmins = db.valeur('SELECT COUNT(*) FROM admins');
    console.log(`\n✅ Animo admin démarré (fuseau ${config.fuseauHoraire})`);
    console.log(`   Sur cet ordinateur : http://localhost:${config.port}`);
    // Adresses à taper sur un téléphone connecté au même Wi-Fi
    for (const interfaces of Object.values(os.networkInterfaces())) {
      for (const i of interfaces || []) {
        if (i.family === 'IPv4' && !i.internal) console.log(`   Sur votre téléphone (même Wi-Fi) : http://${i.address}:${config.port}`);
      }
    }
    if (!nbAdmins) console.log('\n⚠️  Aucun compte admin. Créez-le avec :  npm run creer-admin\n');
  });
});
