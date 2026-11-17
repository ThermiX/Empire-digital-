# Animo : landing page

Une seule page, `index.html` : le CSS et le JavaScript sont intégrés. Elle s'ouvre directement dans un navigateur et se met en ligne sur n'importe quel hébergement statique (Netlify, Vercel, Cloudflare Pages, GitHub Pages).

## Fichiers à placer à côté de `index.html`

| Fichier | Format conseillé |
|---|---|
| `logo.png` | PNG transparent, environ 112 × 28 px affiché (fourni en 2×). Sans lui, la page affiche « Animo » en texte |
| `logo-blanc.png` | PNG transparent, pour les fonds sombres (non utilisé pour l'instant) |
| `favicon.png` | 64 × 64 px |
| `apercu.jpg` | 1200 × 630 px, image de partage |
| `exemple-1.mp4` à `exemple-6.mp4` | 9:16, 360 × 640 px minimum, H.264, légères |
| `exemple-1.jpg` à `exemple-6.jpg` | Première image de chaque vidéo |

## Réglages (liens, numéro, paiement)

Tout se règle dans le bloc `<script type="application/json" id="animo-config">`, vers la fin de `index.html`. Modifier ce bloc ne demande rien d'autre.

| Clé | Rôle |
|---|---|
| `whatsappNumber` | Chiffres seulement, indicatif compris, sans `+` ni espaces. Alimente tous les liens WhatsApp |
| `displayNumber` | Numéro affiché en clair (si vide, il est déduit de `whatsappNumber`) |
| `email` | Adresse affichée dans le pied de page |
| `appUrl` | Lien de l'application. Vide : les boutons « Créer ma vidéo » ouvrent WhatsApp (liste d'attente) |
| `checkoutEndpoint` | Chemin du service de paiement du site (`/api/checkout`). Vide : pas de formulaire de paiement |
| `paymentLinks` | Un lien de paiement par offre (`Essentiel`, `Pro`, `Business`), utilisé si `checkoutEndpoint` est vide. Sans lien, le bouton ouvre WhatsApp avec le nom de l'offre |
| `termsUrl`, `privacyUrl` | Pages « Conditions d'utilisation » et « Confidentialité » |

Les valeurs sont vérifiées par la page : seules les adresses `https://` sont acceptées (les liens `javascript:` ou `data:` sont ignorés).

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

## Textes à compléter

`[+227 XX XX XX XX]`, `[ADRESSE E-MAIL]`, `[AJOUTER LES OPÉRATEURS ACCEPTÉS]`, `[AJOUTER LES MOYENS DE PAIEMENT]`, `[AJOUTER LA POLITIQUE D'ANNULATION]`, `[AJOUTER LES CONDITIONS D'UTILISATION]`, `[URL]`. Les numéros, l'e-mail et les liens légaux se remplissent via le bloc de réglages ; les trois réponses de la FAQ se modifient dans le HTML.
