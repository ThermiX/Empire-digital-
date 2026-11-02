"use client";

import type { Route } from "next";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Search, X } from "lucide-react";
import { useDeferredValue, useMemo, useState } from "react";
import { ACADEMY_CATEGORIES, ARTICLES, isCategorySlug, type CategorySlug } from "@/content/academy";
import { cn } from "@/lib/cn";
import { ArticleCard } from "./ArticleCard";
import { CategoryIcon } from "./CategoryIcon";
import { plainText } from "./RichText";
import { useReadArticles } from "./useReadArticles";

function normalize(text: string) {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "");
}

export function AcademyLibrary() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const param = params.get("categorie");
  const category: CategorySlug | null = isCategorySlug(param) ? param : null;
  const [query, setQuery] = useState("");
  const deferred = useDeferredValue(query);
  const { read } = useReadArticles();

  function selectCategory(slug: CategorySlug | null) {
    const href = (slug ? `${pathname}?categorie=${slug}` : pathname) as Route;
    router.replace(href, { scroll: false });
  }

  const results = useMemo(() => {
    const q = normalize(deferred.trim());
    return ARTICLES.filter((a) => {
      if (category && a.category !== category) return false;
      if (!q) return true;
      const haystack = normalize(
        [a.title, a.excerpt, ...a.takeaways, ...a.toc.map((t) => t.text)].map(plainText).join(" "),
      );
      return q.split(/\s+/).every((word) => haystack.includes(word));
    });
  }, [category, deferred]);

  const readCount = ARTICLES.filter((a) => read.includes(a.slug)).length;
  const progress = readCount / ARTICLES.length;

  return (
    <div>
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <label htmlFor="recherche-academie" className="text-sm font-bold text-ink">
            Rechercher un sujet
          </label>
          <div className="relative mt-2 max-w-xl">
            <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-subtle" aria-hidden />
            <input
              id="recherche-academie"
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Tontine, crédit, fonds d’urgence…"
              className="field-input pl-11 pr-11 [&::-webkit-search-cancel-button]:hidden"
            />
            {query ? (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Effacer la recherche"
                className="absolute top-1/2 right-2 inline-flex size-8 -translate-y-1/2 items-center justify-center rounded-full text-subtle hover:bg-mist hover:text-ink"
              >
                <X className="size-4" aria-hidden />
              </button>
            ) : null}
          </div>
        </div>
        <div className="flex items-center gap-4 rounded-2xl border border-line bg-white px-5 py-3.5">
          <div
            className="relative size-11 rounded-full"
            style={{ background: `conic-gradient(var(--color-forest) ${progress * 360}deg, var(--color-mist) 0deg)` }}
            aria-hidden
          >
            <div className="absolute inset-[5px] rounded-full bg-white" />
          </div>
          <p className="text-sm">
            <span className="block font-bold text-ink">
              {readCount} / {ARTICLES.length} articles lus
            </span>
            <span className="text-xs text-muted">Votre progression est gardée sur cet appareil</span>
          </p>
        </div>
      </div>

      <div className="mt-8" role="group" aria-label="Filtrer par catégorie">
        <div className="scrollbar-none -mx-5 flex gap-2 overflow-x-auto px-5 pb-1 sm:mx-0 sm:flex-wrap sm:px-0">
          <FilterChip active={category === null} onClick={() => selectCategory(null)} count={ARTICLES.length}>
            Tout
          </FilterChip>
          {ACADEMY_CATEGORIES.map((c) => (
            <FilterChip
              key={c.slug}
              active={category === c.slug}
              onClick={() => selectCategory(c.slug)}
              count={ARTICLES.filter((a) => a.category === c.slug).length}
              icon={<CategoryIcon slug={c.slug} className="size-4" />}
            >
              {c.label}
            </FilterChip>
          ))}
        </div>
      </div>

      {category ? (
        <p className="mt-6 max-w-2xl text-sm leading-relaxed text-muted">
          {ACADEMY_CATEGORIES.find((c) => c.slug === category)?.description}
        </p>
      ) : null}

      <p className="sr-only" role="status" aria-live="polite">
        {results.length} article{results.length > 1 ? "s" : ""} trouvé{results.length > 1 ? "s" : ""}
      </p>

      {results.length > 0 ? (
        <ul className="mt-8 grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {results.map((article) => (
            <li key={article.slug}>
              <ArticleCard article={article} read={read.includes(article.slug)} headingLevel="h2" />
            </li>
          ))}
        </ul>
      ) : (
        <div className="mt-8 rounded-3xl border border-dashed border-line bg-white p-10 text-center">
          <p className="font-bold text-ink">Aucun article ne correspond à « {query} »</p>
          <p className="mt-2 text-sm text-muted">Essayez un autre mot-clé ou affichez toutes les catégories.</p>
          <button
            type="button"
            onClick={() => {
              setQuery("");
              selectCategory(null);
            }}
            className="mt-5 rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-forest"
          >
            Réinitialiser les filtres
          </button>
        </div>
      )}
    </div>
  );
}

function FilterChip({
  active,
  onClick,
  count,
  icon,
  children,
}: {
  active: boolean;
  onClick: () => void;
  count: number;
  icon?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-pressed={active}
      className={cn(
        "inline-flex shrink-0 items-center gap-2 rounded-full px-4 py-2.5 text-sm font-semibold transition-colors duration-200",
        active ? "bg-ink text-white" : "border border-line bg-white text-muted hover:border-forest/30 hover:text-ink",
      )}
    >
      {icon}
      {children}
      <span className={cn("rounded-full px-1.5 text-xs tabular-nums", active ? "bg-white/15 text-neon" : "bg-paper text-subtle")}>
        {count}
      </span>
    </button>
  );
}
