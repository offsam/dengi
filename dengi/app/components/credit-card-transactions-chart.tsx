"use client";

import { useMemo, useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { DashboardMetricDonutChart } from "@/app/components/dashboard-metric-donut-chart";
import { useLocale } from "@/app/components/locale-provider";
import { useCreditCardTransactions } from "@/app/hooks/use-credit-card-transactions";
import { computeCreditCardTransactionChartSegments } from "@/lib/credit-cards/transactions/chart-segments";

function ChartExpandToggle({
  expanded,
  onChange,
}: {
  expanded: boolean;
  onChange: (next: boolean) => void;
}) {
  const { t } = useLocale();

  return (
    <button
      type="button"
      aria-expanded={expanded}
      aria-label={expanded ? t("credit.chart.collapseAria") : t("credit.chart.expandAria")}
      onClick={() => onChange(!expanded)}
      className="flex size-8 shrink-0 items-center justify-center rounded-full border border-white/70 bg-white/25 text-zinc-500 transition-colors hover:border-white/90 hover:bg-white/40 hover:text-zinc-800"
    >
      <svg
        viewBox="0 0 20 20"
        fill="none"
        className={`size-4 transition-transform duration-200 ${
          expanded ? "rotate-180" : ""
        }`}
        aria-hidden
      >
        <path
          d="m5 8 5 5 5-5"
          stroke="currentColor"
          strokeWidth="1.75"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </button>
  );
}

export function CreditCardTransactionsChart({ cardId }: { cardId: string }) {
  const { lang, t } = useLocale();
  const { transactions } = useCreditCardTransactions(cardId);
  const [expanded, setExpanded] = useState(false);

  const segments = useMemo(
    () => computeCreditCardTransactionChartSegments(transactions, lang),
    [transactions, lang]
  );

  if (transactions.length === 0) {
    return null;
  }

  return (
    <BubbleCard className="overflow-hidden py-0">
      <div className="flex items-start gap-3 px-3.5 py-3.5">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-sm font-semibold tracking-tight text-zinc-900">
            {t("credit.chart.title")}
          </p>
          {!expanded && segments.length > 0 ? (
            <div className="flex flex-wrap gap-1.5">
              {segments.map((segment) => (
                <span
                  key={segment.id}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/70 bg-white/25 px-2 py-0.5 text-[11px] text-zinc-600"
                >
                  <span
                    className="size-2 shrink-0 rounded-full"
                    style={{ backgroundColor: segment.color }}
                    aria-hidden
                  />
                  {segment.label}
                </span>
              ))}
            </div>
          ) : null}
        </div>

        <ChartExpandToggle expanded={expanded} onChange={setExpanded} />
      </div>

      {expanded ? (
        <div className="border-t border-white/35">
          <DashboardMetricDonutChart segments={segments} />
        </div>
      ) : null}
    </BubbleCard>
  );
}
