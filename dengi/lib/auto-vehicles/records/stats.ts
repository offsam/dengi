import { formatAppDate } from "@/lib/i18n/locale";
import type { AutoVehicleRecord } from "./types";

export type AutoVehicleMonthSummary = {
  id: string;
  label: string;
  paymentsTotal: number;
  expensesTotal: number;
  paymentsCount: number;
  expensesCount: number;
};

function monthId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function monthLabel(date: Date) {
  return formatAppDate(date, { month: "long", year: "numeric" });
}

export function summarizeRecordsForMonth(
  records: AutoVehicleRecord[],
  monthDate: Date
): Omit<AutoVehicleMonthSummary, "label"> & { label: string } {
  const targetId = monthId(monthDate);
  const monthRecords = records.filter(
    (record) => monthId(new Date(record.occurredAt)) === targetId
  );

  const payments = monthRecords.filter((record) => record.kind === "payment");
  const expenses = monthRecords.filter((record) => record.kind === "expense");

  return {
    id: targetId,
    label: monthLabel(monthDate),
    paymentsTotal: payments.reduce((sum, record) => sum + record.amount, 0),
    expensesTotal: expenses.reduce((sum, record) => sum + record.amount, 0),
    paymentsCount: payments.length,
    expensesCount: expenses.length,
  };
}

export function buildAutoVehicleMonthlySummaries(records: AutoVehicleRecord[]) {
  const ids = new Set<string>();

  for (const record of records) {
    ids.add(monthId(new Date(record.occurredAt)));
  }

  if (ids.size === 0) {
    const now = new Date();
    ids.add(monthId(now));
  }

  return [...ids]
    .sort((left, right) => right.localeCompare(left))
    .map((id) => {
      const [year, month] = id.split("-").map(Number);
      return summarizeRecordsForMonth(records, new Date(year, month - 1, 1));
    });
}

export function sumRecordsTotal(records: AutoVehicleRecord[], kind: AutoVehicleRecord["kind"]) {
  return records
    .filter((record) => record.kind === kind)
    .reduce((sum, record) => sum + record.amount, 0);
}
