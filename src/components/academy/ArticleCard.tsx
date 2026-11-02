import Link from "next/link";
import { ArrowUpRight, Check, Clock } from "lucide-react";
import { getCategory, type Article } from "@/content/academy";
import { cn } from "@/lib/cn";
import { CategoryIcon } from "./CategoryIcon";

export function ArticleCard({
  article,
  read = false,
  tone = "light",
  headingLevel = "h3",
}: {
  article: Article;
  read?: boolean;
  tone?: "light" | "dark";
  headingLevel?: "h2" | "h3";
}) {
  const category = getCategory(article.category);
  const Heading = headingLevel;
  const dark = tone === "dark";
  return (
    <article
      className={cn(
        "group relative flex h-full flex-col rounded-[1.6rem] p-6 transition-[transform,box-shadow,border-color] duration-300 ease-[var(--ease-out-expo)] hover:-translate-y-1",
        dark
          ? "surface-dark bg-ink-800 text-white ring-1 ring-inset ring-white/[0.08] hover:ring-white/20"
          : "border border-line bg-white shadow-card hover:border-forest/25 hover:shadow-lift",
      )}
    >
      <div className="flex items-center justify-between gap-3">
        <span
          className={cn(
            "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
            dark ? "bg-white/[0.07] text-sage-200" : "bg-mist text-forest",
          )}
        >
          <CategoryIcon slug={article.category} className="size-3.5" />
          {category.short}
        </span>
        {read ? (
          <span className={cn("inline-flex items-center gap-1 text-xs font-bold", dark ? "text-neon" : "text-forest")}>
            <Check className="size-3.5" aria-hidden /> Lu
          </span>
        ) : (
          <span className={cn("text-xs font-semibold", dark ? "text-sage" : "text-subtle")}>{article.level}</span>
        )}
      </div>
      <Heading className="mt-5 text-[1.2rem] font-bold leading-snug tracking-[-0.02em] text-balance">
        <Link
          href={`/academie/${article.slug}`}
          className="after:absolute after:inset-0 after:rounded-[1.6rem] focus-visible:outline-none"
        >
          {article.title}
        </Link>
      </Heading>
      <p className={cn("mt-3 line-clamp-3 text-sm leading-relaxed", dark ? "text-sage" : "text-muted")}>
        {article.excerpt}
      </p>
      <div
        className={cn(
          "mt-auto flex items-center justify-between pt-6 text-xs font-semibold",
          dark ? "text-sage" : "text-subtle",
        )}
      >
        <span className="inline-flex items-center gap-1.5">
          <Clock className="size-3.5" aria-hidden />
          {article.readingMinutes} min de lecture
        </span>
        <span
          aria-hidden
          className={cn(
            "inline-flex size-8 items-center justify-center rounded-full transition-colors duration-300",
            dark ? "bg-white/[0.06] group-hover:bg-neon group-hover:text-ink" : "bg-paper group-hover:bg-ink group-hover:text-neon",
          )}
        >
          <ArrowUpRight className="size-4" />
        </span>
      </div>
      {/* L'anneau de focus est porté par la carte entière. */}
      <span aria-hidden className="pointer-events-none absolute inset-0 rounded-[1.6rem] ring-2 ring-transparent group-has-[a:focus-visible]:ring-forest" />
    </article>
  );
}
