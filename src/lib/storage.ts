/**
 * Accès sécurisé au stockage local. Le navigateur peut refuser l'accès
 * (navigation privée, quota dépassé, cookies bloqués) : on ne plante jamais.
 */

export type StorageResult<T> =
  | { ok: true; value: T }
  | { ok: false; reason: "unavailable" | "empty" | "corrupted" };

function getStorage(): Storage | null {
  if (typeof window === "undefined") return null;
  try {
    const storage = window.localStorage;
    const probe = "__argent_clair_probe__";
    storage.setItem(probe, "1");
    storage.removeItem(probe);
    return storage;
  } catch {
    return null;
  }
}

export function readJSON<T>(key: string, validate: (raw: unknown) => T | null): StorageResult<T> {
  const storage = getStorage();
  if (!storage) return { ok: false, reason: "unavailable" };
  let raw: string | null;
  try {
    raw = storage.getItem(key);
  } catch {
    return { ok: false, reason: "unavailable" };
  }
  if (raw === null) return { ok: false, reason: "empty" };
  try {
    const parsed: unknown = JSON.parse(raw);
    const value = validate(parsed);
    return value === null ? { ok: false, reason: "corrupted" } : { ok: true, value };
  } catch {
    return { ok: false, reason: "corrupted" };
  }
}

export function writeJSON(key: string, value: unknown): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

export function removeKey(key: string): boolean {
  const storage = getStorage();
  if (!storage) return false;
  try {
    storage.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export const STORAGE_KEYS = {
  simulator: "argent-clair:simulateur:v1",
  readArticles: "argent-clair:academie:lus:v1",
  readerSize: "argent-clair:academie:taille:v1",
  wishlist: "argent-clair:ressources:liste:v1",
  contactDraft: "argent-clair:contact:brouillon:v1",
} as const;
