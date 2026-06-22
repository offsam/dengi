import { buildVehicleDisplayTitle } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";
import { BANKS } from "@/lib/bank-logos";
import type { CreditCard } from "@/lib/credit-cards/types";
import type { HousingBill } from "./housing-bills";
import type { DebitCashAccount } from "./debit-accounts";

import type { AppLang } from "@/lib/i18n/types";
import { messages } from "@/lib/i18n/messages";

export type DashboardMetricId =
  | "totalDebt"
  | "interestThisMonth"
  | "assets"
  | "billsDueSoon";

export type DashboardMetricBreakdownLine = {
  id: string;
  label: string;
  detail?: string;
  amount: number;
};

export type DashboardMetricChartSegment = {
  id: string;
  label: string;
  amount: number;
  percent: number;
  color: string;
};

/** Палитра сегментов диаграммы */
export const DASHBOARD_CHART_COLORS = [
  "#D47F7F",
  "#7B9FD4",
  "#5DAA8C",
  "#D4AF37",
  "#E8A87C",
  "#9B8EC4",
  "#A58018",
  "#69707A",
] as const;

export function getDashboardMetricTitle(metricId: DashboardMetricId, lang: AppLang = "ru") {
  return messages[lang].metrics[metricId];
}

/** @deprecated Используйте getDashboardMetricTitle(metricId, lang) */
export const DASHBOARD_METRIC_TITLES: Record<DashboardMetricId, string> = {
  totalDebt: messages.ru.metrics.totalDebt,
  interestThisMonth: messages.ru.metrics.interestThisMonth,
  assets: messages.ru.metrics.assets,
  billsDueSoon: messages.ru.metrics.billsDueSoon,
};

export const DASHBOARD_METRIC_SLUGS: Record<DashboardMetricId, string> = {
  totalDebt: "total-debt",
  interestThisMonth: "interest",
  assets: "assets",
  billsDueSoon: "bills-due-soon",
};

const slugToMetricId = Object.fromEntries(
  Object.entries(DASHBOARD_METRIC_SLUGS).map(([id, slug]) => [slug, id])
) as Record<string, DashboardMetricId>;

export function dashboardMetricHref(metricId: DashboardMetricId) {
  return `/dashboard/${DASHBOARD_METRIC_SLUGS[metricId]}`;
}

export function parseDashboardMetricSlug(slug: string): DashboardMetricId | null {
  return slugToMetricId[slug] ?? null;
}

export const DASHBOARD_METRIC_TONES: Record<
  DashboardMetricId,
  "neutral" | "danger" | "positive"
> = {
  totalDebt: "danger",
  interestThisMonth: "danger",
  assets: "positive",
  billsDueSoon: "neutral",
};

function estimateCardMonthlyInterest(card: CreditCard) {
  if (card.balance <= 0 || card.apr <= 0) {
    return 0;
  }

  return Math.round((card.balance * card.apr) / 100 / 12);
}

function isFinancedVehicle(vehicle: AutoVehicle) {
  return vehicle.financingType === "credit" || vehicle.financingType === "leasing";
}

function sortLines(lines: DashboardMetricBreakdownLine[]) {
  return [...lines].sort((left, right) => right.amount - left.amount);
}

function vehicleTitle(vehicle: Pick<AutoVehicle, "catalogId" | "year">) {
  return buildVehicleDisplayTitle(vehicle.catalogId, vehicle.year);
}

function cardBankLabel(card: CreditCard) {
  if (card.bankId === "other") {
    return card.customBankName?.trim() || "Другой банк";
  }

  return BANKS[card.bankId]?.name ?? card.bankId;
}

export function computeDashboardMetricBreakdowns(
  input: {
    cards: CreditCard[];
    vehicles: AutoVehicle[];
    debitAccounts: readonly DebitCashAccount[];
    bills: HousingBill[];
  },
  lang: AppLang = "ru"
) {
  const duePrefix = messages[lang].common.duePrefix;
  const financedVehicles = input.vehicles.filter(isFinancedVehicle);

  const totalDebt = sortLines([
    ...input.cards
      .filter((card) => card.balance > 0)
      .map((card) => ({
        id: `card-debt-${card.id}`,
        label: card.name,
        detail: cardBankLabel(card),
        amount: card.balance,
      })),
    ...financedVehicles
      .filter((vehicle) => vehicle.remaining > 0)
      .map((vehicle) => ({
        id: `vehicle-debt-${vehicle.id}`,
        label: vehicleTitle(vehicle),
        detail: vehicle.financingType === "leasing" ? "Лизинг" : "Кредит",
        amount: vehicle.remaining,
      })),
  ]);

  const interestThisMonth = sortLines([
    ...input.cards
      .map((card) => ({
        card,
        interest: estimateCardMonthlyInterest(card),
      }))
      .filter(({ interest }) => interest > 0)
      .map(({ card, interest }) => ({
        id: `card-interest-${card.id}`,
        label: card.name,
        detail: `${cardBankLabel(card)} · ${card.apr.toFixed(2)}% APR`,
        amount: interest,
      })),
    ...financedVehicles
      .filter((vehicle) => vehicle.loanInterest > 0)
      .map((vehicle) => ({
        id: `vehicle-interest-${vehicle.id}`,
        label: vehicleTitle(vehicle),
        detail: "Проценты по кредиту",
        amount: vehicle.loanInterest,
      })),
  ]);

  const assets = sortLines([
    ...input.debitAccounts
      .filter((account) => account.balance > 0)
      .map((account) => ({
        id: `debit-${account.id}`,
        label: account.name,
        detail: account.bank,
        amount: account.balance,
      })),
    ...input.vehicles
      .filter((vehicle) => vehicle.purchasePrice > 0)
      .map((vehicle) => ({
        id: `vehicle-asset-${vehicle.id}`,
        label: vehicleTitle(vehicle),
        detail: "Стоимость покупки",
        amount: vehicle.purchasePrice,
      })),
  ]);

  const billsDueSoon = sortLines(
    input.bills
      .filter((bill) => bill.amount > 0)
      .map((bill) => ({
        id: `bill-${bill.id}`,
        label: bill.name,
        detail: bill.date ? `${duePrefix} ${bill.date}` : undefined,
        amount: bill.amount,
      }))
  );

  return {
    totalDebt,
    interestThisMonth,
    assets,
    billsDueSoon,
  } satisfies Record<DashboardMetricId, DashboardMetricBreakdownLine[]>;
}

export function sumBreakdownLines(lines: DashboardMetricBreakdownLine[]) {
  return lines.reduce((sum, line) => sum + line.amount, 0);
}

function resolveLineGroup(
  line: DashboardMetricBreakdownLine,
  groupLabels: Record<"cards" | "autoLoans" | "debit" | "autoAssets", string>
) {
  if (line.id.startsWith("card-debt-") || line.id.startsWith("card-interest-")) {
    return { id: "cards", label: groupLabels.cards };
  }

  if (line.id.startsWith("vehicle-debt-") || line.id.startsWith("vehicle-interest-")) {
    return { id: "auto-loans", label: groupLabels.autoLoans };
  }

  if (line.id.startsWith("debit-")) {
    return { id: "debit", label: groupLabels.debit };
  }

  if (line.id.startsWith("vehicle-asset-")) {
    return { id: "auto-assets", label: groupLabels.autoAssets };
  }

  return { id: line.id, label: line.label };
}

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

/** Группы для круговой диаграммы: карты, автокредиты, счета… */
export function computeDashboardMetricChartSegments(
  lines: DashboardMetricBreakdownLine[],
  total: number,
  lang: AppLang = "ru"
): DashboardMetricChartSegment[] {
  const groupLabels = messages[lang].breakdownGroups;
  const grouped = new Map<string, { label: string; amount: number }>();

  for (const line of lines) {
    const group = resolveLineGroup(line, groupLabels);
    const current = grouped.get(group.id);

    if (current) {
      current.amount += line.amount;
      continue;
    }

    grouped.set(group.id, { label: group.label, amount: line.amount });
  }

  const entries = [...grouped.entries()]
    .map(([id, value]) => ({ id, ...value }))
    .sort((left, right) => right.amount - left.amount);

  const percents = distributePercents(
    entries.map((entry) => entry.amount),
    total
  );

  return entries.map((entry, index) => ({
    id: entry.id,
    label: entry.label,
    amount: entry.amount,
    percent: percents[index] ?? 0,
    color: DASHBOARD_CHART_COLORS[index % DASHBOARD_CHART_COLORS.length],
  }));
}
