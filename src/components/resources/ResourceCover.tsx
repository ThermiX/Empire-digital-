import type { CoverVariant, Resource } from "@/content/resources";
import { cn } from "@/lib/cn";

const N = "#E4FF1A";
const S = "#9FB8A8";

/** Motifs génératifs propres à chaque guide (aucune image externe). */
function Motif({ variant }: { variant: CoverVariant }) {
  switch (variant) {
    case "envelopes":
      return (
        <g>
          {[0, 1, 2, 3, 4].map((i) => (
            <g key={i} transform={`translate(${60 + i * 14} ${70 + i * 22})`}>
              <rect width="150" height="96" rx="10" fill={i === 4 ? N : "#0D3B24"} stroke={i === 4 ? "none" : S} strokeOpacity="0.35" />
              <path d="M0 8 L75 56 L150 8" fill="none" stroke={i === 4 ? "#04180C" : S} strokeOpacity={i === 4 ? 0.8 : 0.4} strokeWidth="2" />
            </g>
          ))}
        </g>
      );
    case "calendar":
      return (
        <g transform="translate(48 60)">
          {Array.from({ length: 52 }).map((_, i) => {
            const col = i % 8;
            const row = Math.floor(i / 8);
            const filled = i < 31;
            return (
              <rect
                key={i}
                x={col * 26}
                y={row * 26}
                width="20"
                height="20"
                rx="5"
                fill={filled ? N : "none"}
                fillOpacity={filled ? 0.35 + (i / 52) * 0.65 : 0}
                stroke={S}
                strokeOpacity={filled ? 0 : 0.35}
              />
            );
          })}
        </g>
      );
    case "grid":
      return (
        <g transform="translate(50 64)">
          <rect width="200" height="170" rx="14" fill="#0D3B24" stroke={S} strokeOpacity="0.3" />
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <g key={i}>
              <line x1="16" x2="184" y1={30 + i * 24} y2={30 + i * 24} stroke={S} strokeOpacity="0.25" />
              <rect x="16" y={18 + i * 24} width={50 + ((i * 37) % 70)} height="6" rx="3" fill={S} fillOpacity="0.55" />
              <rect x={150} y={18 + i * 24} width="34" height="6" rx="3" fill={i === 5 ? N : S} fillOpacity={i === 5 ? 1 : 0.4} />
            </g>
          ))}
        </g>
      );
    case "shield":
      return (
        <g transform="translate(150 150)">
          <path d="M0 -90 L78 -60 V10 C78 60 40 88 0 104 C-40 88 -78 60 -78 10 V-60 Z" fill="#0D3B24" stroke={S} strokeOpacity="0.4" strokeWidth="2" />
          <path d="M0 -62 L52 -42 V8 C52 42 26 62 0 74 C-26 62 -52 42 -52 8 V-42 Z" fill="none" stroke={N} strokeWidth="3" />
          <path d="M-22 6 L-6 22 L26 -14" fill="none" stroke={N} strokeWidth="7" strokeLinecap="round" strokeLinejoin="round" />
        </g>
      );
    case "chart":
      return (
        <g transform="translate(40 60)">
          {[0, 1, 2, 3].map((i) => (
            <line key={i} x1="0" x2="220" y1={i * 50} y2={i * 50} stroke={S} strokeOpacity="0.18" />
          ))}
          <path d="M0 150 L30 130 L60 138 L90 100 L120 110 L150 70 L180 78 L220 20" fill="none" stroke={N} strokeWidth="3.5" strokeLinejoin="round" strokeLinecap="round" />
          <path d="M0 150 L30 130 L60 138 L90 100 L120 110 L150 70 L180 78 L220 20 V170 H0 Z" fill={N} fillOpacity="0.1" />
          <circle cx="220" cy="20" r="7" fill={N} stroke="#04180C" strokeWidth="3" />
        </g>
      );
    case "circle":
      return (
        <g transform="translate(150 150)">
          <circle r="92" fill="none" stroke={S} strokeOpacity="0.3" strokeWidth="2" />
          {Array.from({ length: 10 }).map((_, i) => {
            const a = (i / 10) * Math.PI * 2 - Math.PI / 2;
            return (
              <circle key={i} cx={Math.cos(a) * 92} cy={Math.sin(a) * 92} r={i === 0 ? 16 : 11} fill={i === 0 ? N : "#0D3B24"} stroke={i === 0 ? "none" : S} strokeOpacity="0.5" strokeWidth="2" />
            );
          })}
          <circle r="34" fill={N} fillOpacity="0.12" stroke={N} strokeWidth="2" />
        </g>
      );
    case "bars":
      return (
        <g transform="translate(56 54)">
          {[46, 70, 58, 98, 120, 150].map((h, i) => (
            <rect key={i} x={i * 32} y={180 - h} width="20" height={h} rx="4" fill={i === 5 ? N : S} fillOpacity={i === 5 ? 1 : 0.25 + i * 0.1} />
          ))}
          <line x1="-6" x2="190" y1="182" y2="182" stroke={S} strokeOpacity="0.4" />
        </g>
      );
    case "rings":
      return (
        <g transform="translate(150 150)">
          {[110, 82, 54].map((r, i) => (
            <circle key={r} r={r} fill="none" stroke={i === 2 ? N : S} strokeOpacity={i === 2 ? 1 : 0.35} strokeWidth={i === 2 ? 4 : 2} strokeDasharray={i === 0 ? "2 10" : undefined} />
          ))}
          <circle r="18" fill={N} />
        </g>
      );
  }
}

export function ResourceCover({
  resource,
  className,
  size = "md",
}: {
  resource: Pick<Resource, "title" | "subtitle" | "cover" | "price" | "pages">;
  className?: string;
  size?: "sm" | "md";
}) {
  const free = resource.price === 0;
  return (
    <div
      className={cn(
        "surface-dark relative isolate aspect-[4/5] overflow-hidden rounded-[1.25rem] bg-ink text-white",
        className,
      )}
      role="img"
      aria-label={`Couverture du guide « ${resource.title} »`}
    >
      <div aria-hidden className="bg-ledger absolute inset-0 -z-10 opacity-70" />
      <div aria-hidden className="absolute -bottom-24 -left-16 -z-10 size-64 rounded-full bg-forest blur-3xl" />
      <svg aria-hidden viewBox="0 0 300 300" className="absolute inset-x-0 top-[6%] -z-10 mx-auto w-[92%] transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-[1.04]">
        <Motif variant={resource.cover} />
      </svg>
      <div className="absolute inset-x-0 top-0 flex items-center justify-between p-4">
        <span className="text-[0.62rem] font-bold tracking-[0.18em] text-sage uppercase">Argent Clair</span>
        <span
          className={cn(
            "rounded-full px-2 py-0.5 text-[0.62rem] font-bold uppercase tracking-[0.12em]",
            free ? "bg-neon text-ink" : "bg-white/10 text-sage-200 ring-1 ring-inset ring-white/15",
          )}
        >
          {free ? "Gratuit" : "Premium"}
        </span>
      </div>
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-ink via-ink/90 to-transparent p-5 pt-16">
        <p className={cn("font-bold leading-[1.1] tracking-[-0.03em] text-balance", size === "sm" ? "text-lg" : "text-[1.45rem]")}>
          {resource.title}
        </p>
        <p className="mt-1.5 text-xs text-sage">
          {resource.subtitle} · {resource.pages} pages
        </p>
      </div>
    </div>
  );
}
