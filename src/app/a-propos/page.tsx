import type { Metadata } from "next";
import { Ban, Compass, Eye, HandHeart, Layers, Scale } from "lucide-react";
import { PageHero } from "@/components/layout/PageHero";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";

export const metadata: Metadata = {
  title: "À propos — Notre mission",
  description:
    "Argent Clair veut rendre l’éducation financière accessible à toute l’Afrique francophone : des outils simples, en FCFA, pour gérer son salaire, épargner et bâtir son indépendance.",
  alternates: { canonical: "/a-propos" },
};

const VALUES = [
  { icon: Eye, title: "Clarté", text: "Pas de jargon, pas de petites lignes. Chaque calcul est expliqué, chaque conseil justifié." },
  { icon: Compass, title: "Pragmatisme", text: "Des méthodes testées dans la vraie vie : un salaire qui arrive le 30, une famille à soutenir, une tontine au bureau." },
  { icon: HandHeart, title: "Respect", text: "La solidarité familiale n’est pas un problème à éliminer, c’est une réalité à organiser." },
  { icon: Scale, title: "Indépendance", text: "Nous ne vendons aucun produit financier et ne touchons aucune commission sur vos décisions." },
];

const NEVER = [
  "Vous promettre de devenir riche rapidement.",
  "Vendre ou partager vos données personnelles.",
  "Recommander un produit parce qu’il nous rapporte une commission.",
  "Présenter la cryptomonnaie ou le trading comme une solution miracle.",
];

const ROADMAP = [
  { when: "Disponible", title: "Simulateur, Académie, guides gratuits", text: "Les fondations : comprendre et calculer son budget en FCFA.", done: true },
  { when: "Prochaine étape", title: "Guides premium et paiement mobile", text: "Des guides approfondis, achetables via les moyens de paiement locaux.", done: false },
  { when: "Ensuite", title: "Contenus audio en langues locales", text: "Wolof, bambara, dioula, fon, éwé : apprendre aussi à l’oral.", done: false },
  { when: "À terme", title: "Ateliers en entreprise", text: "Des sessions d’éducation financière pour les salariés, sur le lieu de travail.", done: false },
];

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow="À propos"
        title={
          <>
            L’éducation financière, <span className="text-neon">pour tous</span>, en francs CFA.
          </>
        }
        lead="Argent Clair est né d’un constat simple : on apprend à gagner de l’argent, rarement à le gérer. Nous voulons que chaque jeune et chaque salarié d’Afrique francophone dispose des outils pour décider de son avenir financier."
      />

      <section aria-labelledby="mission" className="bg-white py-24 sm:py-32">
        <div className="container-page grid gap-16 lg:grid-cols-2">
          <Reveal>
            <SectionHeading id="mission" index="01" eyebrow="Mission" title="Rendre chaque franc compréhensible." />
          </Reveal>
          <Reveal delay={0.1} className="space-y-5 text-lg leading-relaxed text-muted">
            <p>
              Le premier salaire, une tontine entre collègues, un microcrédit pour la boutique, une offre « trop belle pour
              être vraie » sur un groupe de messagerie : les décisions financières arrivent tôt, et souvent sans mode
              d’emploi.
            </p>
            <p>
              Notre mission est de fournir ce mode d’emploi. Des outils gratuits qui calculent en FCFA, des cours qui partent
              de situations que vous connaissez, et des guides que l’on peut imprimer et partager en famille.
            </p>
            <p className="font-semibold text-ink">
              Notre vision : une génération qui épargne avant de dépenser, emprunte en connaissant le coût, et investit sans
              se faire piéger.
            </p>
          </Reveal>
        </div>
      </section>

      <section aria-labelledby="valeurs" className="bg-paper py-24 sm:py-32">
        <div className="container-page">
          <Reveal>
            <SectionHeading id="valeurs" index="02" eyebrow="Nos principes" title="Ce qui guide chaque contenu." />
          </Reveal>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {VALUES.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} as="li" delay={i * 0.06}>
                <div className="h-full rounded-[1.6rem] border border-line bg-white p-6 shadow-card">
                  <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-ink text-neon">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <h3 className="mt-6 text-lg font-bold">{title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{text}</p>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="jamais" className="surface-dark bg-ink py-24 text-white sm:py-32">
        <div className="container-page grid gap-14 lg:grid-cols-2 lg:items-center">
          <Reveal>
            <SectionHeading
              id="jamais"
              index="03"
              tone="dark"
              eyebrow="Nos engagements"
              title="Ce que nous ne ferons jamais."
              lead="La confiance se construit aussi par ce que l’on refuse."
            />
          </Reveal>
          <ul className="space-y-3">
            {NEVER.map((n, i) => (
              <Reveal key={n} as="li" delay={i * 0.06}>
                <div className="flex items-center gap-4 rounded-2xl bg-white/[0.04] p-5 ring-1 ring-inset ring-white/[0.08]">
                  <Ban className="size-5 shrink-0 text-danger" aria-hidden />
                  <span className="font-medium">{n}</span>
                </div>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      <section aria-labelledby="feuille-de-route" className="bg-white py-24 sm:py-32">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              id="feuille-de-route"
              index="04"
              eyebrow="Feuille de route"
              title="Où nous allons."
              lead="Seule la première étape est disponible aujourd’hui. Les suivantes sont nos priorités, pas des promesses datées."
            />
          </Reveal>
          <ol className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
            {ROADMAP.map((r, i) => (
              <Reveal key={r.title} as="li" delay={i * 0.06}>
                <div className={r.done ? "surface-dark h-full rounded-[1.6rem] bg-ink p-6 text-white" : "h-full rounded-[1.6rem] border border-dashed border-line p-6"}>
                  <p className={r.done ? "inline-flex items-center gap-2 text-xs font-bold text-neon" : "inline-flex items-center gap-2 text-xs font-bold text-subtle"}>
                    <Layers className="size-3.5" aria-hidden /> {r.when}
                  </p>
                  <h3 className="mt-5 text-lg font-bold leading-snug">{r.title}</h3>
                  <p className={r.done ? "mt-2 text-sm leading-relaxed text-sage" : "mt-2 text-sm leading-relaxed text-muted"}>{r.text}</p>
                </div>
              </Reveal>
            ))}
          </ol>
          <div className="mt-16 flex flex-col gap-3 sm:flex-row">
            <ButtonLink href="/simulateur" variant="dark" size="lg" arrow>
              Essayer le simulateur
            </ButtonLink>
            <ButtonLink href="/contact" variant="outline" size="lg">
              Nous écrire
            </ButtonLink>
          </div>
        </div>
      </section>
    </>
  );
}
