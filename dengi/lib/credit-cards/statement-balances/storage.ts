import type { CreditCardStatementBalance } from "./types";

const STORAGE_KEY = "dengi:credit-card-statement-balances";

function balanceKey(cardId: string, monthId: string) {
  return `${cardId}:${monthId}`;
}

export function readCreditCardStatementBalances(): CreditCardStatementBalance[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CreditCardStatementBalance[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCreditCardStatementBalances(
  balances: CreditCardStatementBalance[]
) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(balances));
}

export function readStatementBalancesForCard(cardId: string) {
  const balances = readCreditCardStatementBalances();
  const map: Record<string, number> = {};

  for (const entry of balances) {
    if (entry.cardId === cardId) {
      map[entry.monthId] = entry.debt;
    }
  }

  return map;
}

export function upsertCreditCardStatementBalance(
  cardId: string,
  monthId: string,
  debt: number
) {
  const balances = readCreditCardStatementBalances();
  const key = balanceKey(cardId, monthId);
  const nextEntry: CreditCardStatementBalance = {
    cardId,
    monthId,
    debt: Math.max(0, debt),
    updatedAt: new Date().toISOString(),
  };

  const index = balances.findIndex(
    (entry) => balanceKey(entry.cardId, entry.monthId) === key
  );

  const next =
    index === -1
      ? [...balances, nextEntry]
      : balances.map((entry, entryIndex) =>
          entryIndex === index ? nextEntry : entry
        );

  writeCreditCardStatementBalances(next);
  return nextEntry;
}

export function deleteCreditCardStatementBalancesForCard(cardId: string) {
  const balances = readCreditCardStatementBalances();
  const next = balances.filter((entry) => entry.cardId !== cardId);
  writeCreditCardStatementBalances(next);
  return next;
}
