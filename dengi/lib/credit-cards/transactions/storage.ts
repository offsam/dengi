import { SEED_CREDIT_CARD_TRANSACTIONS } from "./seed";
import type { CreditCardTransaction } from "./types";

const STORAGE_KEY = "dengi:credit-card-transactions";

export function readCreditCardTransactions(): CreditCardTransaction[] {
  if (typeof window === "undefined") {
    return SEED_CREDIT_CARD_TRANSACTIONS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return SEED_CREDIT_CARD_TRANSACTIONS;
    }

    const parsed = JSON.parse(raw) as CreditCardTransaction[];
    return Array.isArray(parsed) ? parsed : SEED_CREDIT_CARD_TRANSACTIONS;
  } catch {
    return SEED_CREDIT_CARD_TRANSACTIONS;
  }
}

export function writeCreditCardTransactions(
  transactions: CreditCardTransaction[]
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(transactions));
}

export function addCreditCardTransaction(
  input: Omit<CreditCardTransaction, "id">
) {
  const transactions = readCreditCardTransactions();
  const next: CreditCardTransaction = {
    ...input,
    id: crypto.randomUUID(),
  };
  writeCreditCardTransactions([next, ...transactions]);
  return next;
}
