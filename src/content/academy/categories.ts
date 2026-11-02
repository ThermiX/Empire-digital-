import type { AcademyCategory } from "./types";

export const ACADEMY_CATEGORIES: AcademyCategory[] = [
  {
    slug: "salaire",
    label: "Gestion du salaire",
    short: "Salaire",
    description: "Organiser son salaire dès sa réception pour que chaque franc ait un rôle.",
  },
  {
    slug: "epargne",
    label: "Épargne",
    short: "Épargne",
    description: "Mettre de côté régulièrement, même avec un petit revenu, et choisir où placer.",
  },
  {
    slug: "entrepreneuriat",
    label: "Entrepreneuriat",
    short: "Entreprendre",
    description: "Lancer et piloter une activité sans confondre caisse de l’entreprise et poche personnelle.",
  },
  {
    slug: "finance-personnelle",
    label: "Finance personnelle",
    short: "Finance perso",
    description: "Crédit, investissement, protection : les bases pour bâtir son patrimoine.",
  },
  {
    slug: "erreurs",
    label: "Erreurs à éviter",
    short: "Erreurs",
    description: "Les pièges les plus fréquents, et comment s’en protéger concrètement.",
  },
];
