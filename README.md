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
| `paymentLinks` | Un lien de paiement par offre (`Essentiel`, `Pro`, `Business`). Renseigné : le bouton devient « Payer l'offre … » et ouvre ce lien. Vide : le bouton ouvre WhatsApp avec le nom de l'offre |
| `termsUrl`, `privacyUrl` | Pages « Conditions d'utilisation » et « Confidentialité » |

Les valeurs sont vérifiées par la page : seules les adresses `https://` sont acceptées (les liens `javascript:` ou `data:` sont ignorés).

### Pourquoi la page ne prend pas le paiement elle-même

Un paiement Mobile Money demande un prestataire de paiement et un serveur qui crée la transaction et vérifie la confirmation. La clé secrète de ce prestataire ne doit jamais se trouver dans une page publique. La page reste donc statique et envoie le client vers un lien de paiement hébergé (`paymentLinks`), ou vers WhatsApp tant qu'il n'existe pas. Le paiement dans l'application viendra avec les comptes utilisateurs.

## Sécurité

- **Politique de contenu (CSP)** : seuls les scripts et styles de la page, GSAP et les polices Google sont autorisés. Aucune requête réseau sortante (`connect-src 'none'`), aucun formulaire, aucun cadre.
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
