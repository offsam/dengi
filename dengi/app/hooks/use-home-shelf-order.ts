"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  HOME_SHELF_IDS,
  HOME_SHELF_STORAGE_KEY,
  mergeShelfOrder,
  moveInArray,
  readHomeShelfOrder,
  writeHomeShelfOrder,
  type HomeShelfId,
} from "@/lib/home/layout-order";

const STORAGE_EVENT = "dengi:home-shelf-order-updated";

/** Стабильная ссылка — иначе useSyncExternalStore уходит в бесконечный цикл */
let cachedSnapshot: HomeShelfId[] = HOME_SHELF_IDS;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  const raw = window.localStorage.getItem(HOME_SHELF_STORAGE_KEY);
  const storageMarker = raw ?? "__empty__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readHomeShelfOrder();
  return cachedSnapshot;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getServerSnapshot() {
  return HOME_SHELF_IDS;
}

function notifyChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useHomeShelfOrder() {
  const orderedShelfIds = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const moveShelf = useCallback((shelfId: HomeShelfId, direction: -1 | 1) => {
    const current = mergeShelfOrder(readHomeShelfOrder());
    const index = current.indexOf(shelfId);
    const next = moveInArray(current, index, direction);
    if (!next) {
      return;
    }

    writeHomeShelfOrder(next);
    notifyChanged();
  }, []);

  return { orderedShelfIds, moveShelf };
}
