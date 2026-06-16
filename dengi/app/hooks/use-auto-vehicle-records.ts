"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEED_AUTO_VEHICLE_RECORDS } from "@/lib/auto-vehicles/records/seed";
import {
  addAutoVehicleRecord as persistAutoVehicleRecord,
  readAutoVehicleRecords,
  updateAutoVehicleRecord as persistAutoVehicleRecordUpdate,
} from "@/lib/auto-vehicles/records/storage";
import type { AutoVehicleRecord, AutoVehicleRecordKind } from "@/lib/auto-vehicles/records/types";

const STORAGE_EVENT = "dengi:auto-vehicle-records-updated";
const STORAGE_KEY = "dengi:auto-vehicle-records";

let cachedSnapshot: AutoVehicleRecord[] = SEED_AUTO_VEHICLE_RECORDS;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return SEED_AUTO_VEHICLE_RECORDS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__seed__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readAutoVehicleRecords();
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
  return SEED_AUTO_VEHICLE_RECORDS;
}

function notifyRecordsChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

function sortRecords(records: AutoVehicleRecord[]) {
  return [...records].sort(
    (left, right) =>
      new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
  );
}

export function useAutoVehicleRecords(vehicleId: string, kind?: AutoVehicleRecordKind) {
  const allRecords = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const records = sortRecords(
    allRecords.filter(
      (record) => record.vehicleId === vehicleId && (kind ? record.kind === kind : true)
    )
  );

  const addRecord = useCallback(
    (input: Omit<AutoVehicleRecord, "id" | "vehicleId">) => {
      const created = persistAutoVehicleRecord({
        ...input,
        vehicleId,
      });
      notifyRecordsChanged();
      return created;
    },
    [vehicleId]
  );

  const updateRecord = useCallback(
    (id: string, patch: Partial<Omit<AutoVehicleRecord, "id" | "vehicleId">>) => {
      const updated = persistAutoVehicleRecordUpdate(id, patch);
      notifyRecordsChanged();
      return updated;
    },
    []
  );

  return {
    records,
    allVehicleRecords: sortRecords(
      allRecords.filter((record) => record.vehicleId === vehicleId)
    ),
    addRecord,
    updateRecord,
  };
}
