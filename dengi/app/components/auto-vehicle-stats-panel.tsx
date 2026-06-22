"use client";

import { useMemo } from "react";
import { UsdAmount } from "@/app/components/usd-amount";
import { AutoVehicleDetailBubbleCard } from "@/app/components/auto-vehicle-detail-bubble-card";
import { AutoVehicleLoanPaidProgress } from "@/app/components/auto-vehicle-loan-paid-progress";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { computeAutoVehicleLoanStats } from "@/lib/auto-vehicles/records/loan-stats";
import { computeAutoVehicleExpensePeriodTotals } from "@/lib/auto-vehicles/records/expense-stats";
import {
  CREDIT_STATS_GENERAL_GRID_CLASS_NAME,
  CREDIT_STATS_GENERAL_AMOUNT_NEUTRAL,
  CREDIT_STATS_GENERAL_LABEL_CLASS_NAME,
  CREDIT_STATS_GENERAL_META_CLASS_NAME,
  CREDIT_STATS_LOAN_PLAQUE_GAP_PX,
  CREDIT_STATS_NOW_SECTION_OFFSET_PX,
  shouldShowCreditVehicleStats,
} from "@/lib/auto-vehicles/credit-stats-layout";
import {
  formatInsuranceProviderLabel,
  resolveAutoVehicleInsuranceSnapshot,
} from "@/lib/auto-vehicles/records/insurance-stats";
import {
  formatNextPaymentSubline,
  resolveNextLoanPaymentDate,
} from "@/lib/auto-vehicles/records/payment-timeline";
import { resolveLoanEndDate, resolveLoanPaymentDay } from "@/lib/auto-vehicles/loan";
import {
  AUTO_VEHICLE_STAT_AMOUNT_DANGER,
  AUTO_VEHICLE_STAT_AMOUNT_NEUTRAL,
  AUTO_VEHICLE_STAT_AMOUNT_POSITIVE,
} from "@/lib/auto-vehicles/detail-theme";
import { formatAppDateNumeric, resolveAppLocale } from "@/lib/i18n/locale";
import { useLocale } from "@/app/components/locale-provider";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

type StatTone = "neutral" | "danger" | "positive";

function amountClassForTone(tone: StatTone) {
  if (tone === "danger") {
    return AUTO_VEHICLE_STAT_AMOUNT_DANGER;
  }

  if (tone === "positive") {
    return AUTO_VEHICLE_STAT_AMOUNT_POSITIVE;
  }

  return AUTO_VEHICLE_STAT_AMOUNT_NEUTRAL;
}

function formatPaymentDayLabel(day: number, t: (k: string, p?: Record<string, string | number>) => string) {
  return t("auto.stats.paymentDay", { day });
}

function formatPaymentsWord(count: number, lang: "ru" | "en") {
  if (lang === "en") {
    return count === 1 ? "payment" : "payments";
  }

  const mod10 = count % 10;
  const mod100 = count % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return "платёж";
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return "платежа";
  }

  return "платежей";
}

function formatPaymentsCountLine(count: number, lang: "ru" | "en") {
  return `${count} ${formatPaymentsWord(count, lang)}`;
}

function StatCellColumn({
  label,
  value,
  meta,
  tone = "neutral",
  variant = "default",
}: {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  tone?: StatTone;
  variant?: "default" | "general";
}) {
  const valueClassName =
    variant === "general" && tone === "neutral"
      ? CREDIT_STATS_GENERAL_AMOUNT_NEUTRAL
      : amountClassForTone(tone);
  const labelClassName =
    variant === "general"
      ? CREDIT_STATS_GENERAL_LABEL_CLASS_NAME
      : "text-[10px] leading-tight text-zinc-500";
  const metaClassName =
    variant === "general"
      ? CREDIT_STATS_GENERAL_META_CLASS_NAME
      : "max-w-full truncate text-[10px] font-medium leading-tight text-zinc-500";

  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center">
      <p className={labelClassName}>{label}</p>
      {typeof value === "string" || typeof value === "number" ? (
        <p className={valueClassName}>{value}</p>
      ) : (
        value
      )}
      {meta ? <p className={metaClassName}>{meta}</p> : null}
    </div>
  );
}

function StatPlaque({
  label,
  value,
  subValue,
  tone = "neutral",
  variant = "default",
}: {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  tone?: StatTone;
  variant?: "default" | "general";
}) {
  return (
    <AutoVehicleDetailBubbleCard>
      <StatCellColumn
        label={label}
        value={value}
        meta={subValue}
        tone={tone}
        variant={variant}
      />
    </AutoVehicleDetailBubbleCard>
  );
}

function CurrentLoanPlaque({
  remaining,
  totalPaid,
  paymentsDone,
  paymentsRemaining,
  loanEndDate,
  nextPaymentSubline,
}: {
  remaining: number;
  totalPaid: number;
  paymentsDone: number;
  paymentsRemaining: number;
  loanEndDate?: string | null;
  nextPaymentSubline?: string;
}) {
  const { lang, t } = useLocale();

  return (
    <AutoVehicleDetailBubbleCard>
      <div className="grid grid-cols-3 gap-0.5">
        <StatCellColumn
          label={t("auto.stats.remainingDebt")}
          value={
            <UsdAmount amount={remaining} exact className={AUTO_VEHICLE_STAT_AMOUNT_DANGER} />
          }
          meta={formatPaymentsCountLine(paymentsRemaining, lang)}
          tone="danger"
        />
        <StatCellColumn
          label={t("auto.stats.remaining")}
          value={paymentsRemaining}
          meta={formatPaymentsWord(paymentsRemaining, lang)}
          tone="danger"
        />
        <StatCellColumn
          label={t("auto.stats.paid")}
          value={
            <UsdAmount amount={totalPaid} exact className={AUTO_VEHICLE_STAT_AMOUNT_POSITIVE} />
          }
          meta={formatPaymentsCountLine(paymentsDone, lang)}
          tone="positive"
        />
      </div>

      {loanEndDate || nextPaymentSubline ? (
        <div className="flex items-baseline justify-between gap-2 border-t border-white/55 px-2 py-2">
          <p className="shrink-0 text-[10px] font-medium leading-tight text-zinc-400">
            {loanEndDate ? t("auto.stats.loanEndDate", { date: formatAppDateNumeric(loanEndDate) }) : ""}
          </p>
          <p className="min-w-0 truncate text-right text-[13px] font-semibold leading-tight text-zinc-700">
            {nextPaymentSubline ?? ""}
          </p>
        </div>
      ) : null}
    </AutoVehicleDetailBubbleCard>
  );
}

function StatSection({
  title,
  children,
  dense = false,
}: {
  title: string;
  children: React.ReactNode;
  dense?: boolean;
}) {
  return (
    <section className={dense ? "space-y-0.5" : "space-y-2"}>
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function formatCurrentMonthLabel(lang: string) {
  return new Intl.DateTimeFormat(resolveAppLocale(lang as "ru" | "en"), { month: "long", year: "numeric" }).format(new Date());
}

function formatCurrentYearLabel() {
  return String(new Date().getFullYear());
}

function formatRatePercent(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  return `${value.toFixed(1).replace(".", ",")}%`;
}

export function AutoVehicleStatsPanel({ vehicle }: { vehicle: AutoVehicle }) {
  const { lang, t } = useLocale();
  const { allVehicleRecords } = useAutoVehicleRecords(vehicle.id);

  const stats = useMemo(
    () => computeAutoVehicleLoanStats(vehicle, allVehicleRecords),
    [vehicle, allVehicleRecords]
  );

  const expenseTotals = useMemo(
    () => computeAutoVehicleExpensePeriodTotals(vehicle, allVehicleRecords),
    [vehicle, allVehicleRecords]
  );

  const loanEndDate = useMemo(() => resolveLoanEndDate(vehicle), [vehicle]);

  const nextPaymentSubline = useMemo(() => {
    const nextDate = resolveNextLoanPaymentDate(vehicle, allVehicleRecords);

    if (!nextDate) {
      return undefined;
    }

    return formatNextPaymentSubline(nextDate, lang);
  }, [vehicle, allVehicleRecords, lang]);

  const showLoan = shouldShowCreditVehicleStats(vehicle);

  const insuranceSnapshot = useMemo(
    () => resolveAutoVehicleInsuranceSnapshot(vehicle, allVehicleRecords),
    [vehicle, allVehicleRecords]
  );

  const insuranceProviderLabel = insuranceSnapshot
    ? formatInsuranceProviderLabel(insuranceSnapshot.providerName)
    : undefined;

  return (
    <div className="space-y-5">
      <StatSection title={t("auto.stats.sectionGeneral")}>
        <div className={CREDIT_STATS_GENERAL_GRID_CLASS_NAME}>
          <StatPlaque
            variant="general"
            label={t("auto.stats.purchasePrice")}
            value={
              <UsdAmount
                amount={stats.purchasePrice}
                exact
                className={CREDIT_STATS_GENERAL_AMOUNT_NEUTRAL}
              />
            }
            subValue={formatAppDateNumeric(vehicle.purchaseDate)}
          />
          <StatPlaque
            variant="general"
            label={t("auto.stats.monthlyPayment")}
            value={
              showLoan ? (
                <UsdAmount
                  amount={stats.monthlyPayment}
                  exact
                  className={CREDIT_STATS_GENERAL_AMOUNT_NEUTRAL}
                />
              ) : (
                "—"
              )
            }
            subValue={showLoan ? formatPaymentDayLabel(resolveLoanPaymentDay(vehicle), t) : undefined}
          />
          <StatPlaque
            variant="general"
            label={t("auto.stats.rate")}
            value={showLoan ? formatRatePercent(stats.annualRatePercent) : "—"}
          />
          <StatPlaque
            variant="general"
            label={t("auto.stats.insurance")}
            value={
              insuranceSnapshot ? (
                <UsdAmount
                  amount={insuranceSnapshot.monthlyPayment}
                  exact
                  className={CREDIT_STATS_GENERAL_AMOUNT_NEUTRAL}
                />
              ) : (
                "—"
              )
            }
            subValue={insuranceProviderLabel}
          />
        </div>
      </StatSection>

      {showLoan ? (
        <StatSection title={t("auto.stats.sectionCurrent")} dense>
          <div style={{ marginTop: CREDIT_STATS_NOW_SECTION_OFFSET_PX }}>
            <AutoVehicleLoanPaidProgress vehicle={vehicle} />
            <div style={{ marginTop: CREDIT_STATS_LOAN_PLAQUE_GAP_PX }}>
              <CurrentLoanPlaque
              remaining={stats.remaining}
              totalPaid={stats.totalPaid}
              paymentsDone={stats.loanPaymentsCount}
              paymentsRemaining={stats.paymentsRemaining}
              loanEndDate={loanEndDate}
              nextPaymentSubline={nextPaymentSubline}
              />
            </div>
          </div>
        </StatSection>
      ) : null}

      {showLoan ? (
        <StatSection title={t("auto.stats.sectionInterest")}>
          <div className="grid grid-cols-3 gap-1.5">
            <StatPlaque
              label={t("auto.stats.remaining")}
              value={
                <UsdAmount
                  amount={stats.remainingInterestApprox}
                  exact
                  className={AUTO_VEHICLE_STAT_AMOUNT_DANGER}
                />
              }
              tone="danger"
            />
            <StatPlaque
              label={t("auto.stats.paid")}
              value={
                <UsdAmount amount={stats.paidInterest} exact className={AUTO_VEHICLE_STAT_AMOUNT_DANGER} />
              }
              tone="danger"
            />
            <StatPlaque
              label={t("auto.stats.thisMonth")}
              value={
                <UsdAmount amount={stats.monthlyInterest} exact className={AUTO_VEHICLE_STAT_AMOUNT_DANGER} />
              }
              tone="danger"
            />
          </div>
        </StatSection>
      ) : null}

      <StatSection title={t("auto.stats.sectionExpenses")}>
        <div className="grid grid-cols-2 gap-1.5">
          <StatPlaque
            label={t("auto.stats.expenseMonth")}
            value={
              <UsdAmount
                amount={expenseTotals.thisMonth}
                exact
                className={AUTO_VEHICLE_STAT_AMOUNT_NEUTRAL}
              />
            }
            subValue={formatCurrentMonthLabel(lang)}
          />
          <StatPlaque
            label={t("auto.stats.expenseYear")}
            value={
              <UsdAmount
                amount={expenseTotals.thisYear}
                exact
                className={AUTO_VEHICLE_STAT_AMOUNT_NEUTRAL}
              />
            }
            subValue={formatCurrentYearLabel()}
          />
        </div>
      </StatSection>
    </div>
  );
}
