export type CoverVariant = "envelopes" | "calendar" | "grid" | "shield" | "chart" | "circle" | "bars" | "rings";

export interface Resource {
  slug: string;
  title: string;
  subtitle: string;
  description: string;
  format: "PDF";
  pages: number;
  /** Prix en FCFA. 0 = gratuit. */
  price: number;
  /** Fichier téléchargeable (ressources gratuites uniquement). */
  file?: string;
  fileSize?: string;
  cover: CoverVariant;
  audience: string;
  highlights: string[];
  contents?: string[];
}

export const RESOURCES: Resource[] = [
  {
    slug: "guide-premier-salaire",
    title: "Le guide du premier salaire",
    subtitle: "Méthode en 5 enveloppes",
    description:
      "Tout ce qu’il faut faire le jour où votre salaire tombe : répartition en enveloppes, budget type, routine mensuelle et check-list des premiers mois.",
    format: "PDF",
    pages: 6,
    price: 0,
    file: "/guides/guide-premier-salaire.pdf",
    cover: "envelopes",
    audience: "Jeunes salariés",
    highlights: ["Budget type pour 250 000 FCFA", "Routine du jour de paie", "Check-list des 6 premiers mois"],
  },
  {
    slug: "defi-epargne-52-semaines",
    title: "Défi épargne 52 semaines",
    subtitle: "Tableau de suivi à imprimer",
    description:
      "Épargnez un peu plus chaque semaine pendant un an. Deux versions du défi (douce et classique), avec cases à cocher et totaux cumulés en FCFA.",
    format: "PDF",
    pages: 3,
    price: 0,
    file: "/guides/defi-epargne-52-semaines.pdf",
    cover: "calendar",
    audience: "Tous profils",
    highlights: ["Version douce : 689 000 FCFA en un an", "Version classique : 1 378 000 FCFA", "Cases à cocher et cumuls"],
  },
  {
    slug: "modele-budget-mensuel",
    title: "Modèle de budget mensuel",
    subtitle: "Fiche à remplir",
    description:
      "Une fiche claire pour poser vos revenus, vos dépenses fixes et variables, votre épargne et faire le bilan du mois. À imprimer ou à remplir sur tablette.",
    format: "PDF",
    pages: 2,
    price: 0,
    file: "/guides/modele-budget-mensuel.pdf",
    cover: "grid",
    audience: "Tous profils",
    highlights: ["Revenus, besoins, envies, épargne", "Bilan de fin de mois", "Compatible avec le simulateur"],
  },
  {
    slug: "checklist-anti-arnaques",
    title: "Check-list anti-arnaques",
    subtitle: "Protéger son argent",
    description:
      "Les 12 questions à se poser avant de confier son argent, les arnaques au mobile money les plus courantes et les bons réflexes si l’on est victime.",
    format: "PDF",
    pages: 2,
    price: 0,
    file: "/guides/checklist-anti-arnaques.pdf",
    cover: "shield",
    audience: "Tous profils",
    highlights: ["12 questions avant d’investir", "Les arnaques mobile money", "Que faire si l’on est victime"],
  },
  {
    slug: "investir-brvm-guide-debutant",
    title: "Investir à la BRVM",
    subtitle: "Le guide du débutant",
    description:
      "Comprendre le fonctionnement de la Bourse régionale, choisir une SGI, lire un cours, construire un premier portefeuille diversifié et éviter les erreurs classiques.",
    format: "PDF",
    pages: 48,
    price: 9900,
    cover: "chart",
    audience: "Épargnants avec fonds d’urgence constitué",
    highlights: ["Ouvrir un compte-titres pas à pas", "Actions, obligations, FCP", "Construire un plan d’investissement régulier"],
    contents: [
      "Avant d’investir : les prérequis",
      "Comment fonctionne la BRVM",
      "Choisir sa SGI et comparer les frais",
      "Actions, obligations et fonds : les différences",
      "Lire un cours et un rapport annuel",
      "Construire un portefeuille diversifié",
      "Fiscalité et dividendes : les bases",
      "Les 10 erreurs du débutant",
    ],
  },
  {
    slug: "tontine-solide",
    title: "Organiser une tontine solide",
    subtitle: "Règlement type inclus",
    description:
      "Créer ou rejoindre une tontine fiable : choix des membres, règlement écrit, gestion des retards, registre des versements et prévention des conflits.",
    format: "PDF",
    pages: 24,
    price: 4900,
    cover: "circle",
    audience: "Groupes d’épargne, collègues, associations",
    highlights: ["Règlement type à adapter", "Registre des cotisations", "Gérer retards et litiges"],
    contents: [
      "Pourquoi la tontine fonctionne",
      "Choisir les membres et le montant",
      "Rédiger le règlement",
      "Le rôle du trésorier",
      "Suivre les versements",
      "Gérer un retard ou un départ",
      "Tontine et épargne personnelle",
    ],
  },
  {
    slug: "lancer-activite-500000",
    title: "Lancer son activité avec 500 000 FCFA",
    subtitle: "Du test au premier bénéfice",
    description:
      "Une méthode concrète pour tester une idée, calculer son prix de revient, tenir sa caisse et se verser un salaire sans mettre son activité en danger.",
    format: "PDF",
    pages: 36,
    price: 7500,
    cover: "bars",
    audience: "Porteurs de projet, commerçants, freelances",
    highlights: ["Modèles de prix de revient", "Cahier de caisse type", "Plan de trésorerie sur 6 mois"],
    contents: [
      "Valider son idée en 30 jours",
      "Prix de revient et marge",
      "Séparer caisse et poche",
      "Le cahier de caisse",
      "Plan de trésorerie sur 6 mois",
      "Microcrédit : quand et comment",
      "Se verser un salaire",
    ],
  },
  {
    slug: "pack-independance-financiere",
    title: "Pack Indépendance financière",
    subtitle: "Les 3 guides premium réunis",
    description:
      "Le parcours complet : investir à la BRVM, organiser une tontine solide et lancer son activité. Pensé pour passer de l’épargne à la construction d’un patrimoine.",
    format: "PDF",
    pages: 108,
    price: 14900,
    cover: "rings",
    audience: "Ceux qui veulent aller plus loin",
    highlights: ["3 guides premium", "Plus de 100 pages", "Économie de 7 400 FCFA par rapport aux guides seuls"],
    contents: [
      "Investir à la BRVM — le guide du débutant",
      "Organiser une tontine solide",
      "Lancer son activité avec 500 000 FCFA",
    ],
  },
];

export const FREE_RESOURCES = RESOURCES.filter((r) => r.price === 0);
export const PREMIUM_RESOURCES = RESOURCES.filter((r) => r.price > 0);
