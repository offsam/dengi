import type { AutoVehicleRecord } from "./types";

export type AutoVehicleExpensePeriodTotals = {
  thisMonth: number;
  thisYear: number;
};

function monthId(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function sumExpensesForPeriod(
  records: AutoVehicleRecord[],
  filter: { monthId?: string; year?: number }
) {
  return records
    .filter((record) => record.kind === "expense")
    .filter((record) => {
      const date = new Date(record.occurredAt);

      if (filter.monthId) {
        return monthId(date) === filter.monthId;
      }

      if (filter.year != null) {
        return date.getFullYear() === filter.year;
      }

      return true;
    })
    .reduce((sum, record) => sum + record.amount, 0);
}

/** Сумма всех расходов за текущий месяц и год */
export function computeAutoVehicleExpensePeriodTotals(
  records: AutoVehicleRecord[]
): AutoVehicleExpensePeriodTotals {
  const now = new Date();

  return {
    thisMonth: sumExpensesForPeriod(records, { monthId: monthId(now) }),
    thisYear: sumExpensesForPeriod(records, { year: now.getFullYear() }),
  };
}
