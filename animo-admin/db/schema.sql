-- =============================================================
--  Base de données Animo (SQLite)
--
--  Ce fichier est relu à chaque démarrage : grâce à
--  « IF NOT EXISTS », rien n'est écrasé, vos données sont gardées.
--
--  Conventions :
--   • Dates   : texte « AAAA-MM-JJ HH:MM:SS » (heure du fuseau choisi)
--   • Jours   : texte « AAAA-MM-JJ »
--   • Montants: nombres entiers en FCFA (pas de centimes)
--   • est_demo = 1 : ligne de démonstration, affichée avec le badge DÉMO
-- =============================================================

-- Comptes administrateurs (seuls eux peuvent se connecter)
CREATE TABLE IF NOT EXISTS admins (
  id                  INTEGER PRIMARY KEY AUTOINCREMENT,
  email               TEXT NOT NULL UNIQUE COLLATE NOCASE,
  mot_de_passe_hash   TEXT NOT NULL,          -- jamais le mot de passe en clair
  cree_le             TEXT NOT NULL,
  derniere_connexion  TEXT
);

-- Sessions de connexion (une ligne = un appareil connecté)
CREATE TABLE IF NOT EXISTS sessions (
  id_hash            TEXT PRIMARY KEY,        -- empreinte du jeton (le jeton n'existe que dans le cookie)
  admin_id           INTEGER NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
  jeton_csrf         TEXT NOT NULL,           -- protège les formulaires
  cree_le            INTEGER NOT NULL,        -- millisecondes
  derniere_activite  INTEGER NOT NULL,        -- millisecondes
  ip                 TEXT,
  appareil           TEXT,
  flash              TEXT                     -- message à afficher après une action
);

-- Tentatives de connexion ratées (anti force brute)
CREATE TABLE IF NOT EXISTS tentatives_connexion (
  id     INTEGER PRIMARY KEY AUTOINCREMENT,
  ip     TEXT NOT NULL,
  email  TEXT,
  le     INTEGER NOT NULL                     -- millisecondes
);

-- Offres d'abonnement
CREATE TABLE IF NOT EXISTS offres (
  id               INTEGER PRIMARY KEY AUTOINCREMENT,
  nom              TEXT NOT NULL,
  prix_fcfa        INTEGER NOT NULL CHECK (prix_fcfa >= 0),
  videos_par_mois  INTEGER NOT NULL CHECK (videos_par_mois >= 0),
  duree_jours      INTEGER NOT NULL DEFAULT 30 CHECK (duree_jours > 0),
  description      TEXT,
  active           INTEGER NOT NULL DEFAULT 1, -- 0 = plus proposée aux nouveaux abonnés
  est_demo         INTEGER NOT NULL DEFAULT 0,
  cree_le          TEXT NOT NULL
);

-- Clients (commerces et créateurs)
CREATE TABLE IF NOT EXISTS clients (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  nom               TEXT NOT NULL,
  whatsapp          TEXT NOT NULL,            -- format international : +2250700000000
  activite          TEXT,                     -- boutique, restaurant, créateur…
  ville             TEXT,
  offre_id          INTEGER REFERENCES offres(id) ON DELETE SET NULL,
  statut            TEXT NOT NULL DEFAULT 'essai'
                    CHECK (statut IN ('essai', 'actif', 'expire', 'suspendu')),
  date_inscription  TEXT NOT NULL,
  fin_abonnement    TEXT,                     -- dernier jour couvert (AAAA-MM-JJ)
  notes             TEXT,
  est_demo          INTEGER NOT NULL DEFAULT 0
);

-- Gabarits de vidéos (modèles que le client personnalise)
CREATE TABLE IF NOT EXISTS gabarits (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  nom             TEXT NOT NULL,
  description     TEXT,
  miniature       TEXT,                       -- nom du fichier image (dossier miniatures)
  duree_secondes  INTEGER NOT NULL DEFAULT 15 CHECK (duree_secondes > 0),
  format          TEXT,
  -- Champs à remplir par le client, en JSON :
  -- [{"type":"texte","libelle":"Nom du produit","obligatoire":true}, …]
  champs          TEXT NOT NULL DEFAULT '[]',
  actif           INTEGER NOT NULL DEFAULT 1,
  est_demo        INTEGER NOT NULL DEFAULT 0,
  cree_le         TEXT NOT NULL,
  modifie_le      TEXT
);

-- Commandes de vidéos
CREATE TABLE IF NOT EXISTS commandes (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  gabarit_id     INTEGER REFERENCES gabarits(id) ON DELETE SET NULL,
  statut         TEXT NOT NULL DEFAULT 'en_attente'
                 CHECK (statut IN ('en_attente', 'en_cours', 'terminee', 'echec')),
  contenu        TEXT NOT NULL DEFAULT '{}',  -- JSON : ce que le client a rempli
  fichier_video  TEXT,                        -- nom du fichier MP4 (dossier videos)
  jeton_partage  TEXT,                        -- lien secret envoyé au client (/v/…)
  erreur         TEXT,                        -- explication si échec
  nb_rendus      INTEGER NOT NULL DEFAULT 0,  -- nombre de relances du rendu
  cree_le        TEXT NOT NULL,
  termine_le     TEXT,
  envoye_le      TEXT,                        -- dernier envoi WhatsApp au client
  est_demo       INTEGER NOT NULL DEFAULT 0
);

-- Paiements (Mobile Money validé à la main)
CREATE TABLE IF NOT EXISTS paiements (
  id             INTEGER PRIMARY KEY AUTOINCREMENT,
  client_id      INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
  offre_id       INTEGER REFERENCES offres(id) ON DELETE SET NULL,
  montant_fcfa   INTEGER NOT NULL CHECK (montant_fcfa > 0),
  moyen          TEXT NOT NULL,               -- Orange Money, Wave, MTN…
  reference      TEXT,                        -- n° de transaction
  numero_payeur  TEXT,
  preuve         TEXT,                        -- capture d'écran (dossier preuves)
  statut         TEXT NOT NULL DEFAULT 'en_attente'
                 CHECK (statut IN ('en_attente', 'valide', 'refuse')),
  date_paiement  TEXT NOT NULL,
  traite_le      TEXT,                        -- date de validation / refus
  traite_par     INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  note           TEXT,
  est_demo       INTEGER NOT NULL DEFAULT 0
);

-- Paramètres de la marque (clé → valeur)
CREATE TABLE IF NOT EXISTS parametres (
  cle     TEXT PRIMARY KEY,
  valeur  TEXT
);

-- Journal des actions des admins (qui a fait quoi, quand)
CREATE TABLE IF NOT EXISTS journal (
  id        INTEGER PRIMARY KEY AUTOINCREMENT,
  admin_id  INTEGER REFERENCES admins(id) ON DELETE SET NULL,
  action    TEXT NOT NULL,
  details   TEXT,
  le        TEXT NOT NULL
);

-- Index : accélèrent les recherches et les filtres
CREATE INDEX IF NOT EXISTS idx_clients_statut      ON clients(statut);
CREATE INDEX IF NOT EXISTS idx_clients_whatsapp    ON clients(whatsapp);
CREATE INDEX IF NOT EXISTS idx_commandes_client    ON commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut    ON commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_termine   ON commandes(termine_le);
CREATE UNIQUE INDEX IF NOT EXISTS idx_commandes_jeton ON commandes(jeton_partage);
CREATE INDEX IF NOT EXISTS idx_paiements_client    ON paiements(client_id);
CREATE INDEX IF NOT EXISTS idx_paiements_statut    ON paiements(statut);
CREATE INDEX IF NOT EXISTS idx_paiements_date      ON paiements(date_paiement);
CREATE INDEX IF NOT EXISTS idx_tentatives_le       ON tentatives_connexion(le);
