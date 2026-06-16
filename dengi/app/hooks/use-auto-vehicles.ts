"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import { useClientMounted } from "@/app/hooks/use-client-mounted";
import {
  addAutoVehicle as persistAutoVehicleAdd,
  disposeAutoVehicle,
  readAutoVehicles,
  updateAutoVehicle as persistAutoVehicleUpdate,
  writeAutoVehicles,
} from "@/lib/auto-vehicles/storage";
import { isActiveAutoVehicle, isArchivedAutoVehicle } from "@/lib/auto-vehicles/status";
import type {
  AutoVehicle,
  AutoVehicleDraft,
  AutoVehicleRemoveMode,
  AutoVehicleSoldDetails,
} from "@/lib/auto-vehicles/vehicle";

const STORAGE_EVENT = "dengi:auto-vehicles-updated";
const RECORDS_STORAGE_EVENT = "dengi:auto-vehicle-records-updated";
const STORAGE_KEY = "dengi:auto-vehicles";

let cachedSnapshot: AutoVehicle[] = [];
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return [];
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__seed__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readAutoVehicles();
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
  return [];
}

function notifyAutoVehiclesChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useAutoVehicles() {
  const mounted = useClientMounted();
  const vehicles = useSyncExternalStore(
    subscribe,
    () => (mounted ? getSnapshot() : getServerSnapshot()),
    getServerSnapshot
  );
  const activeVehicles = useMemo(
    () => vehicles.filter(isActiveAutoVehicle),
    [vehicles]
  );
  const archivedVehicles = useMemo(
    () => vehicles.filter(isArchivedAutoVehicle),
    [vehicles]
  );

  const saveVehicles = useCallback((next: AutoVehicle[]) => {
    writeAutoVehicles(next);
    notifyAutoVehiclesChanged();
  }, []);

  const updateVehicle = useCallback((id: string, patch: Partial<AutoVehicle>) => {
    const next = persistAutoVehicleUpdate(id, patch);
    notifyAutoVehiclesChanged();
    return next.find((vehicle) => vehicle.id === id) ?? null;
  }, []);

  const addVehicle = useCallback((draft: AutoVehicleDraft) => {
    const next = persistAutoVehicleAdd(draft);
    notifyAutoVehiclesChanged();
    return next.at(-1) ?? null;
  }, []);

  const disposeVehicle = useCallback(
    (id: string, mode: AutoVehicleRemoveMode, sold?: AutoVehicleSoldDetails) => {
      disposeAutoVehicle(id, mode, sold);
      notifyAutoVehiclesChanged();
      if (mode === "with-records") {
        window.dispatchEvent(new Event(RECORDS_STORAGE_EVENT));
      }
    },
    []
  );

  const getVehicle = useCallback(
    (id: string) => vehicles.find((vehicle) => vehicle.id === id) ?? null,
    [vehicles]
  );

  return {
    vehicles,
    activeVehicles,
    archivedVehicles,
    ready: true,
    saveVehicles,
    addVehicle,
    disposeVehicle,
    updateVehicle,
    getVehicle,
  };
}
