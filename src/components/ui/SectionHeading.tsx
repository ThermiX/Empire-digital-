import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/**
 * Titre de section éditorial : index numéroté façon « grand livre »,
 * surtitre, titre et chapeau.
 */
export function SectionHeading({
  index,
  eyebrow,
  title,
  lead,
  tone = "light",
  align = "left",
  className,
  as: Heading = "h2",
  id,
}: {
  index?: string;
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  tone?: "light" | "dark";
  align?: "left" | "center";
  className?: string;
  as?: "h1" | "h2";
  id?: string;
}) {
  const dark = tone === "dark";
  return (
    <div className={cn("max-w-3xl", align === "center" && "mx-auto text-center", className)}>
      <p
        className={cn(
          "inline-flex items-center gap-3 text-eyebrow font-bold uppercase",
          dark ? "text-sage" : "text-forest",
        )}
      >
        {index ? (
          <span className={cn("tabular-nums", dark ? "text-neon" : "text-forest-300")}>{index}</span>
        ) : (
          <span aria-hidden className={cn("size-1.5 rounded-full", dark ? "bg-neon" : "bg-forest")} />
        )}
        <span aria-hidden className={cn("h-px w-6", dark ? "bg-sage/40" : "bg-forest/30")} />
        {eyebrow}
      </p>
      <Heading
        id={id}
        className={cn(
          "mt-5 text-display-xl font-semibold text-balance",
          dark ? "text-white" : "text-ink",
        )}
      >
        {title}
      </Heading>
      {lead ? (
        <p
          className={cn(
            "mt-5 text-lg leading-relaxed text-pretty",
            dark ? "text-sage" : "text-muted",
            align === "center" && "mx-auto max-w-2xl",
          )}
        >
          {lead}
        </p>
      ) : null}
    </div>
  );
}
