"use client";

import { Check, Minus, Plus } from "lucide-react";
import { useEffect, useRef, useState, useSyncExternalStore, type ReactNode } from "react";
import { useToast } from "@/components/ui/Toaster";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";
import { cn } from "@/lib/cn";
import { useReadArticles } from "./useReadArticles";

/* Barre de progression de lecture --------------------------------------- */

export function ReadingProgress({ targetId }: { targetId: string }) {
  const barRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const el = document.getElementById(targetId);
      const bar = barRef.current;
      if (!el || !bar) return;
      const rect = el.getBoundingClientRect();
      const total = rect.height - window.innerHeight * 0.6;
      const ratio = total > 0 ? Math.min(1, Math.max(0, -rect.top / total)) : 1;
      bar.style.transform = `scaleX(${ratio})`;
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      cancelAnimationFrame(frame);
    };
  }, [targetId]);
  return (
    <div aria-hidden className="no-print fixed inset-x-0 top-[4.25rem] z-40 h-[3px] bg-transparent">
      <div ref={barRef} className="h-full origin-left scale-x-0 bg-neon" />
    </div>
  );
}

/* Taille du texte -------------------------------------------------------- */

type Size = "sm" | "md" | "lg";
const SIZES: Size[] = ["sm", "md", "lg"];
const sizeListeners = new Set<() => void>();

function readSize(): Size {
  const r = readJSON(STORAGE_KEYS.readerSize, (raw) => (SIZES.includes(raw as Size) ? (raw as Size) : null));
  return r.ok ? r.value : "md";
}

export function useReaderSize() {
  const size = useSyncExternalStore(
    (l) => {
      sizeListeners.add(l);
      return () => sizeListeners.delete(l);
    },
    readSize,
    () => "md" as Size,
  );
  const setSize = (next: Size) => {
    writeJSON(STORAGE_KEYS.readerSize, next);
    sizeListeners.forEach((l) => l());
  };
  return { size, setSize };
}

export function ReaderBody({ children }: { children: ReactNode }) {
  const { size } = useReaderSize();
  return (
    <div className="prose-reader" data-size={size}>
      {children}
    </div>
  );
}

export function TextSizeControl() {
  const { size, setSize } = useReaderSize();
  const i = SIZES.indexOf(size);
  return (
    <div className="flex items-center gap-1 rounded-full border border-line bg-white p-1" role="group" aria-label="Taille du texte">
      <button
        type="button"
        onClick={() => setSize(SIZES[Math.max(0, i - 1)])}
        disabled={i === 0}
        aria-label="Réduire la taille du texte"
        className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-35"
      >
        <Minus className="size-3.5" aria-hidden />
      </button>
      <span className="px-1 text-xs font-bold text-ink" aria-live="polite">
        Aa
        <span className="sr-only"> taille {size === "sm" ? "réduite" : size === "md" ? "normale" : "agrandie"}</span>
      </span>
      <button
        type="button"
        onClick={() => setSize(SIZES[Math.min(SIZES.length - 1, i + 1)])}
        disabled={i === SIZES.length - 1}
        aria-label="Agrandir la taille du texte"
        className="inline-flex size-8 items-center justify-center rounded-full text-muted transition-colors hover:bg-mist hover:text-ink disabled:opacity-35"
      >
        <Plus className="size-3.5" aria-hidden />
      </button>
    </div>
  );
}

/* Marquer comme lu ------------------------------------------------------- */

export function MarkAsRead({ slug, className }: { slug: string; className?: string }) {
  const { isRead, setRead } = useReadArticles();
  const { toast } = useToast();
  const done = isRead(slug);
  return (
    <button
      type="button"
      aria-pressed={done}
      onClick={() => {
        setRead(slug, !done);
        toast({
          tone: done ? "info" : "success",
          title: done ? "Article marqué comme non lu" : "Bravo, un article de plus !",
          description: done ? undefined : "Votre progression est enregistrée sur cet appareil.",
        });
      }}
      className={cn(
        "inline-flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition-colors duration-200",
        done ? "bg-forest text-white hover:bg-forest-700" : "bg-ink text-white hover:bg-forest",
        className,
      )}
    >
      <Check className={cn("size-4", done ? "text-neon" : "text-sage")} aria-hidden />
      {done ? "Lu — marquer comme non lu" : "Marquer comme lu"}
    </button>
  );
}

/* Sommaire avec section active ------------------------------------------ */

export function ArticleToc({ items }: { items: Array<{ id: string; text: string }> }) {
  const [active, setActive] = useState<string | null>(null);
  useEffect(() => {
    const headings = items
      .map((i) => document.getElementById(i.id))
      .filter((el): el is HTMLElement => el !== null);
    if (headings.length === 0 || typeof IntersectionObserver === "undefined") return;
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      { rootMargin: "-90px 0px -65% 0px" },
    );
    headings.forEach((h) => observer.observe(h));
    return () => observer.disconnect();
  }, [items]);

  return (
    <nav aria-label="Sommaire de l’article">
      <p className="text-eyebrow font-bold uppercase text-subtle">Sommaire</p>
      <ol className="mt-4 space-y-1 border-l border-line">
        {items.map((item) => (
          <li key={item.id}>
            <a
              href={`#${item.id}`}
              aria-current={active === item.id ? "location" : undefined}
              className={cn(
                "-ml-px block border-l-2 py-1.5 pl-4 text-sm leading-snug transition-colors duration-200",
                active === item.id
                  ? "border-forest font-semibold text-ink"
                  : "border-transparent text-muted hover:border-line hover:text-ink",
              )}
            >
              {item.text}
            </a>
          </li>
        ))}
      </ol>
    </nav>
  );
}
