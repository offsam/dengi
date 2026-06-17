"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEED_HOUSING_BILLS, type HousingBillDraft } from "@/lib/dashboard/housing-bills";
import {
  addHousingBill as persistHousingAdd,
  deleteHousingBill as persistHousingDelete,
  readHousingBills,
  updateHousingBill as persistHousingUpdate,
} from "@/lib/dashboard/housing-storage";
import type { HousingBill } from "@/lib/dashboard/housing-bills";

const STORAGE_EVENT = "dengi:housing-bills-updated";
const STORAGE_KEY = "dengi:housing-bills";

/** Стабильная ссылка — иначе useSyncExternalStore уходит в бесконечный цикл */
const EMPTY_BILLS: HousingBill[] = [];

let cachedSnapshot: HousingBill[] = EMPTY_BILLS;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_BILLS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__seed__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readHousingBills();
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
  return SEED_HOUSING_BILLS;
}

function notifyChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useHousingBills() {
  const bills = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addBill = useCallback((draft: HousingBillDraft) => {
    const next = persistHousingAdd(draft);
    notifyChanged();
    return next.at(-1) ?? null;
  }, []);

  const updateBill = useCallback((id: string, patch: Partial<HousingBill>) => {
    const next = persistHousingUpdate(id, patch);
    notifyChanged();
    return next.find((bill) => bill.id === id) ?? null;
  }, []);

  const deleteBill = useCallback((id: string) => {
    const next = persistHousingDelete(id);
    notifyChanged();
    return next;
  }, []);

  const getBill = useCallback(
    (id: string) => bills.find((bill) => bill.id === id) ?? null,
    [bills]
  );

  return {
    bills,
    addBill,
    updateBill,
    deleteBill,
    getBill,
  };
}
