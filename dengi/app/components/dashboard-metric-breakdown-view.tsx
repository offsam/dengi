"use client";

import Link from "next/link";
import { notFound } from "next/navigation";
import { useMemo } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { DashboardMetricDonutChart } from "@/app/components/dashboard-metric-donut-chart";
import { useLocale } from "@/app/components/locale-provider";
import { UsdAmount } from "@/app/components/usd-amount";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { useDebitCashAccounts } from "@/app/hooks/use-debit-cash-accounts";
import { useHousingBills } from "@/app/hooks/use-housing-bills";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import { computeDashboardMetrics } from "@/lib/dashboard/compute-metrics";
import {
  DASHBOARD_METRIC_TONES,
  computeDashboardMetricBreakdowns,
  computeDashboardMetricChartSegments,
  getDashboardMetricTitle,
  parseDashboardMetricSlug,
  type DashboardMetricBreakdownLine,
  type DashboardMetricId,
} from "@/lib/dashboard/metric-breakdown";
import { isActiveAutoVehicle } from "@/lib/auto-vehicles/status";

function BreakdownRow({
  line,
  tone,
}: {
  line: DashboardMetricBreakdownLine;
  tone: "neutral" | "danger" | "positive";
}) {
  return (
    <div className="flex items-start justify-between gap-3 border-b border-zinc-900/[0.06] px-3.5 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{line.label}</p>
        {line.detail ? (
          <p className="mt-0.5 truncate text-xs text-zinc-500">{line.detail}</p>
        ) : null}
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums">
        <UsdAmount amount={line.amount} exact tone={tone} />
      </p>
    </div>
  );
}

export function DashboardMetricBreakdownView({ metricSlug }: { metricSlug: string }) {
  const metricId = parseDashboardMetricSlug(metricSlug);

  if (!metricId) {
    notFound();
  }

  return <DashboardMetricBreakdownContent metricId={metricId} />;
}

function DashboardMetricBreakdownContent({ metricId }: { metricId: DashboardMetricId }) {
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

  const breakdowns = useMemo(
    () =>
      computeDashboardMetricBreakdowns(
        {
          cards,
          vehicles: activeVehicles,
          debitAccounts,
          bills,
        },
        lang
      ),
    [cards, activeVehicles, debitAccounts, bills, lang]
  );

  const total = {
    totalDebt: metrics.totalDebt,
    interestThisMonth: metrics.interestThisMonth,
    assets: metrics.assets,
    billsDueSoon: metrics.billsDueSoon,
  }[metricId];

  const lines = breakdowns[metricId];
  const chartSegments = useMemo(
    () => computeDashboardMetricChartSegments(lines, total, lang),
    [lines, total, lang]
  );
  const tone = DASHBOARD_METRIC_TONES[metricId];
  const title = getDashboardMetricTitle(metricId, lang);

  return (
    <div className={APP_PAGE_CLASS}>
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            {t("common.back")}
          </Link>
          <h1 className="truncate text-sm font-semibold tracking-tight">{title}</h1>
          <span className="w-10" aria-hidden />
        </header>

        <BubbleCard className="px-3.5 py-3.5">
          <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
            {t("common.total")}
          </p>
          <p className="mt-1 text-2xl font-semibold tabular-nums">
            <UsdAmount amount={total} exact tone={tone} />
          </p>
        </BubbleCard>

        {lines.length > 0 ? (
          <BubbleCard className="overflow-hidden py-0">
            <DashboardMetricDonutChart segments={chartSegments} />
          </BubbleCard>
        ) : null}

        <section aria-label={`Состав: ${title}`}>
          <BubbleCard className="overflow-hidden py-0">
            {lines.length > 0 ? (
              lines.map((line) => <BreakdownRow key={line.id} line={line} tone={tone} />)
            ) : (
              <p className="px-3.5 py-8 text-center text-sm text-zinc-500">
                Пока нет данных для этой суммы.
              </p>
            )}
          </BubbleCard>
        </section>
      </main>
    </div>
  );
}
