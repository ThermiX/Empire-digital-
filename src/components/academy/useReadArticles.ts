"use client";

import { useCallback, useSyncExternalStore } from "react";
import { STORAGE_KEYS, readJSON, writeJSON } from "@/lib/storage";

const listeners = new Set<() => void>();
let cache: string[] | null = null;

function read(): string[] {
  if (cache) return cache;
  const result = readJSON(STORAGE_KEYS.readArticles, (raw) =>
    Array.isArray(raw) && raw.every((x) => typeof x === "string") ? (raw as string[]) : null,
  );
  cache = result.ok ? result.value : [];
  return cache;
}

const EMPTY: string[] = [];

function subscribe(listener: () => void) {
  listeners.add(listener);
  const onStorage = (e: StorageEvent) => {
    if (e.key === STORAGE_KEYS.readArticles) {
      cache = null;
      listener();
    }
  };
  window.addEventListener("storage", onStorage);
  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

/** Articles marqués comme lus, partagés entre composants et onglets. */
export function useReadArticles() {
  const read$ = useSyncExternalStore(subscribe, read, () => EMPTY);

  const setRead = useCallback((slug: string, value: boolean) => {
    const current = read();
    const next = value ? Array.from(new Set([...current, slug])) : current.filter((s) => s !== slug);
    cache = next;
    writeJSON(STORAGE_KEYS.readArticles, next);
    listeners.forEach((l) => l());
  }, []);

  return { read: read$, isRead: (slug: string) => read$.includes(slug), setRead };
}
