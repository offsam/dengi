"use client";

import { useMemo, useState } from "react";
import { useCreditCardTransactions } from "@/app/hooks/use-credit-card-transactions";
import { UsdAmount } from "@/app/components/usd-amount";
import {
  buildMonthlyDebtHistory,
  MAX_MONTHLY_DEBT_HISTORY,
  summarizeTransactionsForMonth,
} from "@/lib/credit-cards/transactions/report";

function ReportMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "danger" | "positive";
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-600"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-zinc-900";

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
    </div>
  );
}

export function CreditCardReportPanel({
  cardId,
  currentBalance,
}: {
  cardId: string;
  currentBalance: number;
}) {
  const { transactions } = useCreditCardTransactions(cardId);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);

  const monthlyDebt = useMemo(
    () => buildMonthlyDebtHistory(currentBalance, transactions),
    [currentBalance, transactions]
  );

  const activeMonthId = selectedMonthId ?? monthlyDebt[0]?.id ?? null;
  const activeMonth = monthlyDebt.find((item) => item.id === activeMonthId);

  const monthSummary = useMemo(() => {
    if (!activeMonthId) {
      return null;
    }

    const [year, month] = activeMonthId.split("-").map(Number);
    return summarizeTransactionsForMonth(
      transactions,
      new Date(year, month, 1)
    );
  }, [activeMonthId, transactions]);

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Отчёт</p>
          {activeMonth ? (
            <p className="mt-1 text-xs text-zinc-500">
              {activeMonth.label}
              {activeMonth.subtitle ? ` · ${activeMonth.subtitle}` : ""}
            </p>
          ) : null}
        </div>

        {monthSummary ? (
          <div className="grid grid-cols-2 gap-3">
            <ReportMetric
              label="Расходы"
              value={<UsdAmount amount={monthSummary.spending} exact />}
            />
            <ReportMetric
              label="Проценты"
              value={<UsdAmount amount={monthSummary.interest} exact tone="danger" />}
              tone="danger"
            />
            <ReportMetric
              label="Платежи"
              value={<UsdAmount amount={monthSummary.payments} exact tone="positive" />}
              tone="positive"
            />
            <ReportMetric
              label="Комиссии"
              value={<UsdAmount amount={monthSummary.fees} exact tone="danger" />}
              tone="danger"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Долг по месяцам</p>
          <p className="mt-1 text-xs text-zinc-500">
            От сегодня и до {MAX_MONTHLY_DEBT_HISTORY} месяцев назад
          </p>
        </div>

        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          {monthlyDebt.map((entry) => {
            const selected = entry.id === activeMonthId;

            return (
              <button
                key={entry.id}
                type="button"
                onClick={() => setSelectedMonthId(entry.id)}
                className={`flex w-full items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3.5 text-left last:border-b-0 ${
                  selected ? "bg-zinc-50" : "bg-white"
                }`}
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-zinc-900">{entry.label}</p>
                  {entry.subtitle ? (
                    <p className="mt-0.5 text-xs text-zinc-500">{entry.subtitle}</p>
                  ) : null}
                </div>
                <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
                  <UsdAmount amount={entry.debt} exact />
                </p>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}
