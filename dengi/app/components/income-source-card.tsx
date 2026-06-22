"use client";

import { formatCompactCardName } from "@/lib/credit-cards/compact-name";
import { BubbleCard } from "@/app/components/bubble-card";
import { useLocale } from "@/app/components/locale-provider";
import { formatMoneyExact } from "@/lib/format-money";
import {
  getIncomeSourceKindLabel,
  type IncomeSource,
} from "@/lib/income-sources/types";

function KindBadge({
  label,
  accentColor,
  large = false,
}: {
  label: string;
  accentColor: string;
  large?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${accentColor} ${
        large ? "size-12 px-2 text-[11px] text-center leading-tight" : "size-9 px-1.5 text-[10px] text-center leading-tight"
      }`}
      aria-hidden
    >
      {label.slice(0, 2)}
    </div>
  );
}

export function IncomeSourceCard({
  kind,
  customKindLabel,
  name,
  monthlyAmount,
  accentColor,
  variant = "compact",
  density = "full",
}: Pick<
  IncomeSource,
  "kind" | "customKindLabel" | "name" | "monthlyAmount" | "accentColor"
> & {
  variant?: "compact" | "detail";
  density?: "full" | "minimal";
}) {
  const { lang, t } = useLocale();
  const isDetail = variant === "detail";
  const kindLabel = getIncomeSourceKindLabel({ kind, customKindLabel }, lang);

  if (density === "minimal" && !isDetail) {
    const label = formatCompactCardName(name);

    return (
      <BubbleCard className="w-[115px] shrink-0 p-2">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <KindBadge label={kindLabel} accentColor={accentColor} />
          <p
            className="w-full truncate text-[10.5px] font-semibold leading-tight text-zinc-900"
            title={name}
          >
            {label}
          </p>
        </div>
      </BubbleCard>
    );
  }

  return (
    <BubbleCard className={isDetail ? "w-full p-4" : "w-44 shrink-0 p-3"}>
      <div className="flex items-start gap-2.5">
        <KindBadge label={kindLabel} accentColor={accentColor} large={isDetail} />
        <div className="min-w-0">
          <p className={`truncate font-medium text-zinc-500 ${isDetail ? "text-sm" : "text-xs"}`}>
            {kindLabel}
          </p>
          <p className={`truncate font-semibold text-zinc-900 ${isDetail ? "text-lg" : "text-sm"}`}>
            {name}
          </p>
        </div>
      </div>
      <p
        className={`font-semibold tabular-nums text-emerald-600 ${
          isDetail ? "mt-5 text-3xl" : "mt-4 text-lg"
        }`}
      >
        {formatMoneyExact(monthlyAmount)}
      </p>
      <p className={`text-zinc-500 ${isDetail ? "mt-1 text-sm" : "mt-0.5 text-xs"}`}>
        {t("common.perMonth")}
      </p>
    </BubbleCard>
  );
}

export function IncomeSourceOverviewPanel({ source }: { source: IncomeSource }) {
  const { lang, t } = useLocale();
  const kindLabel = getIncomeSourceKindLabel(source, lang);
  const yearly = source.monthlyAmount * 12;

  return (
    <BubbleCard className="space-y-3 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">{t("incomeCard.overviewTitle")}</h2>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-zinc-500">{t("incomeCard.type")}</span>
        <p className="text-sm font-semibold text-zinc-900">{kindLabel}</p>
      </div>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-zinc-500">{t("common.perMonth")}</span>
        <p className="text-sm font-semibold tabular-nums text-emerald-600">
          {formatMoneyExact(source.monthlyAmount)}
        </p>
      </div>
      <div className="flex items-start justify-between gap-3">
        <span className="text-sm text-zinc-500">{t("common.perYear")}</span>
        <p className="text-sm font-semibold tabular-nums text-zinc-900">
          {formatMoneyExact(yearly)}
        </p>
      </div>
      <p className="border-t border-white/35 pt-3 text-xs leading-relaxed text-zinc-500">
        {t("incomeCard.overviewNote")}
      </p>
    </BubbleCard>
  );
}
