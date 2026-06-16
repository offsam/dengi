import { APP_LOCALE } from "@/lib/i18n/locale";
import type { CreditCardTransaction } from "./types";

export type ReportPeriodPreset =
  | "7d"
  | "30d"
  | "90d"
  | "3m"
  | "6m"
  | "12m"
  | "custom";

export type ReportPeriod = {
  preset: ReportPeriodPreset;
  start: Date;
  end: Date;
};

export type CreditCardReportSummary = {
  spending: number;
  interest: number;
  payments: number;
  fees: number;
  transactionCount: number;
};

function startOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(0, 0, 0, 0);
  return next;
}

function endOfDay(date: Date) {
  const next = new Date(date);
  next.setHours(23, 59, 59, 999);
  return next;
}

function subtractDays(date: Date, days: number) {
  const next = new Date(date);
  next.setDate(next.getDate() - days);
  return next;
}

function subtractMonths(date: Date, months: number) {
  const next = new Date(date);
  next.setMonth(next.getMonth() - months);
  return next;
}

export function buildReportPeriod(
  preset: ReportPeriodPreset,
  customStart?: string,
  customEnd?: string
): ReportPeriod {
  const end = endOfDay(new Date());
  let start = startOfDay(new Date());

  switch (preset) {
    case "7d":
      start = startOfDay(subtractDays(end, 6));
      break;
    case "30d":
      start = startOfDay(subtractDays(end, 29));
      break;
    case "90d":
      start = startOfDay(subtractDays(end, 89));
      break;
    case "3m":
      start = startOfDay(subtractMonths(end, 3));
      break;
    case "6m":
      start = startOfDay(subtractMonths(end, 6));
      break;
    case "12m":
      start = startOfDay(subtractMonths(end, 12));
      break;
    case "custom":
      start = customStart
        ? startOfDay(new Date(customStart))
        : startOfDay(subtractDays(end, 29));
      return {
        preset,
        start,
        end: customEnd ? endOfDay(new Date(customEnd)) : end,
      };
  }

  return { preset, start, end };
}

export function filterTransactionsByPeriod(
  transactions: CreditCardTransaction[],
  period: ReportPeriod
) {
  return transactions.filter((transaction) => {
    const occurredAt = new Date(transaction.occurredAt);
    return occurredAt >= period.start && occurredAt <= period.end;
  });
}

export function summarizeCreditCardTransactions(
  transactions: CreditCardTransaction[]
): CreditCardReportSummary {
  return transactions.reduce<CreditCardReportSummary>(
    (summary, transaction) => {
      summary.transactionCount += 1;

      switch (transaction.type) {
        case "purchase":
          summary.spending += transaction.amount;
          break;
        case "interest":
          summary.interest += transaction.amount;
          break;
        case "payment":
          summary.payments += transaction.amount;
          break;
        case "fee":
          summary.fees += transaction.amount;
          break;
      }

      return summary;
    },
    {
      spending: 0,
      interest: 0,
      payments: 0,
      fees: 0,
      transactionCount: 0,
    }
  );
}

export function formatReportPeriodLabel(period: ReportPeriod) {
  const formatter = new Intl.DateTimeFormat(APP_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return `${formatter.format(period.start)} – ${formatter.format(period.end)}`;
}

export type MonthlyDebtEntry = {
  id: string;
  label: string;
  subtitle?: string;
  debt: number;
};

export const MAX_MONTHLY_DEBT_HISTORY = 10;

function endOfMonth(date: Date) {
  return endOfDay(new Date(date.getFullYear(), date.getMonth() + 1, 0));
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat(APP_LOCALE, {
    month: "long",
    year: "numeric",
  }).format(date);
}

function reverseTransactionEffect(
  balance: number,
  transaction: CreditCardTransaction
) {
  switch (transaction.type) {
    case "purchase":
    case "interest":
    case "fee":
      return balance - transaction.amount;
    case "payment":
      return balance + transaction.amount;
  }
}

function balanceAsOf(
  currentBalance: number,
  transactions: CreditCardTransaction[],
  asOf: Date
) {
  let balance = currentBalance;

  for (const transaction of transactions) {
    if (new Date(transaction.occurredAt) <= asOf) {
      continue;
    }

    balance = reverseTransactionEffect(balance, transaction);
  }

  return Math.max(0, balance);
}

export function buildMonthlyDebtHistory(
  currentBalance: number,
  transactions: CreditCardTransaction[],
  maxMonths = MAX_MONTHLY_DEBT_HISTORY
): MonthlyDebtEntry[] {
  const now = new Date();
  const entries: MonthlyDebtEntry[] = [];

  for (let index = 0; index < maxMonths; index += 1) {
    const monthDate = new Date(now.getFullYear(), now.getMonth() - index, 1);
    const isCurrentMonth = index === 0;
    const asOf = isCurrentMonth ? now : endOfMonth(monthDate);
    const debt = balanceAsOf(currentBalance, transactions, asOf);

    entries.push({
      id: `${monthDate.getFullYear()}-${monthDate.getMonth()}`,
      label: formatMonthYear(monthDate),
      subtitle: isCurrentMonth ? "Сегодня" : undefined,
      debt,
    });
  }

  return entries;
}

export function summarizeTransactionsForMonth(
  transactions: CreditCardTransaction[],
  monthDate: Date
) {
  const start = startOfDay(new Date(monthDate.getFullYear(), monthDate.getMonth(), 1));
  const end = endOfMonth(monthDate);

  return summarizeCreditCardTransactions(
    transactions.filter((transaction) => {
      const occurredAt = new Date(transaction.occurredAt);
      return occurredAt >= start && occurredAt <= end;
    })
  );
}
