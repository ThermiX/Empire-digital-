import { ACADEMY_CATEGORIES } from "./categories";
import { ARTICLE_SOURCES } from "./articles";
import type { Article, ArticleSource, Block, CategorySlug } from "./types";

export { ACADEMY_CATEGORIES };
export type { Article, AcademyCategory, Block, CategorySlug, Level } from "./types";

const WORDS_PER_MINUTE = 220;

function blockText(block: Block): string {
  switch (block.type) {
    case "p":
    case "h2":
    case "quote":
      return block.text;
    case "list":
      return block.items.join(" ");
    case "callout":
      return `${block.title} ${block.text}`;
    case "figures":
      return `${block.title} ${block.rows.map((r) => `${r.label} ${r.value}`).join(" ")} ${block.note ?? ""}`;
  }
}

function enrich(source: ArticleSource): Article {
  const words = [source.excerpt, ...source.takeaways, ...source.blocks.map(blockText)]
    .join(" ")
    .split(/\s+/)
    .filter(Boolean).length;
  return {
    ...source,
    readingMinutes: Math.max(3, Math.round(words / WORDS_PER_MINUTE)),
    toc: source.blocks
      .filter((b): b is Extract<Block, { type: "h2" }> => b.type === "h2")
      .map((b) => ({ id: b.id, text: b.text })),
  };
}

export const ARTICLES: Article[] = ARTICLE_SOURCES.map(enrich);

export function getArticle(slug: string): Article | undefined {
  return ARTICLES.find((a) => a.slug === slug);
}

export function getCategory(slug: CategorySlug) {
  return ACADEMY_CATEGORIES.find((c) => c.slug === slug)!;
}

export function isCategorySlug(value: string | null | undefined): value is CategorySlug {
  return ACADEMY_CATEGORIES.some((c) => c.slug === value);
}

export function getArticlesByCategory(slug: CategorySlug): Article[] {
  return ARTICLES.filter((a) => a.category === slug);
}

/** Article précédent / suivant dans l'ordre de la bibliothèque. */
export function getAdjacentArticles(slug: string) {
  const index = ARTICLES.findIndex((a) => a.slug === slug);
  return {
    previous: index > 0 ? ARTICLES[index - 1] : undefined,
    next: index >= 0 && index < ARTICLES.length - 1 ? ARTICLES[index + 1] : undefined,
  };
}

export function getRelatedArticles(article: Article, count = 3): Article[] {
  const sameCategory = ARTICLES.filter((a) => a.category === article.category && a.slug !== article.slug);
  const others = ARTICLES.filter((a) => a.category !== article.category);
  return [...sameCategory, ...others].slice(0, count);
}
