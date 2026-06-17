import type { AutoVehicle } from "./vehicle";

export type AutoVehicleInsuranceBillingPeriod = "monthly" | "annual";

export const INSURANCE_BILLING_OPTIONS: {
  id: AutoVehicleInsuranceBillingPeriod;
  label: string;
}[] = [
  { id: "monthly", label: "месяц" },
  { id: "annual", label: "год" },
];

export function resolveInsuranceBillingPeriod(
  vehicle: Pick<AutoVehicle, "insuranceBillingPeriod">
): AutoVehicleInsuranceBillingPeriod {
  return vehicle.insuranceBillingPeriod === "annual" ? "annual" : "monthly";
}

/** Ежемесячный платёж — из настроек; годовой автоматически делится на 12 */
export function resolveInsuranceMonthlyPayment(
  vehicle: Pick<AutoVehicle, "insurancePaymentAmount" | "insuranceBillingPeriod">
) {
  const amount = Math.max(0, vehicle.insurancePaymentAmount ?? 0);

  if (amount <= 0) {
    return 0;
  }

  if (resolveInsuranceBillingPeriod(vehicle) === "annual") {
    return Math.round((amount / 12) * 100) / 100;
  }

  return amount;
}

export function resolveInsuranceAnnualPayment(
  vehicle: Pick<AutoVehicle, "insurancePaymentAmount" | "insuranceBillingPeriod">
) {
  const amount = Math.max(0, vehicle.insurancePaymentAmount ?? 0);

  if (amount <= 0) {
    return 0;
  }

  if (resolveInsuranceBillingPeriod(vehicle) === "annual") {
    return amount;
  }

  return Math.round(amount * 12 * 100) / 100;
}

export function normalizeInsuranceSettings<T extends Partial<AutoVehicle>>(draft: T): T {
  const provider = draft.insuranceProviderName?.trim() ?? "";
  const amount = Math.max(0, draft.insurancePaymentAmount ?? 0);

  return {
    ...draft,
    insuranceProviderName: provider || undefined,
    insuranceBillingPeriod: resolveInsuranceBillingPeriod(
      draft as Pick<AutoVehicle, "insuranceBillingPeriod">
    ),
    insurancePaymentAmount: amount > 0 ? amount : undefined,
  };
}

export function convertInsurancePaymentAmountForBillingPeriod(
  amount: number,
  from: AutoVehicleInsuranceBillingPeriod,
  to: AutoVehicleInsuranceBillingPeriod
) {
  if (amount <= 0 || from === to) {
    return amount;
  }

  if (to === "annual") {
    return Math.round(amount * 12 * 100) / 100;
  }

  return Math.round((amount / 12) * 100) / 100;
}
