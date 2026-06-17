import { resolveInsuranceMonthlyPayment } from "@/lib/auto-vehicles/insurance";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";
import type { AutoVehicleRecord } from "./types";

export type AutoVehicleExpensePeriodTotals = {
  thisMonth: number;
  thisYear: number;
};

export type AutoVehicleLifetimeSpendingTotals = {
  /** Кредит и досрочные платежи */
  paymentsTotal: number;
  /** Расходы + страховка */
  expensesTotal: number;
  investedTotal: number;
};

type VehicleInsuranceSettings = Pick<
  AutoVehicle,
  "insuranceProviderName" | "insurancePaymentAmount" | "insuranceBillingPeriod" | "purchaseDate"
>;

type PeriodFilter = { monthId?: string; year?: number };

function monthId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function matchesPeriodFilter(occurredAt: string, filter: PeriodFilter) {
  const date = new Date(occurredAt);

  if (filter.monthId) {
    return monthId(date) === filter.monthId;
  }

  if (filter.year != null) {
    return date.getFullYear() === filter.year;
  }

  return true;
}

export function isInsuranceRecord(record: AutoVehicleRecord) {
  return (
    (record.kind === "payment" && record.paymentType === "insurance") ||
    (record.kind === "expense" && record.expenseType === "insurance")
  );
}

function isLoanOrExtraPayment(record: AutoVehicleRecord) {
  return (
    record.kind === "payment" &&
    record.paymentType !== "insurance" &&
    record.paymentType !== undefined
  );
}

function sumRecordsAmount(
  records: AutoVehicleRecord[],
  filter: PeriodFilter,
  predicate: (record: AutoVehicleRecord) => boolean
) {
  return records
    .filter(predicate)
    .filter((record) => matchesPeriodFilter(record.occurredAt, filter))
    .reduce((sum, record) => sum + record.amount, 0);
}

function sumInsuranceRecordsForPeriod(records: AutoVehicleRecord[], filter: PeriodFilter) {
  return sumRecordsAmount(records, filter, isInsuranceRecord);
}

function sumLoanAndExtraPaymentsForPeriod(records: AutoVehicleRecord[], filter: PeriodFilter) {
  return sumRecordsAmount(records, filter, isLoanOrExtraPayment);
}

function sumNonInsuranceExpensesForPeriod(records: AutoVehicleRecord[], filter: PeriodFilter) {
  return sumRecordsAmount(
    records,
    filter,
    (record) => record.kind === "expense" && record.expenseType !== "insurance"
  );
}

function monthsInYearFilter(year: number, asOf: Date) {
  if (year < asOf.getFullYear()) {
    return 12;
  }

  if (year > asOf.getFullYear()) {
    return 0;
  }

  return asOf.getMonth() + 1;
}

function countOwnedMonths(
  vehicle: Pick<AutoVehicle, "purchaseDate">,
  asOf: Date = new Date()
) {
  const purchaseDate = vehicle.purchaseDate?.trim();

  if (!purchaseDate) {
    return monthsInYearFilter(asOf.getFullYear(), asOf);
  }

  const start = new Date(`${purchaseDate}T12:00:00.000Z`);
  const startIndex = start.getFullYear() * 12 + start.getMonth();
  const endIndex = asOf.getFullYear() * 12 + asOf.getMonth();

  return Math.max(1, endIndex - startIndex + 1);
}

/** Страховка за период: фактические записи или план из настроек */
function resolveInsuranceAmountForPeriod(
  vehicle: VehicleInsuranceSettings,
  records: AutoVehicleRecord[],
  filter: PeriodFilter,
  asOf: Date = new Date()
) {
  const recorded = sumInsuranceRecordsForPeriod(records, filter);
  const monthlyFromSettings = resolveInsuranceMonthlyPayment(vehicle);

  if (monthlyFromSettings <= 0) {
    return recorded;
  }

  if (filter.monthId) {
    return recorded > 0 ? recorded : monthlyFromSettings;
  }

  if (filter.year != null) {
    const configured = monthlyFromSettings * monthsInYearFilter(filter.year, asOf);
    return Math.max(recorded, configured);
  }

  const configured = monthlyFromSettings * countOwnedMonths(vehicle, asOf);
  return Math.max(recorded, configured);
}

/** Кредит + досрочно + расходы + страховка за период */
export function computeAutoVehicleSpendingForPeriod(
  vehicle: VehicleInsuranceSettings,
  records: AutoVehicleRecord[],
  filter: PeriodFilter,
  asOf: Date = new Date()
) {
  return (
    sumLoanAndExtraPaymentsForPeriod(records, filter) +
    sumNonInsuranceExpensesForPeriod(records, filter) +
    resolveInsuranceAmountForPeriod(vehicle, records, filter, asOf)
  );
}

/** Сумма расходов на авто за текущий месяц и год */
export function computeAutoVehicleExpensePeriodTotals(
  vehicle: VehicleInsuranceSettings,
  records: AutoVehicleRecord[],
  asOf: Date = new Date()
): AutoVehicleExpensePeriodTotals {
  return {
    thisMonth: computeAutoVehicleSpendingForPeriod(
      vehicle,
      records,
      { monthId: monthId(asOf) },
      asOf
    ),
    thisYear: computeAutoVehicleSpendingForPeriod(
      vehicle,
      records,
      { year: asOf.getFullYear() },
      asOf
    ),
  };
}

/** Итоги за всё время владения — для архива и сводок */
export function computeAutoVehicleLifetimeSpendingTotals(
  vehicle: VehicleInsuranceSettings,
  records: AutoVehicleRecord[],
  asOf: Date = new Date()
): AutoVehicleLifetimeSpendingTotals {
  const paymentsTotal = sumLoanAndExtraPaymentsForPeriod(records, {});
  const expensesTotal =
    sumNonInsuranceExpensesForPeriod(records, {}) +
    resolveInsuranceAmountForPeriod(vehicle, records, {}, asOf);

  return {
    paymentsTotal,
    expensesTotal,
    investedTotal: paymentsTotal + expensesTotal,
  };
}
