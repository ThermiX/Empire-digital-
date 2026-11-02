import type { Route } from "next";

function resolveSiteUrl(): string {
  const explicit = process.env.NEXT_PUBLIC_SITE_URL;
  if (explicit) return explicit.replace(/\/$/, "");
  const vercel = process.env.VERCEL_PROJECT_PRODUCTION_URL;
  if (vercel) return `https://${vercel}`;
  return "http://localhost:3000";
}

export const siteConfig = {
  name: "Argent Clair",
  tagline: "Votre argent, enfin clair.",
  description:
    "Argent Clair aide les jeunes Africains et les salariés à maîtriser leur budget, épargner chaque mois et investir avec méthode. Simulateur de budget en FCFA, académie gratuite et guides pratiques.",
  url: resolveSiteUrl(),
  locale: "fr_FR",
  currency: "FCFA",
  /** Année affichée dans le pied de page (fixée pour un rendu statique déterministe). */
  copyrightYear: 2026,
} as const;

export type NavItem = { href: Route; label: string; description?: string };

export const mainNav: NavItem[] = [
  { href: "/simulateur", label: "Simulateur", description: "Votre budget en temps réel" },
  { href: "/academie", label: "Académie", description: "Apprendre, à votre rythme" },
  { href: "/ressources", label: "Ressources", description: "Guides et modèles pratiques" },
  { href: "/a-propos", label: "À propos", description: "Notre mission" },
  { href: "/contact", label: "Contact", description: "Une question ? Écrivez-nous" },
];

export const UEMOA_COUNTRIES = [
  "Sénégal",
  "Côte d’Ivoire",
  "Mali",
  "Burkina Faso",
  "Bénin",
  "Togo",
  "Niger",
  "Guinée-Bissau",
] as const;

export const CEMAC_COUNTRIES = [
  "Cameroun",
  "Gabon",
  "Congo",
  "Tchad",
  "Centrafrique",
  "Guinée équatoriale",
] as const;
