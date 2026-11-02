"use client";

import { useRef, type ReactNode, type PointerEvent } from "react";
import { cn } from "@/lib/cn";

/**
 * Carte avec halo lumineux qui suit le pointeur. L'effet est purement visuel :
 * il ne s'active qu'avec une souris et se désactive si le mouvement est réduit.
 */
export function Spotlight({
  children,
  className,
  tone = "light",
}: {
  children: ReactNode;
  className?: string;
  tone?: "light" | "dark";
}) {
  const ref = useRef<HTMLDivElement>(null);

  function onPointerMove(event: PointerEvent<HTMLDivElement>) {
    if (event.pointerType !== "mouse" || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    ref.current.style.setProperty("--spot-x", `${event.clientX - rect.left}px`);
    ref.current.style.setProperty("--spot-y", `${event.clientY - rect.top}px`);
  }

  return (
    <div ref={ref} onPointerMove={onPointerMove} className={cn("group/spot relative isolate", className)}>
      <div
        aria-hidden
        className={cn(
          "pointer-events-none absolute inset-0 -z-10 rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover/spot:opacity-100 motion-reduce:hidden",
        )}
        style={{
          background:
            tone === "dark"
              ? "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgb(228 255 26 / 0.09), transparent 45%)"
              : "radial-gradient(420px circle at var(--spot-x, 50%) var(--spot-y, 0%), rgb(18 78 48 / 0.07), transparent 45%)",
        }}
      />
      {children}
    </div>
  );
}
