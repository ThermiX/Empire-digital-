import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

/** Bandeau d'ouverture sombre des pages intérieures. */
export function PageHero({
  eyebrow,
  title,
  lead,
  children,
  aside,
  className,
}: {
  eyebrow: string;
  title: ReactNode;
  lead?: ReactNode;
  children?: ReactNode;
  aside?: ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("surface-dark relative isolate overflow-hidden bg-ink text-white", className)}>
      <div aria-hidden className="bg-ledger absolute inset-0 -z-10 [mask-image:radial-gradient(ellipse_at_top,black_30%,transparent_75%)]" />
      <div aria-hidden className="bg-noise absolute inset-0 -z-10" />
      <div
        aria-hidden
        className="absolute -top-40 right-[-10%] -z-10 size-[520px] rounded-full bg-forest/50 blur-[120px]"
      />
      <div className="container-page pt-36 pb-16 sm:pt-40 sm:pb-20">
        <div className={cn("grid gap-12", aside ? "lg:grid-cols-[1.4fr_1fr] lg:items-end" : null)}>
          <div className="max-w-3xl">
            <p className="animate-rise inline-flex items-center gap-3 text-eyebrow font-bold uppercase text-sage">
              <span aria-hidden className="size-1.5 rounded-full bg-neon animate-pulse-dot" />
              {eyebrow}
            </p>
            <h1 className="animate-rise mt-6 text-display-2xl font-semibold text-balance [animation-delay:80ms]">
              {title}
            </h1>
            {lead ? (
              <p className="animate-rise mt-6 max-w-2xl text-lg leading-relaxed text-sage text-pretty [animation-delay:160ms]">
                {lead}
              </p>
            ) : null}
            {children ? <div className="animate-rise mt-8 [animation-delay:240ms]">{children}</div> : null}
          </div>
          {aside ? <div className="animate-rise [animation-delay:300ms]">{aside}</div> : null}
        </div>
      </div>
    </section>
  );
}
