/**
 * Safe key-value storage. Browser storage can be missing or throw
 * (private mode, blocked cookies, previews), so callers get an in-memory
 * fallback instead of an exception and the page keeps working.
 */

export interface KeyValueStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export function createMemoryStorage(): KeyValueStorage {
  const map = new Map<string, string>();
  return {
    getItem: (k) => map.get(k) ?? null,
    setItem: (k, v) => void map.set(k, v),
    removeItem: (k) => void map.delete(k),
  };
}

let shared: KeyValueStorage | null = null;
let persistent = false;

/** Browser localStorage when usable, otherwise a per-page memory store. */
export function getStorage(): KeyValueStorage {
  if (shared) return shared;
  try {
    const ls = globalThis.localStorage;
    const probe = '__ft_probe__';
    ls.setItem(probe, '1');
    ls.removeItem(probe);
    shared = ls;
    persistent = true;
  } catch {
    shared = createMemoryStorage();
  }
  return shared;
}

/** False when only the in-memory fallback is available (data is lost when the page closes). */
export function isStoragePersistent(): boolean {
  getStorage();
  return persistent;
}

export function readJson<T>(storage: KeyValueStorage, key: string, fallback: T): T {
  try {
    const raw = storage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

/** Returns false when the write failed (e.g. quota exceeded). */
export function writeJson(storage: KeyValueStorage, key: string, value: unknown): boolean {
  try {
    storage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}
