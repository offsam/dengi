"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  findOrCreateCustomExpenseCategory,
  readCustomExpenseCategories,
  type CustomExpenseCategory,
} from "@/lib/auto-vehicles/records/custom-expense-categories";

const STORAGE_EVENT = "dengi:custom-expense-categories-updated";
const STORAGE_KEY = "dengi:auto-vehicle-custom-expense-categories";

const EMPTY_CATEGORIES: CustomExpenseCategory[] = [];

let cachedSnapshot: CustomExpenseCategory[] = EMPTY_CATEGORIES;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_CATEGORIES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__empty__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readCustomExpenseCategories();
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
  return EMPTY_CATEGORIES;
}

function notifyCustomCategoriesChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useCustomExpenseCategories(vehicleId: string) {
  const allCategories = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const categories = useMemo(
    () =>
      allCategories
        .filter((category) => category.vehicleId === vehicleId)
        .sort((left, right) => left.label.localeCompare(right.label, "ru")),
    [allCategories, vehicleId]
  );

  const ensureCategory = useCallback(
    (label: string) => {
      const created = findOrCreateCustomExpenseCategory(vehicleId, label);

      if (created) {
        notifyCustomCategoriesChanged();
      }

      return created;
    },
    [vehicleId]
  );

  return {
    categories,
    ensureCategory,
  };
}
