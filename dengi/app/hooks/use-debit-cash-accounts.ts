"use client";

import { useCallback, useSyncExternalStore } from "react";
import { DEBIT_CASH_ACCOUNTS, type DebitCashAccountDraft } from "@/lib/dashboard/debit-accounts";
import {
  addDebitCashAccount as persistDebitCashAdd,
  deleteDebitCashAccount as persistDebitCashDelete,
  readDebitCashAccounts,
  updateDebitCashAccount as persistDebitCashUpdate,
} from "@/lib/dashboard/debit-storage";
import type { DebitCashAccount } from "@/lib/dashboard/debit-accounts";

const STORAGE_EVENT = "dengi:debit-cash-updated";
const STORAGE_KEY = "dengi:debit-cash";

/** Стабильная ссылка — иначе useSyncExternalStore уходит в бесконечный цикл */
const EMPTY_ACCOUNTS: DebitCashAccount[] = [];

let cachedSnapshot: DebitCashAccount[] = EMPTY_ACCOUNTS;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_ACCOUNTS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__seed__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readDebitCashAccounts();
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
  return DEBIT_CASH_ACCOUNTS;
}

function notifyChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useDebitCashAccounts() {
  const accounts = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addAccount = useCallback((draft: DebitCashAccountDraft) => {
    const next = persistDebitCashAdd(draft);
    notifyChanged();
    return next.at(-1) ?? null;
  }, []);

  const updateAccount = useCallback((id: string, patch: Partial<DebitCashAccount>) => {
    const next = persistDebitCashUpdate(id, patch);
    notifyChanged();
    return next.find((account) => account.id === id) ?? null;
  }, []);

  const deleteAccount = useCallback((id: string) => {
    const next = persistDebitCashDelete(id);
    notifyChanged();
    return next;
  }, []);

  const getAccount = useCallback(
    (id: string) => accounts.find((account) => account.id === id) ?? null,
    [accounts]
  );

  return {
    accounts,
    addAccount,
    updateAccount,
    deleteAccount,
    getAccount,
  };
}
