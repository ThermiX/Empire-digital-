import Link from "next/link";
import type { Route } from "next";
import { Logo } from "@/components/brand/Logo";
import { ACADEMY_CATEGORIES } from "@/content/academy";
import { siteConfig } from "@/lib/site";

type FooterLink = { href: Route; label: string };

const columns: Array<{ title: string; links: FooterLink[] }> = [
  {
    title: "Outils",
    links: [
      { href: "/simulateur", label: "Simulateur de budget" },
      { href: "/ressources", label: "Guides & modèles" },
      { href: "/academie", label: "Toute l’Académie" },
    ],
  },
  {
    title: "Apprendre",
    links: ACADEMY_CATEGORIES.map((c) => ({
      href: `/academie?categorie=${c.slug}` as Route,
      label: c.label,
    })),
  },
  {
    title: "Argent Clair",
    links: [
      { href: "/a-propos", label: "Notre mission" },
      { href: "/contact", label: "Contact" },
      { href: "/confidentialite", label: "Confidentialité" },
    ],
  },
];

export function Footer() {
  return (
    <footer className="surface-dark no-print relative overflow-hidden bg-ink text-white">
      <div aria-hidden className="bg-noise pointer-events-none absolute inset-0" />
      <div className="container-page relative pt-20 pb-10">
        <div className="grid gap-14 lg:grid-cols-[1.2fr_2fr]">
          <div className="max-w-sm">
            <Logo />
            <p className="mt-5 text-[0.95rem] leading-relaxed text-sage">
              L’éducation financière pensée pour l’Afrique francophone : des outils simples, en FCFA,
              pour gérer son salaire, épargner et bâtir son indépendance.
            </p>
            <p className="mt-6 inline-flex items-center gap-2 rounded-full bg-white/[0.05] px-3 py-1.5 text-xs font-medium text-sage ring-1 ring-inset ring-white/10">
              <span aria-hidden className="size-1.5 rounded-full bg-neon" />
              Zone FCFA · UEMOA &amp; CEMAC
            </p>
          </div>

          <div className="grid grid-cols-2 gap-10 sm:grid-cols-3">
            {columns.map((col) => (
              <nav key={col.title} aria-label={col.title}>
                <h2 className="text-eyebrow font-bold uppercase text-sage-500">{col.title}</h2>
                <ul className="mt-5 space-y-3">
                  {col.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="text-[0.92rem] text-sage-200 transition-colors duration-200 hover:text-neon"
                      >
                        {link.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>

        <div className="mt-16 border-t border-white/[0.08] pt-8">
          <p className="max-w-3xl text-xs leading-relaxed text-sage-500">
            Les contenus d’Argent Clair ont une vocation pédagogique et ne constituent pas un conseil
            financier, fiscal ou en investissement personnalisé. Les résultats du simulateur sont des
            estimations basées sur les montants que vous saisissez.
          </p>
          <div className="mt-6 flex flex-col gap-3 text-xs text-sage-500 sm:flex-row sm:items-center sm:justify-between">
            <p>
              © {siteConfig.copyrightYear} {siteConfig.name}. Tous droits réservés.
            </p>
            <p>Montants exprimés en francs CFA (XOF).</p>
          </div>
        </div>
      </div>

      <p
        aria-hidden
        className="pointer-events-none relative -mb-[0.18em] select-none text-center text-[clamp(4rem,16.5vw,15rem)] font-bold leading-none tracking-[-0.06em] text-ink-700"
      >
        argent clair
      </p>
    </footer>
  );
}
