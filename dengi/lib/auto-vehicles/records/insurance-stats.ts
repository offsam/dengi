import {
  resolveInsuranceMonthlyPayment,
} from "@/lib/auto-vehicles/insurance";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";
import type { AutoVehicleRecord } from "./types";

export type AutoVehicleInsuranceSnapshot = {
  monthlyPayment: number;
  providerName: string;
};

function resolveInsuranceSnapshotFromRecords(
  records: AutoVehicleRecord[]
): AutoVehicleInsuranceSnapshot | null {
  const latestInsurancePayment = records
    .filter(
      (record) => record.kind === "payment" && record.paymentType === "insurance"
    )
    .sort(
      (left, right) =>
        new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
    )[0];

  if (!latestInsurancePayment) {
    return null;
  }

  const providerName = latestInsurancePayment.description.trim();

  return {
    monthlyPayment: Math.max(0, latestInsurancePayment.amount),
    providerName: providerName || "Страховка",
  };
}

/** Страховка для статистики — сначала настройки авто, иначе последний платёж */
export function resolveAutoVehicleInsuranceSnapshot(
  vehicle: Pick<
    AutoVehicle,
    "insuranceProviderName" | "insurancePaymentAmount" | "insuranceBillingPeriod"
  >,
  records: AutoVehicleRecord[]
): AutoVehicleInsuranceSnapshot | null {
  const monthlyFromSettings = resolveInsuranceMonthlyPayment(vehicle);
  const providerFromSettings = vehicle.insuranceProviderName?.trim();

  if (monthlyFromSettings > 0 || providerFromSettings) {
    return {
      monthlyPayment: monthlyFromSettings,
      providerName: providerFromSettings || "Страховка",
    };
  }

  return resolveInsuranceSnapshotFromRecords(records);
}

/** Длинное название — одно слово, чтобы влезло в пузырь */
export function formatInsuranceProviderLabel(name: string, maxLength = 14) {
  const trimmed = name.trim();

  if (!trimmed) {
    return undefined;
  }

  if (trimmed.length <= maxLength && !trimmed.includes(" ")) {
    return trimmed;
  }

  const firstWord = trimmed.split(/\s+/).find((part) => part.length > 0);

  if (!firstWord) {
    return trimmed.slice(0, maxLength);
  }

  return firstWord.length > maxLength ? firstWord.slice(0, maxLength) : firstWord;
}
