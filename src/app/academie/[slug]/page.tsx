import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Calculator, CalendarDays, ChevronRight, Clock, Signal } from "lucide-react";
import { ArticleBlocks } from "@/components/academy/ArticleBlocks";
import { ArticleCard } from "@/components/academy/ArticleCard";
import { CategoryIcon } from "@/components/academy/CategoryIcon";
import {
  ArticleToc,
  MarkAsRead,
  ReaderBody,
  ReadingProgress,
  TextSizeControl,
} from "@/components/academy/ReaderTools";
import { ButtonLink } from "@/components/ui/Button";
import { ARTICLES, getAdjacentArticles, getArticle, getCategory, getRelatedArticles } from "@/content/academy";
import { formatDateFr } from "@/lib/format";
import { siteConfig } from "@/lib/site";

export const dynamicParams = false;

export function generateStaticParams() {
  return ARTICLES.map((a) => ({ slug: a.slug }));
}

export async function generateMetadata({ params }: PageProps<"/academie/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return {};
  return {
    title: article.title,
    description: article.excerpt,
    alternates: { canonical: `/academie/${article.slug}` },
    openGraph: {
      type: "article",
      title: article.title,
      description: article.excerpt,
      url: `/academie/${article.slug}`,
      modifiedTime: article.updatedAt,
      section: getCategory(article.category).label,
    },
  };
}

export default async function ArticlePage({ params }: PageProps<"/academie/[slug]">) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const category = getCategory(article.category);
  const { previous, next } = getAdjacentArticles(article.slug);
  const related = getRelatedArticles(article);
  const toc = article.toc.map((t) => ({ id: `${article.slug}-${t.id}`, text: t.text }));
  const bodyId = `corps-${article.slug}`;

  const jsonLd = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "Article",
        headline: article.title,
        description: article.excerpt,
        dateModified: article.updatedAt,
        inLanguage: "fr",
        articleSection: category.label,
        author: { "@type": "Organization", name: siteConfig.name },
        publisher: { "@type": "Organization", name: siteConfig.name },
        mainEntityOfPage: `${siteConfig.url}/academie/${article.slug}`,
      },
      {
        "@type": "BreadcrumbList",
        itemListElement: [
          { "@type": "ListItem", position: 1, name: "Accueil", item: siteConfig.url },
          { "@type": "ListItem", position: 2, name: "Académie", item: `${siteConfig.url}/academie` },
          { "@type": "ListItem", position: 3, name: article.title },
        ],
      },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, "\\u003c") }}
      />
      <ReadingProgress targetId={bodyId} />

      <header className="surface-dark relative isolate overflow-hidden bg-ink text-white">
        <div aria-hidden className="bg-ledger absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
        <div aria-hidden className="absolute -top-40 left-[30%] -z-10 size-[520px] rounded-full bg-forest/45 blur-[120px]" />
        <div className="container-page pt-32 pb-14 sm:pt-36 sm:pb-16">
          <nav aria-label="Fil d’Ariane" className="animate-rise">
            <ol className="flex flex-wrap items-center gap-1.5 text-xs font-medium text-sage">
              <li>
                <Link href="/" className="hover:text-white">Accueil</Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li>
                <Link href="/academie" className="hover:text-white">Académie</Link>
              </li>
              <ChevronRight className="size-3.5" aria-hidden />
              <li>
                <Link href={`/academie?categorie=${category.slug}`} className="hover:text-white">
                  {category.label}
                </Link>
              </li>
            </ol>
          </nav>
          <div className="max-w-4xl">
            <p className="animate-rise mt-8 inline-flex items-center gap-2 rounded-full bg-white/[0.07] px-3 py-1.5 text-xs font-semibold text-neon ring-1 ring-inset ring-white/10 [animation-delay:60ms]">
              <CategoryIcon slug={category.slug} className="size-3.5" />
              {category.label}
            </p>
            <h1 className="animate-rise mt-5 text-display-xl font-semibold text-balance [animation-delay:120ms]">
              {article.title}
            </h1>
            <p className="animate-rise mt-5 max-w-2xl text-lg leading-relaxed text-sage text-pretty [animation-delay:180ms]">
              {article.excerpt}
            </p>
            <ul className="animate-rise mt-8 flex flex-wrap gap-x-6 gap-y-2 text-sm text-sage-200 [animation-delay:240ms]">
              <li className="inline-flex items-center gap-2">
                <Clock className="size-4 text-neon" aria-hidden /> {article.readingMinutes} min de lecture
              </li>
              <li className="inline-flex items-center gap-2">
                <Signal className="size-4 text-neon" aria-hidden /> Niveau {article.level.toLowerCase()}
              </li>
              <li className="inline-flex items-center gap-2">
                <CalendarDays className="size-4 text-neon" aria-hidden /> Mis à jour le{" "}
                <time dateTime={article.updatedAt}>{formatDateFr(article.updatedAt)}</time>
              </li>
            </ul>
          </div>
        </div>
      </header>

      <div className="bg-white py-12 sm:py-16">
        <div className="container-page grid gap-12 lg:grid-cols-[220px_minmax(0,1fr)] xl:grid-cols-[240px_minmax(0,1fr)_200px]">
          <aside className="hidden lg:block">
            <div className="sticky top-28">
              <ArticleToc items={toc} />
            </div>
          </aside>

          <article id={bodyId} className="mx-auto w-full max-w-[68ch]">
            <div className="mb-10 flex items-center justify-between gap-4 border-b border-line pb-6 xl:hidden">
              <TextSizeControl />
              <MarkAsRead slug={article.slug} className="px-4 py-2.5 text-xs" />
            </div>
            <ReaderBody>
              <ArticleBlocks blocks={article.blocks} idPrefix={article.slug} />
            </ReaderBody>

            <section aria-labelledby={`${article.slug}-retenir`} className="mt-14 rounded-[1.75rem] bg-paper p-6 sm:p-8">
              <h2 id={`${article.slug}-retenir`} className="text-display-md font-semibold">
                À retenir
              </h2>
              <ul className="mt-5 space-y-3">
                {article.takeaways.map((t) => (
                  <li key={t} className="flex gap-3 leading-relaxed text-[#1d3326]">
                    <span aria-hidden className="mt-2 size-2 shrink-0 rounded-full bg-forest" />
                    {t}
                  </li>
                ))}
              </ul>
              <div className="mt-7 flex flex-wrap items-center gap-3">
                <MarkAsRead slug={article.slug} />
              </div>
            </section>

            <aside className="surface-dark mt-8 flex flex-col gap-5 rounded-[1.75rem] bg-ink p-6 text-white sm:flex-row sm:items-center sm:justify-between sm:p-8">
              <div className="flex items-start gap-4">
                <span className="inline-flex size-11 shrink-0 items-center justify-center rounded-2xl bg-neon text-ink">
                  <Calculator className="size-5" aria-hidden />
                </span>
                <div>
                  <p className="font-bold">Passez de la théorie à vos chiffres</p>
                  <p className="mt-1 text-sm text-sage">Testez votre budget réel en deux minutes.</p>
                </div>
              </div>
              <ButtonLink href="/simulateur" arrow>
                Ouvrir le simulateur
              </ButtonLink>
            </aside>

            <nav aria-label="Articles précédent et suivant" className="mt-12 grid gap-4 sm:grid-cols-2">
              {previous ? (
                <Link href={`/academie/${previous.slug}`} className="group rounded-3xl border border-line p-5 transition-colors hover:border-forest/30 hover:bg-paper">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-subtle">
                    <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-0.5" aria-hidden /> Précédent
                  </span>
                  <span className="mt-2 block font-bold leading-snug text-ink">{previous.title}</span>
                </Link>
              ) : (
                <span className="hidden sm:block" />
              )}
              {next ? (
                <Link href={`/academie/${next.slug}`} className="group rounded-3xl border border-line p-5 text-right transition-colors hover:border-forest/30 hover:bg-paper">
                  <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-subtle">
                    Suivant <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" aria-hidden />
                  </span>
                  <span className="mt-2 block font-bold leading-snug text-ink">{next.title}</span>
                </Link>
              ) : null}
            </nav>
          </article>

          <aside className="hidden xl:block">
            <div className="sticky top-28 space-y-4">
              <p className="text-eyebrow font-bold uppercase text-subtle">Lecture</p>
              <TextSizeControl />
              <MarkAsRead slug={article.slug} className="w-full justify-center px-4 text-xs" />
            </div>
          </aside>
        </div>
      </div>

      <section aria-labelledby="a-lire-aussi" className="bg-paper py-16 sm:py-20">
        <div className="container-page">
          <h2 id="a-lire-aussi" className="text-display-lg font-semibold">
            À lire aussi
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((a) => (
              <li key={a.slug}>
                <ArticleCard article={a} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    </>
  );
}
