import { resolveBodyTypeIcon } from "@/lib/car-icons";
import { normalizeInsuranceSettings } from "./insurance";
import { prepareAutoVehicleDraft, toAutoVehicleDraft } from "./defaults";
import { SEED_AUTO_VEHICLES } from "./seed";
import { normalizeCashFunding } from "./cash-funding";
import { syncFinancingFromLoanInputs, resolveStoredLoanPaymentDay, syncLoanInterestFromApr } from "./loan";
import { kmToMiles } from "@/lib/units/mileage";
import { removeAutoVehicleRecordsForVehicle } from "@/lib/auto-vehicles/records/storage";
import { removeCustomExpenseCategoriesForVehicle } from "@/lib/auto-vehicles/records/custom-expense-categories";
import { syncAutoVehicleLoanPayments } from "@/lib/auto-vehicles/records/sync-loan-payments";
import type {
  AutoVehicle,
  AutoVehicleDraft,
  AutoVehicleRemoveMode,
  AutoVehicleSoldDetails,
} from "./vehicle";

const STORAGE_KEY = "dengi:auto-vehicles";
/** Одноразовая миграция: пробег хранился в км */
const MILEAGE_KM_TO_MI_KEY = "dengi:mileage-km-to-mi-v1";

function migrateMileageKmToMi(vehicles: AutoVehicle[]): AutoVehicle[] {
  if (typeof window === "undefined") {
    return vehicles;
  }

  if (window.localStorage.getItem(MILEAGE_KM_TO_MI_KEY)) {
    return vehicles;
  }

  const migrated = vehicles.map((vehicle) => ({
    ...vehicle,
    mileage: vehicle.mileage > 0 ? kmToMiles(vehicle.mileage) : vehicle.mileage,
  }));

  window.localStorage.setItem(MILEAGE_KM_TO_MI_KEY, "1");
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(migrated));

  return migrated;
}

function normalizeAutoVehicle(raw: AutoVehicle): AutoVehicle {
  const financingType = raw.financingType ?? "credit";
  const base: AutoVehicle = {
    ...raw,
    bodyIconId: resolveBodyTypeIcon(raw.bodyIconId).id,
    status: raw.status ?? "active",
    financingType,
    cashFunding:
      financingType === "cash" ? normalizeCashFunding(raw.cashFunding) : raw.cashFunding,
    purchaseDate: raw.purchaseDate || new Date().toISOString().slice(0, 10),
    loanPaymentDay: resolveStoredLoanPaymentDay(raw),
    loanTermMonths: raw.loanTermMonths ?? 60,
  };

  if (financingType === "cash") {
    return normalizeInsuranceSettings({
      ...base,
      remaining: 0,
      loanPayment: 0,
      loanTermMonths: 0,
      loanAprPercent: 0,
      loanInterest: 0,
    });
  }

  const synced = syncFinancingFromLoanInputs(base);

  return normalizeInsuranceSettings({
    ...base,
    ...synced,
  });
}

function normalizeStoredVehicles(vehicles: AutoVehicle[]): AutoVehicle[] {
  return migrateMileageKmToMi(vehicles).map(normalizeAutoVehicle);
}

export function readAutoVehicles(): AutoVehicle[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);

    // Первый визит — один раз кладём демо в localStorage, дальше только пользовательские данные
    if (!raw) {
      writeAutoVehicles(SEED_AUTO_VEHICLES);
      return normalizeStoredVehicles(SEED_AUTO_VEHICLES);
    }

    const parsed = JSON.parse(raw) as AutoVehicle[];
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return [];
    }

    return normalizeStoredVehicles(parsed);
  } catch {
    // Не подменяем сохранённые данные демо-машиной при ошибке парсинга
    return [];
  }
}

export function writeAutoVehicles(vehicles: AutoVehicle[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(vehicles));
}

export function updateAutoVehicle(id: string, patch: Partial<AutoVehicle>) {
  const vehicles = readAutoVehicles();
  const next = vehicles.map((vehicle) => {
    if (vehicle.id !== id) {
      return vehicle;
    }

    const merged: AutoVehicle = { ...vehicle, ...patch };

    return normalizeAutoVehicle({
      ...prepareAutoVehicleDraft(toAutoVehicleDraft(merged)),
      id: vehicle.id,
    });
  });
  writeAutoVehicles(next);
  const updated = next.find((vehicle) => vehicle.id === id);
  if (updated) {
    syncAutoVehicleLoanPayments(updated);
  }
  return next;
}

export function addAutoVehicle(draft: AutoVehicleDraft) {
  const vehicles = readAutoVehicles();
  const vehicle = normalizeAutoVehicle({
    ...prepareAutoVehicleDraft(draft),
    id: crypto.randomUUID(),
  });
  const next = [...vehicles, vehicle];
  writeAutoVehicles(next);
  syncAutoVehicleLoanPayments(vehicle);
  return next;
}

export function deleteAutoVehicle(id: string) {
  const next = readAutoVehicles().filter((vehicle) => vehicle.id !== id);
  writeAutoVehicles(next);
  return next;
}

/** Убрать авто: с транзакциями, как проданное или только запись */
export function disposeAutoVehicle(
  id: string,
  mode: AutoVehicleRemoveMode,
  sold?: AutoVehicleSoldDetails
) {
  if (mode === "with-records") {
    deleteAutoVehicle(id);
    removeAutoVehicleRecordsForVehicle(id);
    removeCustomExpenseCategoriesForVehicle(id);
    return readAutoVehicles();
  }

  if (mode === "vehicle-only") {
    return deleteAutoVehicle(id);
  }

  const vehicles = readAutoVehicles();
  const next = vehicles.map((vehicle) => {
    if (vehicle.id !== id) {
      return vehicle;
    }

    const soldPrice = Math.max(0, sold?.soldPrice ?? 0);
    const maxLoanPayoff = Math.min(soldPrice, Math.max(0, vehicle.remaining));
    const soldLoanPayoff = Math.max(
      0,
      Math.min(sold?.soldLoanPayoff ?? 0, maxLoanPayoff)
    );
    const soldWalletAmount = Math.max(0, soldPrice - soldLoanPayoff);
    const remainingAfter = Math.max(0, vehicle.remaining - soldLoanPayoff);
    const loanAprPercent = vehicle.loanAprPercent ?? 0;

    return normalizeAutoVehicle({
      ...vehicle,
      status: "sold",
      soldAt: new Date().toISOString().slice(0, 10),
      soldPrice,
      soldLoanPayoff,
      soldWalletAmount,
      soldWalletId: sold?.soldWalletId ?? "dc-3",
      soldIgnoreLoanPayoff: sold?.ignoreLoanPayoff ?? false,
      remaining: remainingAfter,
      loanInterest:
        remainingAfter > 0 && loanAprPercent > 0
          ? syncLoanInterestFromApr(remainingAfter, loanAprPercent)
          : 0,
    });
  });

  writeAutoVehicles(next);
  return next;
}
