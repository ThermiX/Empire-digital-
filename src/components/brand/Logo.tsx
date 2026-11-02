import Link from "next/link";
import { cn } from "@/lib/cn";

/**
 * Monogramme Argent Clair : un « a » géométrique dont la panse est une pièce.
 */
export function LogoMark({ className, title }: { className?: string; title?: string }) {
  return (
    <svg
      viewBox="0 0 32 32"
      className={cn("size-8 shrink-0", className)}
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
    >
      <rect width="32" height="32" rx="9" fill="#E4FF1A" />
      <circle cx="14.25" cy="17" r="6.25" fill="none" stroke="#04180C" strokeWidth="3.1" />
      <path d="M21.9 10.6v12.8" stroke="#04180C" strokeWidth="3.1" strokeLinecap="round" />
      <circle cx="14.25" cy="17" r="1.6" fill="#04180C" />
    </svg>
  );
}

export function Logo({
  tone = "dark",
  className,
  onNavigate,
}: {
  tone?: "dark" | "light";
  className?: string;
  onNavigate?: () => void;
}) {
  return (
    <Link
      href="/"
      onNavigate={onNavigate}
      className={cn("group inline-flex items-center gap-2.5 rounded-lg", className)}
      aria-label="Argent Clair — accueil"
    >
      <LogoMark className="transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:rotate-[-8deg]" />
      <span
        className={cn(
          "text-[1.08rem] font-bold tracking-[-0.035em]",
          tone === "dark" ? "text-white" : "text-ink",
        )}
      >
        Argent
        <span className={cn("font-medium", tone === "dark" ? "text-sage" : "text-forest")}> Clair</span>
      </span>
    </Link>
  );
}
