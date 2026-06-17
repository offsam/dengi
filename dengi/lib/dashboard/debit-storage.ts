import {
  DEBIT_CASH_ACCOUNTS,
  normalizeDebitAccount,
  type DebitCashAccount,
} from "./debit-accounts";

const STORAGE_KEY = "dengi:debit-cash";

function normalizeAccounts(accounts: DebitCashAccount[]) {
  return accounts.map((account) => normalizeDebitAccount(account));
}

export function readDebitCashAccounts(): DebitCashAccount[] {
  if (typeof window === "undefined") {
    return normalizeAccounts(DEBIT_CASH_ACCOUNTS);
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return normalizeAccounts(DEBIT_CASH_ACCOUNTS);
    }

    const parsed = JSON.parse(raw) as DebitCashAccount[];
    return Array.isArray(parsed)
      ? normalizeAccounts(parsed)
      : normalizeAccounts(DEBIT_CASH_ACCOUNTS);
  } catch {
    return normalizeAccounts(DEBIT_CASH_ACCOUNTS);
  }
}

export function writeDebitCashAccounts(accounts: DebitCashAccount[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(accounts));
}

export function addDebitCashAccount(draft: Omit<DebitCashAccount, "id">) {
  const accounts = readDebitCashAccounts();
  const account: DebitCashAccount = normalizeDebitAccount({
    ...draft,
    id: crypto.randomUUID(),
  });
  const next = [...accounts, account];
  writeDebitCashAccounts(next);
  return next;
}

export function updateDebitCashAccount(id: string, patch: Partial<DebitCashAccount>) {
  const accounts = readDebitCashAccounts();
  const next = accounts.map((account) =>
    account.id === id
      ? normalizeDebitAccount({ ...account, ...patch, id: account.id })
      : account
  );
  writeDebitCashAccounts(next);
  return next;
}

export function deleteDebitCashAccount(id: string) {
  const accounts = readDebitCashAccounts();
  const next = accounts.filter((account) => account.id !== id);
  writeDebitCashAccounts(next);
  return next;
}
