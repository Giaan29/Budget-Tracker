import { migrate, createDefaultStore } from "./migrate.ts";
import type { Store } from "./types.ts";

export const STORAGE_KEY = "budget-tracker:v1";

let cachedStore: Store | null = null;
let loaded = false;
let initialized = false;
let available = true;
const listeners = new Set<() => void>();

function emit(): void {
  for (const listener of listeners) listener();
}

function readFromStorage(): Store | null {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    available = true;
    if (!raw) return null;

    const parsed: unknown = JSON.parse(raw);
    return migrate(parsed);
  } catch {
    available = false;
    return null;
  }
}

export function getSnapshot(): Store {
  if (!loaded || cachedStore === null) {
    cachedStore = readFromStorage() ?? createDefaultStore();
    loaded = true;
  }

  return cachedStore;
}

export function getServerSnapshot(): Store | null {
  return null;
}

export function subscribe(listener: () => void): () => void {
  listeners.add(listener);

  if (typeof window === "undefined") {
    return () => listeners.delete(listener);
  }

  const onStorage = (event: StorageEvent) => {
    if (event.key !== STORAGE_KEY && event.key !== null) return;
    loaded = false;
    cachedStore = null;
    getSnapshot();
    emit();
  };

  window.addEventListener("storage", onStorage);

  return () => {
    listeners.delete(listener);
    window.removeEventListener("storage", onStorage);
  };
}

export function writeStore(next: Store): void {
  cachedStore = next;
  loaded = true;

  if (typeof window === "undefined") {
    emit();
    return;
  }

  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
    available = true;
  } catch {
    available = false;
  }

  emit();
}

export function updateStore(updater: (current: Store) => Store): void {
  writeStore(updater(getSnapshot()));
}

/**
 * Persists the starter document on first visit. Runs once, after hydration.
 */
export function ensureInitialized(): void {
  if (initialized || typeof window === "undefined") return;
  initialized = true;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    available = true;
    if (raw === null) {
      writeStore(getSnapshot());
    }
  } catch {
    available = false;
  }
}

/**
 * Confirms that this browser can read and write local storage. Used by
 * Settings so a blocked or full store is visible rather than silent.
 */
export function checkStorageAvailability(): boolean {
  if (typeof window === "undefined") return false;

  try {
    const probeKey = `${STORAGE_KEY}:probe`;
    window.localStorage.setItem(probeKey, "1");
    window.localStorage.removeItem(probeKey);
    available = true;
  } catch {
    available = false;
  }

  return available;
}

export async function requestPersistentStorage(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.persist) {
      return false;
    }
    return await navigator.storage.persist();
  } catch {
    return false;
  }
}

export async function persistentStorageGranted(): Promise<boolean> {
  try {
    if (typeof navigator === "undefined" || !navigator.storage?.persisted) {
      return false;
    }
    return await navigator.storage.persisted();
  } catch {
    return false;
  }
}
