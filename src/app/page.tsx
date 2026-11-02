import type { Route } from "next";
import Link from "next/link";
import {
  ArrowUpRight,
  BookOpenText,
  Calculator,
  FileDown,
  HardDrive,
  ListChecks,
  ShieldCheck,
  Target,
  Wallet,
} from "lucide-react";
import { HeroPreview } from "@/components/home/HeroPreview";
import { ResourceCard } from "@/components/resources/ResourcesLibrary";
import { Badge } from "@/components/ui/Badge";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/ui/Reveal";
import { SectionHeading } from "@/components/ui/SectionHeading";
import { Spotlight } from "@/components/ui/Spotlight";
import { ARTICLES, getArticle } from "@/content/academy";
import { FREE_RESOURCES } from "@/content/resources";
import { CEMAC_COUNTRIES, UEMOA_COUNTRIES, siteConfig } from "@/lib/site";

const TIPS: Array<{ n: string; title: string; text: string; slug: string }> = [
  {
    n: "01",
    title: "Épargnez le jour de la paie",
    text: "Pas « ce qui reste » à la fin du mois. Un virement automatique, même de 10 000 FCFA, change tout.",
    slug: "methode-des-enveloppes-salaire",
  },
  {
    n: "02",
    title: "Trois mois de sécurité d’abord",
    text: "Avant d’investir, constituez un fonds d’urgence de 3 à 6 mois de dépenses essentielles.",
    slug: "fonds-urgence-premier-objectif",
  },
  {
    n: "03",
    title: "Un tiers maximum pour vos crédits",
    text: "Vos remboursements cumulés ne devraient jamais dépasser 33 % de votre revenu net.",
    slug: "credit-taux-et-endettement",
  },
  {
    n: "04",
    title: "Rendement garanti = danger",
    text: "Personne ne peut garantir 20 % par mois. Urgence et secret sont des signaux d’alerte.",
    slug: "arnaques-financieres-reconnaitre",
  },
];

const TESTIMONIALS = [
  {
    quote:
      "Je pensais ne rien pouvoir mettre de côté avec mon salaire. En classant mes dépenses, j’ai retrouvé 35 000 FCFA par mois qui partaient en petits achats.",
    name: "Awa",
    role: "Assistante comptable, 26 ans",
    city: "Dakar",
  },
  {
    quote:
      "La séparation entre la caisse de ma boutique et mon argent personnel a été un déclic. Je sais enfin combien mon activité me rapporte vraiment.",
    name: "Koffi",
    role: "Commerçant, 34 ans",
    city: "Lomé",
  },
  {
    quote:
      "Le défi des 52 semaines est devenu un jeu à la maison. On a financé la rentrée scolaire sans emprunter, pour la première fois.",
    name: "Mariam",
    role: "Enseignante, mère de deux enfants",
    city: "Bamako",
  },
];

const STEPS = [
  { icon: Wallet, title: "Entrez vos revenus", text: "Salaire net, activité complémentaire, transferts reçus : tout ce qui rentre chaque mois." },
  { icon: ListChecks, title: "Classez vos dépenses", text: "Chaque poste devient un besoin ou une envie. Les suggestions vous font gagner du temps." },
  { icon: Target, title: "Fixez votre objectif", text: "Un pourcentage ou un montant, et un projet. Le simulateur calcule quand vous l’atteindrez." },
];

export default function HomePage() {
  const featuredFree = FREE_RESOURCES.slice(0, 3);
  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Organization",
        name: siteConfig.name,
        url: siteConfig.url,
        description: siteConfig.description,
        areaServed: [...UEMOA_COUNTRIES, ...CEMAC_COUNTRIES],
      },
      { "@type": "WebSite", name: siteConfig.name, url: siteConfig.url, inLanguage: "fr" },
    ],
  };

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }} />

      {/* ------------------------------------------------------------ Hero */}
      <section className="surface-dark relative isolate overflow-hidden bg-ink text-white">
        <div aria-hidden className="bg-ledger absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_center,black_20%,transparent_70%)]" />
        <div aria-hidden className="bg-noise absolute inset-0 -z-10" />
        <div aria-hidden className="absolute top-[-20%] left-[-10%] -z-10 size-[620px] rounded-full bg-forest/60 blur-[140px]" />
        <div aria-hidden className="absolute right-[-15%] bottom-[-30%] -z-10 size-[520px] rounded-full bg-forest/40 blur-[120px]" />

        <div className="container-page grid items-center gap-16 pt-32 pb-24 sm:pt-40 lg:grid-cols-[1.1fr_1fr] lg:gap-12 lg:pb-32 xl:gap-20">
          <div>
            <p className="animate-rise inline-flex items-center gap-2 rounded-full bg-white/[0.05] py-1.5 pr-4 pl-1.5 text-xs font-semibold text-sage-200 ring-1 ring-inset ring-white/10">
              <span className="rounded-full bg-neon px-2 py-0.5 text-[0.68rem] font-bold text-ink">Nouveau</span>
              Simulateur de budget en FCFA, gratuit
            </p>
            <h1 className="animate-rise mt-7 text-display-2xl font-semibold text-balance [animation-delay:80ms]">
              Votre argent, <span className="relative whitespace-nowrap text-neon">enfin clair.</span>
            </h1>
            <p className="animate-rise mt-7 max-w-xl text-lg leading-relaxed text-sage text-pretty sm:text-xl [animation-delay:160ms]">
              Argent Clair aide les jeunes Africains et les salariés à maîtriser leur budget, épargner chaque mois et
              investir avec méthode, en francs CFA et sans jargon.
            </p>
            <div className="animate-rise mt-10 flex flex-col gap-3 sm:flex-row [animation-delay:240ms]">
              <ButtonLink href="/simulateur" size="lg" arrow>
                Simuler mon budget
              </ButtonLink>
              <ButtonLink href="/academie" size="lg" variant="outline-light">
                Explorer l’Académie
              </ButtonLink>
            </div>
            <ul className="animate-rise mt-10 flex flex-wrap gap-x-6 gap-y-3 text-sm text-sage-200 [animation-delay:320ms]">
              {[
                { icon: ShieldCheck, label: "100 % gratuit" },
                { icon: HardDrive, label: "Données gardées sur votre appareil" },
                { icon: BookOpenText, label: `${ARTICLES.length} cours pratiques` },
              ].map(({ icon: Icon, label }) => (
                <li key={label} className="inline-flex items-center gap-2">
                  <Icon className="size-4 text-neon" aria-hidden />
                  {label}
                </li>
              ))}
            </ul>
          </div>
          <div className="animate-rise mx-auto w-full max-w-md [animation-delay:200ms] lg:max-w-none">
            <HeroPreview />
          </div>
        </div>

        {/* Bandeau zone FCFA */}
        <div className="border-t border-white/[0.07] py-5">
          <p className="sr-only">Pensé pour les pays de la zone franc CFA : {[...UEMOA_COUNTRIES, ...CEMAC_COUNTRIES].join(", ")}.</p>
          <div aria-hidden className="flex overflow-hidden [mask-image:linear-gradient(90deg,transparent,black_10%,black_90%,transparent)]">
            <div className="flex shrink-0 animate-marquee gap-10 pr-10 text-sm font-medium whitespace-nowrap text-sage-500">
              {[0, 1].map((k) => (
                <div key={k} className="flex gap-10">
                  {[...UEMOA_COUNTRIES, ...CEMAC_COUNTRIES].map((c) => (
                    <span key={`${k}-${c}`} className="inline-flex items-center gap-10">
                      {c}
                      <span className="size-1 rounded-full bg-sage-500/60" />
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ------------------------------------------------------- Fonctionnalités */}
      <section aria-labelledby="fonctionnalites" className="bg-white py-24 sm:py-32">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              id="fonctionnalites"
              index="01"
              eyebrow="La plateforme"
              title="Trois outils pour reprendre la main sur votre argent."
              lead="Comprendre, calculer, agir : Argent Clair réunit au même endroit ce qu’il faut pour passer de « je n’arrive pas à épargner » à un plan concret."
            />
          </Reveal>

          <div className="mt-16 grid gap-5 lg:grid-cols-6 lg:grid-rows-[auto_auto]">
            <Reveal className="lg:col-span-4 lg:row-span-2">
              <Spotlight tone="dark" className="h-full rounded-[2rem]">
                <Link
                  href="/simulateur"
                  className="surface-dark group flex h-full flex-col justify-between gap-10 rounded-[2rem] bg-ink p-7 text-white sm:p-10"
                >
                  <div>
                    <Badge tone="dark" icon={<Calculator aria-hidden />}>Simulateur de budget</Badge>
                    <h3 className="mt-6 max-w-lg text-display-lg font-semibold text-balance">
                      Voyez en temps réel ce qu’il vous reste, et ce que vous pouvez épargner.
                    </h3>
                    <p className="mt-4 max-w-lg leading-relaxed text-sage">
                      Revenus, dépenses, objectif : chaque modification met à jour votre taux d’épargne, la répartition
                      de votre argent et la date d’atteinte de votre projet.
                    </p>
                  </div>
                  <div className="grid gap-3 sm:grid-cols-3">
                    {[
                      ["Revenu total", "380 000 FCFA"],
                      ["Dépenses", "315 000 FCFA"],
                      ["Épargne", "65 000 FCFA"],
                    ].map(([l, v], i) => (
                      <div key={l} className="rounded-2xl bg-white/[0.04] p-4 ring-1 ring-inset ring-white/[0.07]">
                        <p className="text-xs text-sage">{l}</p>
                        <p className={i === 2 ? "mt-1 text-lg font-bold text-neon" : "mt-1 text-lg font-bold"}>{v}</p>
                      </div>
                    ))}
                  </div>
                  <span className="inline-flex items-center gap-2 text-sm font-bold text-neon">
                    Ouvrir le simulateur
                    <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                  </span>
                </Link>
              </Spotlight>
            </Reveal>
            <Reveal delay={0.08} className="lg:col-span-2">
              <FeatureCard
                href="/academie"
                icon={<BookOpenText className="size-5" aria-hidden />}
                title="L’Académie"
                text={`${ARTICLES.length} cours concrets : salaire, épargne, tontine, crédit, entreprise, arnaques.`}
                cta="Commencer à apprendre"
              />
            </Reveal>
            <Reveal delay={0.16} className="lg:col-span-2">
              <FeatureCard
                href="/ressources"
                icon={<FileDown className="size-5" aria-hidden />}
                title="Les ressources"
                text="Guides PDF, défi 52 semaines, modèle de budget : prêts à télécharger et à imprimer."
                cta="Voir les guides"
              />
            </Reveal>
          </div>
        </div>
      </section>

      {/* --------------------------------------------------- Comment ça marche */}
      <section aria-labelledby="comment" className="bg-paper py-24 sm:py-32">
        <div className="container-page grid gap-16 lg:grid-cols-[1fr_1.2fr] lg:items-center">
          <Reveal>
            <SectionHeading
              id="comment"
              index="02"
              eyebrow="Le simulateur"
              title="Votre budget, en trois étapes et deux minutes."
              lead="Pas de compte à créer, pas de données envoyées : tout est calculé et enregistré directement dans votre navigateur."
            />
            <ButtonLink href="/simulateur" variant="dark" arrow className="mt-10">
              Essayer maintenant
            </ButtonLink>
          </Reveal>
          <ol className="relative space-y-4">
            <span aria-hidden className="absolute top-8 bottom-8 left-[2.15rem] w-px bg-gradient-to-b from-forest/40 via-forest/20 to-transparent" />
            {STEPS.map(({ icon: Icon, title, text }, i) => (
              <Reveal key={title} as="li" delay={i * 0.08}>
                <div className="relative flex gap-5 rounded-3xl border border-line bg-white p-5 shadow-card sm:p-6">
                  <span className="relative inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-ink text-neon">
                    <Icon className="size-5" aria-hidden />
                  </span>
                  <div>
                    <p className="text-xs font-bold tabular-nums text-forest-300">Étape {i + 1}</p>
                    <h3 className="mt-1 text-lg font-bold tracking-[-0.015em]">{title}</h3>
                    <p className="mt-1.5 text-sm leading-relaxed text-muted">{text}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </ol>
        </div>
      </section>

      {/* ------------------------------------------------------------ Conseils */}
      <section aria-labelledby="conseils" className="bg-white py-24 sm:py-32">
        <div className="container-page">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <SectionHeading
                id="conseils"
                index="03"
                eyebrow="Conseils financiers"
                title="Quatre règles simples qui changent tout."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <ButtonLink href="/academie" variant="outline" arrow>
                Tous les cours
              </ButtonLink>
            </Reveal>
          </div>
          <ul className="mt-14 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {TIPS.map((tip, i) => {
              const article = getArticle(tip.slug);
              return (
                <Reveal key={tip.n} as="li" delay={i * 0.06}>
                  <Link
                    href={`/academie/${tip.slug}` as Route}
                    className="group flex h-full flex-col rounded-[1.6rem] border border-line p-6 transition-[border-color,background-color,transform] duration-300 hover:-translate-y-1 hover:border-forest/25 hover:bg-paper"
                  >
                    <span className="text-[2.6rem] font-semibold leading-none tracking-[-0.05em] text-forest-300 transition-colors group-hover:text-forest">
                      {tip.n}
                    </span>
                    <h3 className="mt-8 text-lg font-bold leading-snug tracking-[-0.015em]">{tip.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-muted">{tip.text}</p>
                    <span className="mt-auto inline-flex items-center gap-1.5 pt-6 text-xs font-bold text-forest">
                      Lire le cours{article ? ` · ${article.readingMinutes} min` : ""}
                      <ArrowUpRight className="size-3.5 transition-transform group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
                    </span>
                  </Link>
                </Reveal>
              );
            })}
          </ul>
        </div>
      </section>

      {/* ---------------------------------------------------------- Ressources */}
      <section aria-labelledby="ressources-gratuites" className="surface-dark relative overflow-hidden bg-ink py-24 text-white sm:py-32">
        <div aria-hidden className="bg-ledger absolute inset-0 opacity-60 [mask-image:linear-gradient(to_bottom,black,transparent)]" />
        <div className="container-page relative">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-end lg:justify-between">
            <Reveal>
              <SectionHeading
                id="ressources-gratuites"
                index="04"
                tone="dark"
                eyebrow="Ressources gratuites"
                title="Des guides à télécharger, sans inscription."
                lead="Imprimez-les, partagez-les, utilisez-les en famille ou en entreprise."
              />
            </Reveal>
            <Reveal delay={0.1}>
              <ButtonLink href="/ressources" variant="outline-light" arrow>
                Toutes les ressources
              </ButtonLink>
            </Reveal>
          </div>
          <ul className="mt-14 grid gap-5 text-ink sm:grid-cols-2 lg:grid-cols-3">
            {featuredFree.map((r, i) => (
              <Reveal key={r.slug} as="li" delay={i * 0.06}>
                <ResourceCard resource={r} />
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* -------------------------------------------------------- Témoignages */}
      <section aria-labelledby="temoignages" className="bg-paper py-24 sm:py-32">
        <div className="container-page">
          <Reveal>
            <SectionHeading
              id="temoignages"
              index="05"
              eyebrow="Témoignages"
              title="Ce que la clarté change au quotidien."
              lead={
                <>
                  <strong className="font-semibold text-ink">Témoignages de démonstration :</strong> les personnes citées
                  sont fictives. Leurs situations illustrent des cas réels fréquents.
                </>
              }
            />
          </Reveal>
          <ul className="mt-14 grid gap-5 lg:grid-cols-3">
            {TESTIMONIALS.map((t, i) => (
              <Reveal key={t.name} as="li" delay={i * 0.08}>
                <figure className="flex h-full flex-col rounded-[1.6rem] border border-line bg-white p-7 shadow-card">
                  <Badge tone="warning" className="self-start">Témoignage fictif</Badge>
                  <blockquote className="mt-6 flex-1 text-[1.05rem] leading-relaxed text-[#1d3326]">« {t.quote} »</blockquote>
                  <figcaption className="mt-8 flex items-center gap-3 border-t border-line pt-5">
                    <span aria-hidden className="inline-flex size-11 items-center justify-center rounded-full bg-ink text-sm font-bold text-neon">
                      {t.name[0]}
                    </span>
                    <span>
                      <span className="block font-bold">{t.name}</span>
                      <span className="block text-xs text-muted">
                        {t.role} · {t.city}
                      </span>
                    </span>
                  </figcaption>
                </figure>
              </Reveal>
            ))}
          </ul>
        </div>
      </section>

      {/* ------------------------------------------------------------- CTA */}
      <section aria-labelledby="cta" className="bg-paper pb-24 sm:pb-32">
        <div className="container-page">
          <Reveal>
            <div className="relative isolate overflow-hidden rounded-[2.25rem] bg-neon px-6 py-16 text-ink sm:px-14 sm:py-20">
              <div aria-hidden className="absolute -right-20 -bottom-24 -z-10 size-80 rounded-full border-[40px] border-ink/[0.06]" />
              <div aria-hidden className="absolute -top-16 right-40 -z-10 size-40 rounded-full border-[24px] border-ink/[0.05]" />
              <div className="max-w-2xl">
                <h2 id="cta" className="text-display-xl font-semibold text-balance">
                  Commencez aujourd’hui. Votre futur vous remerciera.
                </h2>
                <p className="mt-5 max-w-xl text-lg leading-relaxed text-ink/75">
                  Deux minutes suffisent pour voir clair dans votre budget. Gratuit, sans inscription.
                </p>
                <div className="mt-10 flex flex-col gap-3 sm:flex-row">
                  <ButtonLink href="/simulateur" size="lg" variant="dark" arrow>
                    Simuler mon budget
                  </ButtonLink>
                  <ButtonLink href="/ressources" size="lg" variant="ghost" className="text-ink hover:bg-ink/[0.07]">
                    Télécharger un guide gratuit
                  </ButtonLink>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </>
  );
}

function FeatureCard({
  href,
  icon,
  title,
  text,
  cta,
}: {
  href: Route;
  icon: React.ReactNode;
  title: string;
  text: string;
  cta: string;
}) {
  return (
    <Spotlight className="h-full rounded-[2rem]">
      <Link
        href={href}
        className="group flex h-full flex-col rounded-[2rem] border border-line bg-white/80 p-7 transition-[border-color,box-shadow] duration-300 hover:border-forest/25 hover:shadow-lift"
      >
        <span className="inline-flex size-11 items-center justify-center rounded-2xl bg-mist text-forest transition-colors duration-300 group-hover:bg-ink group-hover:text-neon">
          {icon}
        </span>
        <h3 className="mt-6 text-display-md font-semibold">{title}</h3>
        <p className="mt-2 leading-relaxed text-muted">{text}</p>
        <span className="mt-auto inline-flex items-center gap-1.5 pt-8 text-sm font-bold text-forest">
          {cta}
          <ArrowUpRight className="size-4 transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" aria-hidden />
        </span>
      </Link>
    </Spotlight>
  );
}
