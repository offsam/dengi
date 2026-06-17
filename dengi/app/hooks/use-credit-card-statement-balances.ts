"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  readCreditCardStatementBalances,
  upsertCreditCardStatementBalance as persistStatementBalance,
} from "@/lib/credit-cards/statement-balances/storage";

const STORAGE_EVENT = "dengi:credit-card-statement-balances-updated";
const STORAGE_KEY = "dengi:credit-card-statement-balances";

const EMPTY_BALANCES: Record<string, number> = {};

let cachedSnapshot: Record<string, number> = EMPTY_BALANCES;
let cachedStorageRaw: string | null = null;
let cachedCardId: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
  cachedCardId = null;
}

function getSnapshot(cardId: string) {
  if (typeof window === "undefined") {
    return EMPTY_BALANCES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__empty__";

  if (storageMarker === cachedStorageRaw && cachedCardId === cardId) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedCardId = cardId;

  const balances = readCreditCardStatementBalances();
  const map: Record<string, number> = {};

  for (const entry of balances) {
    if (entry.cardId === cardId) {
      map[entry.monthId] = entry.debt;
    }
  }

  cachedSnapshot = map;
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
  return EMPTY_BALANCES;
}

function notifyStatementBalancesChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useCreditCardStatementBalances(cardId: string) {
  const manualBalances = useSyncExternalStore(
    subscribe,
    () => getSnapshot(cardId),
    getServerSnapshot
  );

  const saveStatementBalance = useCallback(
    (monthId: string, debt: number) => {
      persistStatementBalance(cardId, monthId, debt);
      notifyStatementBalancesChanged();
    },
    [cardId]
  );

  return {
    manualBalances,
    saveStatementBalance,
  };
}
