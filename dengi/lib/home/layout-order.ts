export type HomeShelfId =
  | "creditCards"
  | "incomeSources"
  | "debitCash"
  | "autoVehicles"
  | "housingBills";

export const HOME_SHELF_IDS: HomeShelfId[] = [
  "incomeSources",
  "creditCards",
  "debitCash",
  "housingBills",
  "autoVehicles",
];

const SHELF_LAYOUT_VERSION = 2;
const SHELF_LAYOUT_VERSION_KEY = "dengi:home-shelf-layout-version";

const SHELF_STORAGE_KEY = "dengi:home-shelf-order";
const ITEM_STORAGE_PREFIX = "dengi:home-item-order:";

export const HOME_SHELF_STORAGE_KEY = SHELF_STORAGE_KEY;
export const HOME_ITEM_ORDER_PREFIX = ITEM_STORAGE_PREFIX;

export function readHomeShelfOrder(): HomeShelfId[] {
  if (typeof window === "undefined") {
    return [...HOME_SHELF_IDS];
  }

  const layoutVersion = window.localStorage.getItem(SHELF_LAYOUT_VERSION_KEY);
  if (layoutVersion !== String(SHELF_LAYOUT_VERSION)) {
    writeHomeShelfOrder([...HOME_SHELF_IDS]);
    window.localStorage.setItem(SHELF_LAYOUT_VERSION_KEY, String(SHELF_LAYOUT_VERSION));
    return [...HOME_SHELF_IDS];
  }

  try {
    const raw = window.localStorage.getItem(SHELF_STORAGE_KEY);
    if (!raw) {
      return [...HOME_SHELF_IDS];
    }

    const parsed = JSON.parse(raw) as string[];
    if (!Array.isArray(parsed)) {
      return [...HOME_SHELF_IDS];
    }

    return mergeShelfOrder(parsed);
  } catch {
    return [...HOME_SHELF_IDS];
  }
}

export function writeHomeShelfOrder(order: HomeShelfId[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(SHELF_STORAGE_KEY, JSON.stringify(order));
}

export function mergeShelfOrder(stored: string[]): HomeShelfId[] {
  const allowed = new Set(HOME_SHELF_IDS);
  const merged: HomeShelfId[] = [];

  for (const id of stored) {
    if (allowed.has(id as HomeShelfId) && !merged.includes(id as HomeShelfId)) {
      merged.push(id as HomeShelfId);
    }
  }

  for (const id of HOME_SHELF_IDS) {
    if (!merged.includes(id)) {
      merged.push(id);
    }
  }

  return merged;
}

export function mergeItemOrder(stored: string[], currentIds: string[]) {
  const allowed = new Set(currentIds);
  const merged = stored.filter((id) => allowed.has(id));

  for (const id of currentIds) {
    if (!merged.includes(id)) {
      merged.push(id);
    }
  }

  return merged;
}

export function readHomeItemOrder(category: HomeShelfId): string[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(`${ITEM_STORAGE_PREFIX}${category}`);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as string[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeHomeItemOrder(category: HomeShelfId, order: string[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${ITEM_STORAGE_PREFIX}${category}`, JSON.stringify(order));
}

export function applyItemOrder<T extends { id: string }>(
  items: T[],
  order: string[]
): T[] {
  if (order.length === 0) {
    return items;
  }

  const map = new Map(items.map((item) => [item.id, item]));
  const ordered: T[] = [];

  for (const id of order) {
    const item = map.get(id);
    if (item) {
      ordered.push(item);
      map.delete(id);
    }
  }

  for (const item of items) {
    if (map.has(item.id)) {
      ordered.push(item);
    }
  }

  return ordered;
}

export function moveInArray<T>(items: T[], index: number, direction: -1 | 1): T[] | null {
  const targetIndex = index + direction;
  if (index < 0 || index >= items.length || targetIndex < 0 || targetIndex >= items.length) {
    return null;
  }

  const next = [...items];
  [next[index], next[targetIndex]] = [next[targetIndex], next[index]];
  return next;
}
