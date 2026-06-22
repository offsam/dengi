"use client";

import Link from "next/link";
import { useMemo } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { useLocale } from "@/app/components/locale-provider";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { useDebitCashAccounts } from "@/app/hooks/use-debit-cash-accounts";
import { useHousingBills } from "@/app/hooks/use-housing-bills";
import { formatMoney, formatMoneyExact } from "@/lib/format-money";
import { computeDashboardMetrics } from "@/lib/dashboard/compute-metrics";
import {
  dashboardMetricHref,
  getDashboardMetricTitle,
  type DashboardMetricId,
} from "@/lib/dashboard/metric-breakdown";
import { isActiveAutoVehicle } from "@/lib/auto-vehicles/status";

function MetricCard({
  label,
  value,
  tone = "neutral",
  metricId,
  openBreakdownLabel,
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger" | "positive";
  metricId: DashboardMetricId;
  openBreakdownLabel: string;
}) {
  const valueTone =
    tone === "danger"
      ? "text-rose-600"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-zinc-900";

  return (
    <Link
      href={dashboardMetricHref(metricId)}
      className="block text-left transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      aria-label={`${label}: ${value}. ${openBreakdownLabel}`}
    >
      <BubbleCard className="px-3 py-3">
        <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">{label}</p>
        <p className={`mt-1 text-lg font-semibold tabular-nums ${valueTone}`}>{value}</p>
      </BubbleCard>
    </Link>
  );
}

export function HomeDashboardSummary() {
  const { lang, t } = useLocale();
  const { cards } = useCreditCards();
  const { vehicles } = useAutoVehicles();
  const { accounts: debitAccounts } = useDebitCashAccounts();
  const { bills } = useHousingBills();

  const activeVehicles = useMemo(
    () => vehicles.filter(isActiveAutoVehicle),
    [vehicles]
  );

  const billsDueSoon = useMemo(
    () => bills.reduce((sum, bill) => sum + bill.amount, 0),
    [bills]
  );

  const metrics = useMemo(
    () =>
      computeDashboardMetrics({
        cards,
        vehicles: activeVehicles,
        debitAccounts,
        billsDueSoon,
      }),
    [cards, activeVehicles, debitAccounts, billsDueSoon]
  );

  const openBreakdownLabel = t("common.openBreakdown");

  return (
    <>
      <header className="flex items-end justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">dengi</h1>
        <div className="text-right">
          <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            {t("home.netWorth")}
          </p>
          <p className="text-2xl font-semibold tabular-nums text-zinc-900">
            {formatMoney(metrics.netWorth)}
          </p>
        </div>
      </header>

      <section aria-label={t("home.metricsAria")} className="grid grid-cols-2 gap-3">
        <MetricCard
          label={getDashboardMetricTitle("totalDebt", lang)}
          value={formatMoney(metrics.totalDebt)}
          tone="danger"
          metricId="totalDebt"
          openBreakdownLabel={openBreakdownLabel}
        />
        <MetricCard
          label={getDashboardMetricTitle("interestThisMonth", lang)}
          value={formatMoneyExact(metrics.interestThisMonth)}
          tone="danger"
          metricId="interestThisMonth"
          openBreakdownLabel={openBreakdownLabel}
        />
        <MetricCard
          label={getDashboardMetricTitle("assets", lang)}
          value={formatMoney(metrics.assets)}
          tone="positive"
          metricId="assets"
          openBreakdownLabel={openBreakdownLabel}
        />
        <MetricCard
          label={getDashboardMetricTitle("billsDueSoon", lang)}
          value={formatMoneyExact(metrics.billsDueSoon)}
          metricId="billsDueSoon"
          openBreakdownLabel={openBreakdownLabel}
        />
      </section>
    </>
  );
}
