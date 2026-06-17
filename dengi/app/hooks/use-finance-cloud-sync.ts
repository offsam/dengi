"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  applyLocalSnapshot,
  collectLocalSnapshot,
  getOrCreateSyncKey,
  localHasFinanceData,
  readLocalSyncUpdatedAt,
  readSyncKeyFromUrl,
  writeLocalSyncUpdatedAt,
  SYNC_KEY_STORAGE,
} from "@/lib/sync/local-snapshot";

export type FinanceSyncStatus = "idle" | "syncing" | "synced" | "error" | "offline";

const SYNC_DEBOUNCE_MS = 1200;
const STORAGE_PREFIX = "dengi:";

export function useFinanceCloudSync() {
  const [status, setStatus] = useState<FinanceSyncStatus>("idle");
  const [syncKey, setSyncKey] = useState<string | null>(() => {
    if (typeof window === "undefined") {
      return null;
    }

    const urlKey = readSyncKeyFromUrl();
    if (urlKey) {
      window.localStorage.setItem(SYNC_KEY_STORAGE, urlKey);
      return urlKey;
    }

    return getOrCreateSyncKey();
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const debounceRef = useRef<number | null>(null);
  const syncingRef = useRef(false);
  const applyingCloudRef = useRef(false);
  const syncReadyRef = useRef(false);

  const pushSnapshot = useCallback(async (key: string) => {
    if (syncingRef.current || applyingCloudRef.current) {
      return;
    }

    syncingRef.current = true;
    setStatus("syncing");
    setErrorMessage(null);

    try {
      const response = await fetch("/api/finance-sync", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          syncKey: key,
          payload: collectLocalSnapshot(),
        }),
      });

      const data = (await response.json()) as {
        syncKey?: string;
        updatedAt?: string;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось сохранить в облако.");
      }

      if (data.syncKey) {
        window.localStorage.setItem(SYNC_KEY_STORAGE, data.syncKey);
        setSyncKey(data.syncKey);
      }

      if (data.updatedAt) {
        writeLocalSyncUpdatedAt(data.updatedAt);
        setLastSyncedAt(data.updatedAt);
      }

      setStatus("synced");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Ошибка синхронизации.");
    } finally {
      syncingRef.current = false;
    }
  }, []);

  const pullSnapshot = useCallback(async (key: string) => {
    if (syncingRef.current) {
      return;
    }

    syncingRef.current = true;
    setStatus("syncing");
    setErrorMessage(null);

    try {
      const response = await fetch(`/api/finance-sync?syncKey=${encodeURIComponent(key)}`);
      const data = (await response.json()) as {
        payload?: Record<string, string>;
        updatedAt?: string | null;
        error?: string;
      };

      if (!response.ok) {
        throw new Error(data.error ?? "Не удалось загрузить из облака.");
      }

      const cloudUpdatedAt = data.updatedAt ? Date.parse(data.updatedAt) : null;
      const localUpdatedAt = readLocalSyncUpdatedAt();
      const localSnapshot = collectLocalSnapshot();
      const localHasData = localHasFinanceData(localSnapshot);

      if (
        data.payload &&
        Object.keys(data.payload).length > 0 &&
        cloudUpdatedAt &&
        (!localHasData || !localUpdatedAt || cloudUpdatedAt > localUpdatedAt)
      ) {
        applyingCloudRef.current = true;
        applyLocalSnapshot(data.payload);
        writeLocalSyncUpdatedAt(data.updatedAt!);
        queueMicrotask(() => {
          applyingCloudRef.current = false;
        });
      } else if (localHasData) {
        await pushSnapshot(key);
        return;
      }

      if (data.updatedAt) {
        setLastSyncedAt(data.updatedAt);
      }

      setStatus("synced");
    } catch (error) {
      setStatus("error");
      setErrorMessage(error instanceof Error ? error.message : "Ошибка синхронизации.");
    } finally {
      syncingRef.current = false;
    }
  }, [pushSnapshot]);

  const schedulePush = useCallback(
    (key: string) => {
      if (!syncReadyRef.current || applyingCloudRef.current || syncingRef.current) {
        return;
      }

      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }

      debounceRef.current = window.setTimeout(() => {
        void pushSnapshot(key);
      }, SYNC_DEBOUNCE_MS);
    },
    [pushSnapshot]
  );

  useEffect(() => {
    if (!syncKey) {
      queueMicrotask(() => setStatus("offline"));
      return;
    }

    const listenersSyncKey: string = syncKey;
    let cancelled = false;

    queueMicrotask(() => {
      void pullSnapshot(listenersSyncKey).finally(() => {
        if (!cancelled) {
          syncReadyRef.current = true;
        }
      });
    });

    function onStorage(event: StorageEvent) {
      if (event.key?.startsWith(STORAGE_PREFIX) && event.key !== SYNC_KEY_STORAGE) {
        schedulePush(listenersSyncKey);
      }
    }

    function onLocalChange() {
      schedulePush(listenersSyncKey);
    }

    window.addEventListener("storage", onStorage);
    window.addEventListener("dengi:credit-cards-updated", onLocalChange);
    window.addEventListener("dengi:auto-vehicles-updated", onLocalChange);
    window.addEventListener("dengi:debit-cash-updated", onLocalChange);
    window.addEventListener("dengi:housing-bills-updated", onLocalChange);
    window.addEventListener("dengi:income-sources-updated", onLocalChange);
    window.addEventListener("dengi:credit-card-transactions-updated", onLocalChange);
    window.addEventListener("dengi:credit-card-statement-balances-updated", onLocalChange);

    return () => {
      cancelled = true;
      syncReadyRef.current = false;

      if (debounceRef.current !== null) {
        window.clearTimeout(debounceRef.current);
      }

      window.removeEventListener("storage", onStorage);
      window.removeEventListener("dengi:credit-cards-updated", onLocalChange);
      window.removeEventListener("dengi:auto-vehicles-updated", onLocalChange);
      window.removeEventListener("dengi:debit-cash-updated", onLocalChange);
      window.removeEventListener("dengi:housing-bills-updated", onLocalChange);
      window.removeEventListener("dengi:income-sources-updated", onLocalChange);
      window.removeEventListener("dengi:credit-card-transactions-updated", onLocalChange);
      window.removeEventListener("dengi:credit-card-statement-balances-updated", onLocalChange);
    };
  }, [pullSnapshot, schedulePush, syncKey]);

  const syncNow = useCallback(() => {
    if (!syncKey) {
      return;
    }

    void pushSnapshot(syncKey);
  }, [pushSnapshot, syncKey]);

  return {
    status,
    syncKey,
    lastSyncedAt,
    errorMessage,
    syncNow,
  };
}
