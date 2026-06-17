"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEED_CREDIT_CARD_TRANSACTIONS } from "@/lib/credit-cards/transactions/seed";
import {
  addCreditCardTransaction as persistCreditCardTransaction,
  readCreditCardTransactions,
  updateCreditCardTransaction as persistCreditCardTransactionUpdate,
} from "@/lib/credit-cards/transactions/storage";
import type { CreditCardTransaction } from "@/lib/credit-cards/transactions/types";

const STORAGE_EVENT = "dengi:credit-card-transactions-updated";
const STORAGE_KEY = "dengi:credit-card-transactions";

/** Стабильная ссылка — иначе useSyncExternalStore уходит в бесконечный цикл */
const EMPTY_TRANSACTIONS: CreditCardTransaction[] = [];

let cachedSnapshot: CreditCardTransaction[] = EMPTY_TRANSACTIONS;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_TRANSACTIONS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__seed__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readCreditCardTransactions();
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
  return SEED_CREDIT_CARD_TRANSACTIONS;
}

function notifyTransactionsChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useCreditCardTransactions(cardId: string) {
  const allTransactions = useSyncExternalStore(
    subscribe,
    getSnapshot,
    getServerSnapshot
  );

  const transactions = allTransactions
    .filter((transaction) => transaction.cardId === cardId)
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() -
        new Date(left.occurredAt).getTime()
    );

  const addTransaction = useCallback(
    (input: Omit<CreditCardTransaction, "id" | "cardId">) => {
      const created = persistCreditCardTransaction({
        ...input,
        cardId,
      });
      notifyTransactionsChanged();
      return created;
    },
    [cardId]
  );

  const updateTransaction = useCallback(
    (id: string, patch: Partial<Omit<CreditCardTransaction, "id" | "cardId">>) => {
      const updated = persistCreditCardTransactionUpdate(id, patch);
      notifyTransactionsChanged();
      return updated;
    },
    []
  );

  return {
    transactions,
    addTransaction,
    updateTransaction,
  };
}
