import { SEED_AUTO_VEHICLE_RECORDS } from "./seed";
import type { AutoVehicleRecord } from "./types";

const STORAGE_KEY = "dengi:auto-vehicle-records";

export function readAutoVehicleRecords(): AutoVehicleRecord[] {
  if (typeof window === "undefined") {
    return SEED_AUTO_VEHICLE_RECORDS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return SEED_AUTO_VEHICLE_RECORDS;
    }

    const parsed = JSON.parse(raw) as AutoVehicleRecord[];
    return Array.isArray(parsed) ? parsed : SEED_AUTO_VEHICLE_RECORDS;
  } catch {
    return SEED_AUTO_VEHICLE_RECORDS;
  }
}

export function writeAutoVehicleRecords(records: AutoVehicleRecord[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(records));
}

export function addAutoVehicleRecord(input: Omit<AutoVehicleRecord, "id">) {
  const records = readAutoVehicleRecords();
  const next: AutoVehicleRecord = {
    ...input,
    id: crypto.randomUUID(),
  };
  writeAutoVehicleRecords([next, ...records]);
  return next;
}

export function updateAutoVehicleRecord(
  id: string,
  patch: Partial<Omit<AutoVehicleRecord, "id" | "vehicleId">>
) {
  const records = readAutoVehicleRecords();
  let updated: AutoVehicleRecord | null = null;

  const next = records.map((record) => {
    if (record.id !== id) {
      return record;
    }

    updated = { ...record, ...patch };
    return updated;
  });

  writeAutoVehicleRecords(next);
  return updated;
}

export function removeAutoVehicleRecordsForVehicle(vehicleId: string) {
  const next = readAutoVehicleRecords().filter((record) => record.vehicleId !== vehicleId);
  writeAutoVehicleRecords(next);
  return next;
}
