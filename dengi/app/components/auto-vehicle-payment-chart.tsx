"use client";

import { useMemo } from "react";
import { useLocale } from "@/app/components/locale-provider";
import type { PaymentYearRow } from "@/lib/auto-vehicles/records/payment-timeline";
import { PAYMENT_AMOUNT_TEXT_COLOR } from "@/lib/auto-vehicles/payment-status-colors";

/** +10% к прежним size-3 / size-4 / size-6 */
const CHART_DOT_SIZE_PX = {
  empty: 13,
  regular: 18,
  current: 26,
} as const;

const MONTH_LABEL_FONT_PX = 8.75;

type MonthDotStatus = PaymentYearRow["months"][number]["status"];
type ChartDotTone = "paid" | "current" | "upcoming" | "empty";

const CHART_DOT_TONE: Record<
  ChartDotTone,
  { shellClassName: string; label?: string }
> = {
  paid: {
    shellClassName:
      "border-white/90 bg-[#5DAA8C] shadow-[0_4px_11px_-3px_rgba(72,150,115,0.58)]",
    label: PAYMENT_AMOUNT_TEXT_COLOR.paid,
  },
  current: {
    shellClassName:
      "border-white/95 bg-[#FFD060]/82 shadow-[0_5px_14px_-4px_rgba(210,170,45,0.44)] backdrop-blur-sm backdrop-saturate-150",
    label: PAYMENT_AMOUNT_TEXT_COLOR.current,
  },
  upcoming: {
    shellClassName:
      "border-white/90 bg-[#FFE898]/72 shadow-[0_3px_10px_-4px_rgba(200,165,55,0.26)] backdrop-blur-sm backdrop-saturate-150",
    label: PAYMENT_AMOUNT_TEXT_COLOR.upcoming,
  },
  empty: {
    shellClassName:
      "border-white/80 bg-white/30 shadow-[0_2px_6px_-4px_rgba(90,80,65,0.14)] backdrop-blur-sm",
  },
};

function useMonthLabels(lang: "ru" | "en") {
  return useMemo(() => {
    const formatter = new Intl.DateTimeFormat(lang === "en" ? "en-US" : "ru-RU", {
      month: "narrow",
    });

    return Array.from({ length: 12 }, (_, monthIndex) =>
      formatter.format(new Date(2024, monthIndex, 1))
    );
  }, [lang]);
}

/** Круглый пузырь в стиле приложения — стекло + лёгкий цветной тинт */
function ChartBubbleDot({
  sizePx,
  tone,
  softHighlight = false,
}: {
  sizePx: number;
  tone: ChartDotTone;
  softHighlight?: boolean;
}) {
  const { shellClassName } = CHART_DOT_TONE[tone];
  const vividGreen = tone === "paid";

  return (
    <span
      aria-hidden
      className={`relative isolate block shrink-0 overflow-hidden rounded-full ${shellClassName}`}
      style={{ width: sizePx, height: sizePx }}
    >
      <span
        className={`pointer-events-none absolute inset-x-[10%] top-[-32%] h-[74%] rounded-[50%] bg-gradient-to-b ${
          vividGreen
            ? "from-white/40 to-transparent"
            : softHighlight
              ? "from-white/55 to-transparent"
              : "from-white/80 to-transparent"
        }`}
        aria-hidden
      />
      {!vividGreen ? (
        <span
          className="pointer-events-none absolute inset-x-[24%] top-[-12%] h-[48%] rounded-[50%] bg-gradient-to-b from-white/60 to-transparent"
          aria-hidden
        />
      ) : null}
      {!vividGreen ? (
        <span
          className="pointer-events-none absolute top-[10%] left-[14%] h-[20%] w-[28%] -rotate-[16deg] rounded-full bg-white/55 blur-[0.2px]"
          aria-hidden
        />
      ) : (
        <span
          className="pointer-events-none absolute top-[12%] left-[18%] h-[18%] w-[24%] -rotate-[16deg] rounded-full bg-white/35"
          aria-hidden
        />
      )}
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[22%] bg-gradient-to-t from-black/[0.04] to-transparent"
        aria-hidden
      />
    </span>
  );
}

function MonthDot({ status }: { status: MonthDotStatus }) {
  if (status === "none") {
    return <ChartBubbleDot sizePx={CHART_DOT_SIZE_PX.empty} tone="empty" softHighlight />;
  }

  if (status === "paid") {
    return <ChartBubbleDot sizePx={CHART_DOT_SIZE_PX.regular} tone="paid" />;
  }

  if (status === "current") {
    return <ChartBubbleDot sizePx={CHART_DOT_SIZE_PX.current} tone="current" />;
  }

  return (
    <ChartBubbleDot sizePx={CHART_DOT_SIZE_PX.regular} tone="upcoming" softHighlight />
  );
}

function LegendDot({ status }: { status: Exclude<MonthDotStatus, "none"> }) {
  return (
    <ChartBubbleDot
      sizePx={status === "current" ? CHART_DOT_SIZE_PX.current : CHART_DOT_SIZE_PX.regular}
      tone={status}
      softHighlight={status === "upcoming"}
    />
  );
}

export function AutoVehiclePaymentChart({ rows }: { rows: PaymentYearRow[] }) {
  const { lang, t } = useLocale();
  const monthLabels = useMonthLabels(lang);

  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
        {t("auto.paymentChart.empty")}
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      <div className="flex items-end gap-1">
        <span className="w-8 shrink-0" aria-hidden />
        <div className="grid min-w-0 flex-1 grid-cols-12 gap-px">
          {monthLabels.map((label, monthIndex) => (
            <span
              key={label + monthIndex}
              className="text-center font-semibold leading-none text-zinc-500"
              style={{ fontSize: MONTH_LABEL_FONT_PX }}
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {rows.map((row) => (
        <section
          key={row.year}
          aria-label={t("auto.paymentChart.yearAria", { year: String(row.year) })}
          className="flex items-center gap-1"
        >
          <span className="w-8 shrink-0 text-right text-[11px] font-semibold tabular-nums leading-none text-zinc-600">
            {row.year}
          </span>
          <div className="grid min-w-0 flex-1 grid-cols-12 gap-px">
            {row.months.map((month) => (
              <div
                key={month.monthIndex}
                className="flex h-[30px] items-center justify-center"
              >
                <MonthDot status={month.status} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 pt-0.5 text-[10px] font-medium leading-none">
        <span className="inline-flex items-center gap-1.5">
          <LegendDot status="paid" />
          <span style={{ color: CHART_DOT_TONE.paid.label }}>{t("auto.paymentChart.legendPaid")}</span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LegendDot status="current" />
          <span style={{ color: CHART_DOT_TONE.current.label }}>
            {t("auto.paymentChart.legendCurrent")}
          </span>
        </span>
        <span className="inline-flex items-center gap-1.5">
          <LegendDot status="upcoming" />
          <span style={{ color: CHART_DOT_TONE.upcoming.label }}>
            {t("auto.paymentChart.legendUpcoming")}
          </span>
        </span>
      </div>
    </div>
  );
}
