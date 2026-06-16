"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEED_CREDIT_CARD_TRANSACTIONS } from "@/lib/credit-cards/transactions/seed";
import {
  addCreditCardTransaction as persistCreditCardTransaction,
  readCreditCardTransactions,
} from "@/lib/credit-cards/transactions/storage";
import type { CreditCardTransaction } from "@/lib/credit-cards/transactions/types";

const STORAGE_EVENT = "dengi:credit-card-transactions-updated";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return readCreditCardTransactions();
}

function getServerSnapshot() {
  return SEED_CREDIT_CARD_TRANSACTIONS;
}

function notifyTransactionsChanged() {
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

  return {
    transactions,
    addTransaction,
  };
}
