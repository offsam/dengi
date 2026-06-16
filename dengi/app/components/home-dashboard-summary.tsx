"use client";

import { useMemo } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { formatMoney, formatMoneyExact } from "@/lib/format-money";
import { computeDashboardMetrics } from "@/lib/dashboard/compute-metrics";
import { isActiveAutoVehicle } from "@/lib/auto-vehicles/status";
import {
  DASHBOARD_DEBIT_CASH,
  DASHBOARD_HOUSING_BILLS,
} from "@/lib/dashboard/seed";

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger" | "positive";
}) {
  const valueTone =
    tone === "danger"
      ? "text-rose-600"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-zinc-900";

  return (
    <BubbleCard className="px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${valueTone}`}>{value}</p>
    </BubbleCard>
  );
}

export function HomeDashboardSummary() {
  const { cards } = useCreditCards();
  const { vehicles } = useAutoVehicles();

  const billsDueSoon = useMemo(
    () => DASHBOARD_HOUSING_BILLS.reduce((sum, bill) => sum + bill.amount, 0),
    []
  );

  const metrics = useMemo(
    () =>
      computeDashboardMetrics({
        cards,
        vehicles: vehicles.filter(isActiveAutoVehicle),
        debitAccounts: DASHBOARD_DEBIT_CASH,
        billsDueSoon,
      }),
    [cards, vehicles, billsDueSoon]
  );

  return (
    <>
      <header className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">dengi</h1>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Чистый капитал
          </p>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900">
            {formatMoney(metrics.netWorth)}
          </p>
        </div>
      </header>

      <section aria-label="Сводные показатели" className="grid grid-cols-2 gap-3">
        <MetricCard
          label="Общий долг"
          value={formatMoney(metrics.totalDebt)}
          tone="danger"
        />
        <MetricCard
          label="Проценты за месяц"
          value={formatMoneyExact(metrics.interestThisMonth)}
          tone="danger"
        />
        <MetricCard
          label="Активы"
          value={formatMoney(metrics.assets)}
          tone="positive"
        />
        <MetricCard
          label="Счета скоро"
          value={formatMoneyExact(metrics.billsDueSoon)}
        />
      </section>
    </>
  );
}
