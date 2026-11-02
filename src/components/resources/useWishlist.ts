"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

const listeners = new Set<() => void>();
let cache: string[] | null = null;
const EMPTY: string[] = [];

function read(): string[] {
  if (cache) return cache;
  const r = readJSON(STORAGE_KEYS.wishlist, (raw) =>
    Array.isArray(raw) && raw.every((x) => typeof x === "string") ? (raw as string[]) : null,
  );
  cache = r.ok ? r.value : [];
  return cache;
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

/** Liste d'envies locale (aucune donnée envoyée). */
export function useWishlist() {
  const items = useSyncExternalStore(subscribe, read, () => EMPTY);
  const toggle = useCallback((slug: string) => {
    const current = read();
    const next = current.includes(slug) ? current.filter((s) => s !== slug) : [...current, slug];
    cache = next;
    const saved = writeJSON(STORAGE_KEYS.wishlist, next);
    listeners.forEach((l) => l());
    return { added: next.includes(slug), saved };
  }, []);
  return { items, has: (slug: string) => items.includes(slug), toggle };
}
