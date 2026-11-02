import type { Metadata } from "next";
import { Suspense } from "react";
import { AcademyLibrary } from "@/components/academy/AcademyLibrary";
import { ArticleCard } from "@/components/academy/ArticleCard";
import { PageHero } from "@/components/layout/PageHero";
import { ACADEMY_CATEGORIES, ARTICLES } from "@/content/academy";

export const metadata: Metadata = {
  title: "Académie — Cours d’éducation financière gratuits",
  description:
    "Gestion du salaire, épargne, tontines, entrepreneuriat, crédit, BRVM et erreurs à éviter : des articles clairs et pratiques, pensés pour l’Afrique francophone.",
  alternates: { canonical: "/academie" },
};

function LibraryFallback() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" aria-label="Articles de l’Académie">
      {ARTICLES.map((article) => (
        <li key={article.slug}>
          <ArticleCard article={article} headingLevel="h2" />
        </li>
      ))}
    </ul>
  );
}

export default function AcademyPage() {
  const minutes = ARTICLES.reduce((acc, a) => acc + a.readingMinutes, 0);
  return (
    <>
      <PageHero
        eyebrow="L’Académie Argent Clair"
        title={
          <>
            Apprendre l’argent, <span className="text-neon">sans jargon</span>.
          </>
        }
        lead="Des articles courts et concrets, écrits pour la réalité de la zone FCFA : salaire, épargne, tontine, crédit, entreprise. Gratuits, sans inscription."
        aside={
          <dl className="grid grid-cols-3 gap-px overflow-hidden rounded-3xl bg-white/[0.08] ring-1 ring-white/[0.08]">
            {[
              { value: String(ARTICLES.length), label: "articles" },
              { value: String(ACADEMY_CATEGORIES.length), label: "thématiques" },
              { value: `${minutes} min`, label: "de lecture" },
            ].map((s) => (
              <div key={s.label} className="bg-ink px-4 py-5 text-center">
                <dt className="sr-only">{s.label}</dt>
                <dd>
                  <span className="block text-2xl font-semibold tracking-[-0.03em] text-white">{s.value}</span>
                  <span className="mt-1 block text-xs text-sage">{s.label}</span>
                </dd>
              </div>
            ))}
          </dl>
        }
      />
      <section aria-label="Bibliothèque" className="bg-paper py-14 sm:py-20">
        <div className="container-page">
          <Suspense fallback={<LibraryFallback />}>
            <AcademyLibrary />
          </Suspense>
        </div>
      </section>
    </>
  );
}
