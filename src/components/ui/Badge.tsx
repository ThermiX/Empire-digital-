import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type BadgeTone = "neutral" | "forest" | "neon" | "dark" | "warning" | "outline-dark";

const tones: Record<BadgeTone, string> = {
  neutral: "bg-mist text-forest",
  forest: "bg-forest text-white",
  neon: "bg-neon text-ink",
  dark: "bg-white/[0.07] text-sage ring-1 ring-inset ring-white/10",
  warning: "bg-warning-soft text-warning-ink",
  "outline-dark": "text-sage ring-1 ring-inset ring-sage/30",
};

export function Badge({
  children,
  tone = "neutral",
  className,
  icon,
}: {
  children: ReactNode;
  tone?: BadgeTone;
  className?: string;
  icon?: ReactNode;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold tracking-[-0.005em] whitespace-nowrap [&>svg]:size-3.5",
        tones[tone],
        className,
      )}
    >
      {icon}
      {children}
    </span>
  );
}
