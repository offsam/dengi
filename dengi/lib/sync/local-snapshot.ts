export const SYNC_KEY_STORAGE = "dengi:sync-key";
export const SYNC_UPDATED_AT_STORAGE = "dengi:sync-updated-at";

export type FinanceLocalSnapshot = Record<string, string>;

const SNAPSHOT_PREFIX = "dengi:";

const SYNC_META_KEYS = new Set([SYNC_KEY_STORAGE, SYNC_UPDATED_AT_STORAGE]);

/** Есть ли в localStorage финансовые данные, а не только ключ синхронизации */
export function localHasFinanceData(snapshot = collectLocalSnapshot()) {
  return Object.keys(snapshot).some((key) => !SYNC_META_KEYS.has(key));
}

/** Ключ из ?syncKey= — чтобы подтянуть данные на новом домене (prod после localhost) */
export function readSyncKeyFromUrl() {
  if (typeof window === "undefined") {
    return null;
  }

  const fromUrl = new URLSearchParams(window.location.search).get("syncKey")?.trim();
  return fromUrl || null;
}

/** Собрать все ключи dengi:* из localStorage */
export function collectLocalSnapshot(): FinanceLocalSnapshot {
  if (typeof window === "undefined") {
    return {};
  }

  const snapshot: FinanceLocalSnapshot = {};

  for (let index = 0; index < window.localStorage.length; index += 1) {
    const key = window.localStorage.key(index);
    if (!key?.startsWith(SNAPSHOT_PREFIX)) {
      continue;
    }

    const value = window.localStorage.getItem(key);
    if (value !== null) {
      snapshot[key] = value;
    }
  }

  return snapshot;
}

/** Восстановить localStorage из снимка и обновить экран */
export function applyLocalSnapshot(snapshot: FinanceLocalSnapshot) {
  if (typeof window === "undefined") {
    return;
  }

  for (const [key, value] of Object.entries(snapshot)) {
    if (!key.startsWith(SNAPSHOT_PREFIX)) {
      continue;
    }

    window.localStorage.setItem(key, value);
  }

  const refreshEvents = [
    "dengi:credit-cards-updated",
    "dengi:auto-vehicles-updated",
    "dengi:debit-cash-updated",
    "dengi:housing-bills-updated",
    "dengi:credit-card-transactions-updated",
    "dengi:credit-card-statement-balances-updated",
    "dengi:income-sources-updated",
    "dengi:home-shelf-order-updated",
  ] as const;

  for (const eventName of refreshEvents) {
    window.dispatchEvent(new Event(eventName));
  }
}

export function getOrCreateSyncKey() {
  if (typeof window === "undefined") {
    return null;
  }

  const existing = window.localStorage.getItem(SYNC_KEY_STORAGE);
  if (existing) {
    return existing;
  }

  const syncKey = crypto.randomUUID();
  window.localStorage.setItem(SYNC_KEY_STORAGE, syncKey);
  return syncKey;
}

export function readLocalSyncUpdatedAt() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(SYNC_UPDATED_AT_STORAGE);
  if (!raw) {
    return null;
  }

  const parsed = Date.parse(raw);
  return Number.isFinite(parsed) ? parsed : null;
}

export function writeLocalSyncUpdatedAt(iso: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SYNC_UPDATED_AT_STORAGE, iso);
}

/** Записать ключ синхронизации (из URL или вручную) */
export function writeSyncKey(syncKey: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SYNC_KEY_STORAGE, syncKey);
}
