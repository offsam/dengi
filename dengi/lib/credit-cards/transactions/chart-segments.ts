import type { DashboardMetricChartSegment } from "@/lib/dashboard/metric-breakdown";
import type { AppLang } from "@/lib/i18n/types";
import { getCreditChartSegmentLabel } from "@/lib/i18n/labels";
import type {
  CreditCardTransaction,
  CreditCardTransactionType,
} from "./types";

const TRANSACTION_CHART_COLORS: Record<CreditCardTransactionType, string> = {
  purchase: "#7B9FD4",
  payment: "#5DAA8C",
  interest: "#D47F7F",
  fee: "#E8A87C",
};

const TRANSACTION_TYPE_ORDER: CreditCardTransactionType[] = [
  "purchase",
  "payment",
  "interest",
  "fee",
];

function distributePercents(amounts: number[], total: number) {
  if (total <= 0 || amounts.length === 0) {
    return amounts.map(() => 0);
  }

  const raw = amounts.map((amount) => (amount / total) * 100);
  const floored = raw.map((value) => Math.floor(value));
  let remainder = 100 - floored.reduce((sum, value) => sum + value, 0);

  const order = raw
    .map((value, index) => ({ index, fraction: value - Math.floor(value) }))
    .sort((left, right) => right.fraction - left.fraction);

  const percents = [...floored];

  for (const entry of order) {
    if (remainder <= 0) {
      break;
    }

    percents[entry.index] += 1;
    remainder -= 1;
  }

  return percents;
}

export function computeCreditCardTransactionChartSegments(
  transactions: CreditCardTransaction[],
  lang: AppLang = "ru"
): DashboardMetricChartSegment[] {
  const totals = new Map<CreditCardTransactionType, number>();

  for (const transaction of transactions) {
    totals.set(transaction.type, (totals.get(transaction.type) ?? 0) + transaction.amount);
  }

  const entries = TRANSACTION_TYPE_ORDER.map((type) => ({
    type,
    amount: totals.get(type) ?? 0,
  })).filter((entry) => entry.amount > 0);

  const total = entries.reduce((sum, entry) => sum + entry.amount, 0);
  const percents = distributePercents(
    entries.map((entry) => entry.amount),
    total
  );

  return entries.map((entry, index) => ({
    id: entry.type,
    label: getCreditChartSegmentLabel(entry.type, lang),
    amount: entry.amount,
    percent: percents[index] ?? 0,
    color: TRANSACTION_CHART_COLORS[entry.type],
  }));
}
