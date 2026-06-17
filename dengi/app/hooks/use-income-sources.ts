"use client";

import { useCallback, useSyncExternalStore } from "react";
import {
  addIncomeSource as persistAdd,
  deleteIncomeSource as persistDelete,
  readIncomeSources,
  updateIncomeSource as persistUpdate,
} from "@/lib/income-sources/storage";
import {
  INCOME_SOURCES_SEED,
  type IncomeSource,
  type IncomeSourceDraft,
} from "@/lib/income-sources/types";

const STORAGE_EVENT = "dengi:income-sources-updated";
const STORAGE_KEY = "dengi:income-sources";

const EMPTY_SOURCES: IncomeSource[] = [];

let cachedSnapshot: IncomeSource[] = EMPTY_SOURCES;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_SOURCES;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__seed__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readIncomeSources();
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
  return INCOME_SOURCES_SEED;
}

function notifyChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useIncomeSources() {
  const sources = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const addSource = useCallback((draft: IncomeSourceDraft) => {
    const next = persistAdd(draft);
    notifyChanged();
    return next.at(-1) ?? null;
  }, []);

  const updateSource = useCallback((id: string, patch: Partial<IncomeSource>) => {
    const next = persistUpdate(id, patch);
    notifyChanged();
    return next.find((source) => source.id === id) ?? null;
  }, []);

  const deleteSource = useCallback((id: string) => {
    const next = persistDelete(id);
    notifyChanged();
    return next;
  }, []);

  const getSource = useCallback(
    (id: string) => sources.find((source) => source.id === id) ?? null,
    [sources]
  );

  return {
    sources,
    addSource,
    updateSource,
    deleteSource,
    getSource,
  };
}
