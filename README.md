# Argent Clair

**Votre argent, enfin clair.** Plateforme d’éducation financière pour les jeunes Africains et les salariés de la zone franc CFA : simulateur de budget en FCFA, académie de cours pratiques et guides téléchargeables.

## Pages

| Route | Contenu |
| --- | --- |
| `/` | Hero avec aperçu interactif du simulateur, plateforme, étapes, conseils, ressources gratuites, témoignages **fictifs** (signalés comme tels) |
| `/simulateur` | Simulateur complet : revenus, dépenses (besoin / envie), objectif d’épargne, projet ; synthèse, répartition (Recharts), règle 50/30/20, projection, recommandations |
| `/academie` | 10 articles en 5 catégories, recherche, filtres synchronisés avec l’URL, progression de lecture |
| `/academie/[slug]` | Liseuse : barre de progression, sommaire actif, taille du texte, « marquer comme lu », articles liés, JSON-LD |
| `/ressources` | 4 guides PDF gratuits téléchargeables, 4 guides premium (aperçu, sommaire, liste d’envies) |
| `/a-propos` | Mission, principes, engagements, feuille de route |
| `/contact` | Formulaire validé (client), FAQ |
| `/confidentialite` | Données stockées localement, bouton d’effacement |

## Ce qui est réel, et ce qui ne l’est pas

- ✅ Tous les calculs du simulateur, l’export CSV, la sauvegarde locale (`localStorage`), les filtres, la recherche, les téléchargements PDF.
- ⚠️ **Formulaire de contact** : validation complète, mais **aucun envoi** vers un serveur. L’interface le dit explicitement. Point d’intégration unique : `submitContact()` dans `src/lib/contact.ts`.
- ⚠️ **Guides premium** : aucun paiement n’est simulé ni demandé (« Achat bientôt disponible »).
- ⚠️ **Témoignages** : personnages fictifs, clairement identifiés.

## Stack

Next.js 16 (App Router, Cache Components, rendu statique) · React 19 · TypeScript strict · Tailwind CSS v4 · Framer Motion · Recharts · Lucide · Vitest.

- **Liens typés** (`typedRoutes`) : un lien vers une route inexistante casse la compilation.
- **Recharts** n’est chargé que sur `/simulateur` (import dynamique). L’aperçu de l’accueil est en HTML/CSS léger.
- **Formatage FCFA déterministe** (`src/lib/format.ts`) : identique serveur / navigateur, sans écart d’hydratation.
- **Accessibilité** : lien d’évitement, focus visible, menu mobile modal (Échap, piège de focus), libellés et erreurs reliés aux champs, résumé d’erreurs, vue tableau des graphiques, respect de « réduire les animations ».
- **SEO** : métadonnées par page, sitemap, robots, manifeste, image Open Graph générée, JSON-LD (Organization, Article, BreadcrumbList).

## Démarrer

```bash
npm install
npm run dev        # http://localhost:3000
```

| Commande | Rôle |
| --- | --- |
| `npm run build` / `npm start` | Build et serveur de production |
| `npm run typecheck` | Génère les types de routes puis vérifie TypeScript |
| `npm run lint` | ESLint |
| `npm test` | Tests unitaires (moteur de budget, formatage, validation) |
| `npm run guides` | Régénère les PDF de `public/guides/` (nécessite Playwright + Chromium) |

Variable d’environnement facultative : `NEXT_PUBLIC_SITE_URL` (URL canonique, ex. `https://argentclair.example`).

## Architecture

```
src/
  app/                 routes, métadonnées, sitemap, OG image
  components/
    layout/            en-tête, menu mobile, pied de page, bandeau de page
    ui/                boutons, révélations, notifications, badges
    simulator/         saisie FCFA, éditeurs, synthèse, graphiques, état persistant
    academy/           bibliothèque, cartes, liseuse
    resources/         couvertures génératives, téléchargement, aperçu premium
    contact/           formulaire
  content/             articles, ressources, profils de budget (données typées)
  lib/                 moteur de budget, formatage, stockage, validation (+ tests)
scripts/               génération des guides PDF
```

## Palette

| Rôle | Couleur |
| --- | --- |
| Vert profond | `#124E30` |
| Vert presque noir | `#04180C` |
| Jaune néon | `#E4FF1A` |
| Sauge | `#9FB8A8` |
| Blanc | `#FFFFFF` |

Le néon n’est jamais utilisé en texte sur fond clair (contraste insuffisant) : uniquement en fond ou sur surfaces sombres.

---

Contenu pédagogique : ne constitue pas un conseil financier personnalisé.
