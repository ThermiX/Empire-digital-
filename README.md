# Animo : landing page

Une seule page, `index.html` : le CSS et le JavaScript sont intégrés. Elle s'ouvre directement dans un navigateur et se met en ligne sur n'importe quel hébergement statique (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Fichiers du site

Déjà dans le dépôt : `logo.svg` et `logo-blanc.svg` (le logo : le mot « Animo », avec un triangle de lecture doré à la place du point du « i »), leurs versions `logo.png` et `logo-blanc.png`, `favicon.svg` et `favicon.png` (icône carrée), `apercu.jpg` (image de partage, 1200 × 630 px, tirée de la page), et les pages `affiliation.html`, `confidentialite.html`, `conditions.html` et `404.html`.

Facultatif, pour remplacer les scènes animées des exemples par de vraies vidéos (puis mettre `videosExemples` à `true`) :

| Fichier | Format conseillé |
|---|---|
| `exemple-1.mp4` à `exemple-6.mp4` | 9:16, 360 × 640 px minimum, H.264, légères |
| `exemple-1.jpg` à `exemple-6.jpg` | Première image de chaque vidéo |

Dans la page, le logo est du SVG intégré (net sur tous les écrans, rien à télécharger). Pour l'utiliser ailleurs (réseaux sociaux, documents), prends les fichiers `logo*.svg` ou `logo*.png`.

## Pages confidentialité et conditions

`confidentialite.html` décrit ce que la page fait réellement : aucun cookie ni mesure d'audience, polices Google et bibliothèque d'animation chargées depuis des services tiers, aperçu qui reste dans le navigateur, données de paiement transmises à Moneroo. `conditions.html` pose la structure des conditions d'utilisation.

Les informations propres à ta société (raison sociale, adresse, hébergeur, annulation, propriété des vidéos, droit applicable) ne sont pas encore écrites : les pages disent qu'elles seront publiées avant l'ouverture. **Fais relire ces deux pages par un juriste de ton pays avant la mise en ligne** : ce sont des modèles, pas un avis juridique.

## Couleurs

Fond blanc et une seule couleur d'accent (orange `#D4380C`, texte blanc dessus lisible à 4,8:1). Pour changer de couleur, modifier en haut du CSS de `index.html` les variables `--accent`, `--accent-dark`, `--accent-soft` et `--accent-ink`, puis lancer `python3 tools/update-csp.py`. Les pages annexes ont les mêmes variables en tête de leur CSS (`--gold`, `--gold-light`, `--gold-ink`).

## Réglages (liens, numéro, paiement)

Tout se règle dans le bloc `<script type="application/json" id="animo-config">`, vers la fin de `index.html`. Modifier ce bloc ne demande rien d'autre.

| Clé | Rôle |
|---|---|
| `whatsappNumber` | Chiffres seulement, indicatif compris, sans `+` ni espaces. Alimente tous les liens WhatsApp |
| `displayNumber` | Numéro affiché en clair (si vide, il est déduit de `whatsappNumber`) |
| `email` | Adresse affichée dans le pied de page |
| `appUrl` | Lien de l'application. Vide : les boutons « Créer ma vidéo » ouvrent WhatsApp (liste d'attente) |
| `operateurs` | Opérateurs Mobile Money acceptés, affichés sous les offres (par exemple `Orange Money, Moov Money, Wave`). Vide : la ligne n'apparaît pas |
| `videosExemples` | `true` quand `exemple-1.mp4` à `exemple-6.mp4` sont en ligne. `false` : chaque exemple joue une scène animée (aucun fichier demandé) |
| `checkoutEndpoint` | Chemin du service de paiement du site (`/api/checkout`). Vide : pas de formulaire de paiement |
| `paymentLinks` | Un lien de paiement par nom d'offre (par exemple `Essentiel`, `Boutique`), utilisé si le formulaire de paiement ne s'applique pas. Sans lien, le bouton ouvre WhatsApp avec le nom de l'offre |
| `plans` | Les trois offres affichées dans « Tarifs » (voir ci-dessous) |
| `termsUrl`, `privacyUrl` | Pages « Conditions d'utilisation » et « Confidentialité » (`conditions.html` et `confidentialite.html` par défaut) |

Les valeurs sont vérifiées par la page : seules les adresses `https://` sont acceptées (les liens `javascript:` ou `data:` sont ignorés).

## Offres, prix et numéro WhatsApp : où remplir

Tout est dans le bloc `animo-config` (près de la fin de `index.html`).

- **Numéro WhatsApp** : `whatsappNumber` (chiffres seulement, indicatif compris). Vide : « Réserver un échange » fait défiler jusqu'à l'appel final, où figure le numéro à compléter.
- **Offres** : `plans`, trois offres au maximum. Chacune a `id`, `nom`, `type` (`libre-service` ou `sur-mesure`), `description`, `prix_fcfa`, `videos_par_mois`, `avantages` (liste de textes) et `mis_en_avant` (une seule offre, affichée en noir).
- **Tant que `prix_fcfa` est vide**, la carte affiche « Prix annoncé en décembre » et son bouton devient « Rejoindre la liste d'attente ». Un prix renseigné (en chiffres, par exemple `15000`) s'affiche « 15 000 F par mois ».
- **Offre `sur-mesure`** : jamais de prix affiché, bouton « Réserver un échange » vers WhatsApp.
- **Paiement en ligne** : le formulaire de paiement ne s'ouvre que si le nom et le prix de l'offre correspondent à ceux de `lib/payments.mjs` (`PLANS`). Quand vos prix sont décidés, mettez-les aussi à cet endroit. Sinon, les boutons ouvrent WhatsApp ou le lien de `paymentLinks`.

## Page d'affiliation

`affiliation.html` présente le programme d'affiliation (à qui il s'adresse, comment ça marche, règles, questions). Aucun taux, délai ni montant n'est affiché : la page dit qu'ils seront annoncés à l'ouverture du programme. Quand ils sont décidés, ajoute-les dans la section « Ce que tu gagnes » et dans les questions.

Le bouton « Devenir affilié » se règle dans le bloc `animo-config` de `affiliation.html` (près de la fin du fichier) :

| Clé | Rôle |
|---|---|
| `whatsappNumber` | Le même numéro que dans `index.html` (chiffres seulement, avec l'indicatif). Le bouton ouvre WhatsApp avec le message « Bonjour, je veux devenir affilié Animo » |
| `displayNumber` | Numéro affiché en clair (facultatif) |
| `affiliationUrl` | Lien `https://` d'un formulaire d'inscription. S'il est renseigné, il remplace WhatsApp |

Tant que rien n'est renseigné, les boutons font défiler jusqu'au bas de la page. Le suivi des recommandations et le versement des commissions n'existent pas encore : la page décrit le programme, elle ne le fait pas fonctionner. `confidentialite.html` a une section « Si tu deviens affilié ».

## Module de paiement (Moneroo)

Les boutons « Payer l'offre … » ouvrent un formulaire (prénom, nom, e-mail, zone). La page l'envoie à `/api/checkout`, une petite fonction serveur qui crée le paiement chez [Moneroo](https://docs.moneroo.io/payments/standard-integration) puis redirige le client vers la page de paiement de Moneroo (Mobile Money, carte, selon ce que vous activez dans votre compte). Au retour, la page demande au serveur le vrai statut du paiement : elle ne lit jamais le résultat dans l'adresse.

**Mise en route**

1. Créez un compte Moneroo et récupérez la clé secrète de **test**.
2. Mettez ces deux variables d'environnement chez votre hébergeur (jamais dans la page) :
   - `MONEROO_SECRET_KEY` : la clé secrète ;
   - `SITE_ORIGIN` : l'adresse du site, sans barre finale (par exemple `https://animo.example`).
3. Déployez. La fonction est fournie pour les trois hébergeurs :
   - Vercel : `api/checkout.js`
   - Cloudflare Pages : `functions/api/checkout.js`
   - Netlify : `netlify/functions/checkout.mjs`
4. Faites un paiement de test, puis passez à la clé de production.

GitHub Pages ne peut pas exécuter de fonction : le bouton y affiche un message d'erreur. Pour désactiver le formulaire, mettez `"checkoutEndpoint": ""` dans les réglages : les boutons reviennent alors aux liens de paiement ou à WhatsApp.

**Ce que fait la fonction** : les montants (10 000, 20 000 et 30 000) sont fixés dans `lib/payments.mjs`, le navigateur n'envoie que le nom de l'offre ; elle valide chaque champ, n'accepte que les appels venant de `SITE_ORIGIN`, ne renvoie jamais le détail d'une erreur de Moneroo et vérifie que le montant payé correspond à l'offre.

**Ce qui n'existe pas encore**
- Le paiement est **unique pour un mois** : aucun renouvellement automatique (les réseaux Mobile Money demandent une validation du client à chaque fois).
- Aucune activation automatique de l'offre : il n'y a ni application ni base de données. Après un paiement confirmé, le client reçoit une référence à vous envoyer sur WhatsApp. Moneroo envoie aussi un webhook `payment.success` (signé avec l'en-tête `X-Moneroo-Signature`, HMAC-SHA256) à brancher quand l'application existera.
- Pas de limitation du nombre d'essais : activez-la chez l'hébergeur (par exemple les règles de limitation de Cloudflare).

**Tests** : `npm test` lance 10 tests de la fonction contre un faux serveur Moneroo (prix, validation, origine, erreurs, vérification).

## Sécurité

- **Politique de contenu (CSP)** : seuls les scripts et styles de la page, GSAP et les polices Google sont autorisés. Les requêtes du navigateur ne peuvent aller que vers le site lui-même (`connect-src 'self'`) ; aucun cadre, aucun envoi de formulaire.
- **Intégrité** : GSAP et ScrollTrigger sont chargés depuis cdnjs avec une empreinte (`integrity`). Si l'empreinte ne correspondait pas, le navigateur bloquerait le script et la page resterait complète, sans animations.
- **En-têtes HTTP** : `_headers` (Netlify, Cloudflare Pages) et `vercel.json` ajoutent HSTS, `X-Frame-Options`, `Permissions-Policy`, etc. GitHub Pages ne permet pas d'en poser : la balise `meta` de la CSP reste active.
- **Saisies** : l'aperçu interactif n'envoie rien, n'enregistre rien et n'écrit jamais de HTML (uniquement du texte).
- **Liens externes** : `rel="noopener noreferrer"`.

Après toute modification du CSS ou du JavaScript intégrés, relancer :

```bash
python3 tools/update-csp.py
```

Le script recalcule les empreintes dans `index.html`, `_headers` et `vercel.json`. Modifier les textes, les liens ou le bloc de réglages ne le demande pas.

## Ce qui n'apparaît pas tant que ce n'est pas réglé

La page n'affiche aucun texte entre crochets. Le numéro WhatsApp, l'adresse e-mail et les opérateurs acceptés restent invisibles tant qu'ils ne sont pas renseignés dans `animo-config`. Sans numéro, les boutons « Créer ma vidéo » font défiler jusqu'à l'appel final.
