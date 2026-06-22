"use client";

import { formatCompactCardName } from "@/lib/credit-cards/compact-name";
import { BubbleCard } from "@/app/components/bubble-card";
import { useLocale } from "@/app/components/locale-provider";
import { UsdAmount } from "@/app/components/usd-amount";
import { formatMoneyExact } from "@/lib/format-money";
import { displayDueDate } from "@/lib/i18n/labels";
import { resolveAppLocale } from "@/lib/i18n/locale";
import type { HousingBill } from "@/lib/dashboard/housing-bills";

export function HousingBillCard({
  name,
  date,
  amount,
  variant = "compact",
  density = "full",
}: Pick<HousingBill, "name" | "date" | "amount"> & {
  variant?: "compact" | "detail";
  density?: "full" | "minimal";
}) {
  const { lang, t } = useLocale();
  const isDetail = variant === "detail";
  const displayDate = displayDueDate(date, lang);

  if (density === "minimal" && !isDetail) {
    const label = formatCompactCardName(name, lang);

    return (
      <BubbleCard className="w-[115px] shrink-0 p-2.5">
        <p
          className="truncate text-center text-[10.5px] font-semibold leading-tight text-zinc-900"
          title={name}
        >
          {label}
        </p>
      </BubbleCard>
    );
  }

  return (
    <BubbleCard className={isDetail ? "w-full p-4" : "w-44 shrink-0 p-3"}>
      <div className="min-w-0">
        <p className={`truncate font-semibold text-zinc-900 ${isDetail ? "text-lg" : "text-sm"}`}>
          {name}
        </p>
        <p className={`text-zinc-500 ${isDetail ? "mt-1 text-sm" : "mt-1 text-xs"}`}>
          {t("common.duePrefix")} {displayDate}
        </p>
      </div>
      <p
        className={`font-semibold tabular-nums text-zinc-900 ${
          isDetail ? "mt-5 text-3xl" : "mt-4 text-lg"
        }`}
      >
        {formatMoneyExact(amount)}
      </p>
    </BubbleCard>
  );
}

/** Черновой обзор счёта жилья */
export function HousingBillOverviewPanel({ bill }: { bill: HousingBill }) {
  const { lang, t } = useLocale();

  return (
    <div className="space-y-3">
      <BubbleCard className="space-y-3 p-4">
        <h2 className="text-sm font-semibold text-zinc-900">{t("housing.card.nextPayment")}</h2>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-zinc-500">{t("common.amount")}</span>
          <UsdAmount amount={bill.amount} exact className="text-lg font-semibold text-zinc-900" />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-zinc-500">{t("common.date")}</span>
          <span className="text-sm font-semibold text-zinc-900">{displayDueDate(bill.date, lang)}</span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-500">{t("housing.card.draftHint")}</p>
      </BubbleCard>

      <BubbleCard className="space-y-2 p-4">
        <h2 className="text-sm font-semibold text-zinc-900">{t("housing.card.perYear")}</h2>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-zinc-500">{t("housing.card.approximately")}</span>
          <UsdAmount amount={bill.amount * 12} exact className="text-sm font-semibold text-zinc-900" />
        </div>
      </BubbleCard>
    </div>
  );
}

/** Черновая история платежей */
export function HousingBillHistoryPanel({ bill }: { bill: HousingBill }) {
  const { lang, t } = useLocale();
  const dateFormatter = new Intl.DateTimeFormat(resolveAppLocale(lang), {
    month: "short",
    day: "numeric",
  });
  const placeholder = [
    {
      date: dateFormatter.format(new Date("2024-06-01T12:00:00")),
      amount: bill.amount,
      status: t("preset.paid"),
    },
    {
      date: dateFormatter.format(new Date("2024-05-01T12:00:00")),
      amount: bill.amount,
      status: t("preset.paid"),
    },
    {
      date: dateFormatter.format(new Date("2024-04-01T12:00:00")),
      amount: bill.amount - 12,
      status: t("preset.paid"),
    },
  ];

  return (
    <BubbleCard className="divide-y divide-zinc-100/80 p-1">
      <p className="px-3 py-2 text-xs text-zinc-500">
        {t("housing.card.draftHistory", { name: bill.name })}
      </p>
      {placeholder.map((entry) => (
        <div key={entry.date} className="flex items-center justify-between gap-3 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900">{entry.date}</p>
            <p className="text-xs text-emerald-600">{entry.status}</p>
          </div>
          <UsdAmount amount={entry.amount} exact className="text-sm font-semibold text-zinc-900" />
        </div>
      ))}
    </BubbleCard>
  );
}
