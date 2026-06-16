"use client";

import { useMemo } from "react";
import { UsdAmount } from "@/app/components/usd-amount";
import { AutoVehicleDetailBubbleCard } from "@/app/components/auto-vehicle-detail-bubble-card";
import { AutoVehicleLoanPaidProgress } from "@/app/components/auto-vehicle-loan-paid-progress";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { computeAutoVehicleLoanStats } from "@/lib/auto-vehicles/records/loan-stats";
import { computeAutoVehicleExpensePeriodTotals } from "@/lib/auto-vehicles/records/expense-stats";
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
import { formatAppDateNumeric } from "@/lib/i18n/locale";
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

function formatPaymentDayLabel(day: number) {
  return `${day}-го числа`;
}

function formatPaymentsWord(count: number) {
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

function formatPaymentsCountLine(count: number) {
  return `${count} ${formatPaymentsWord(count)}`;
}

function StatCellColumn({
  label,
  value,
  meta,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  meta?: React.ReactNode;
  tone?: StatTone;
}) {
  const valueClassName = amountClassForTone(tone);

  return (
    <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-2 text-center">
      <p className="text-[10px] leading-tight text-zinc-500">{label}</p>
      {typeof value === "string" || typeof value === "number" ? (
        <p className={valueClassName}>{value}</p>
      ) : (
        value
      )}
      {meta ? <p className="text-[10px] font-medium leading-tight text-zinc-500">{meta}</p> : null}
    </div>
  );
}

function StatPlaque({
  label,
  value,
  subValue,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  subValue?: React.ReactNode;
  tone?: StatTone;
}) {
  return (
    <AutoVehicleDetailBubbleCard>
      <StatCellColumn label={label} value={value} meta={subValue} tone={tone} />
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
  return (
    <AutoVehicleDetailBubbleCard>
      <div className="grid grid-cols-3 gap-0.5">
        <StatCellColumn
          label="Остаток долга"
          value={
            <UsdAmount amount={remaining} exact className={AUTO_VEHICLE_STAT_AMOUNT_DANGER} />
          }
          meta={formatPaymentsCountLine(paymentsRemaining)}
          tone="danger"
        />
        <StatCellColumn
          label="Осталось"
          value={paymentsRemaining}
          meta={formatPaymentsWord(paymentsRemaining)}
          tone="danger"
        />
        <StatCellColumn
          label="Выплачено"
          value={
            <UsdAmount amount={totalPaid} exact className={AUTO_VEHICLE_STAT_AMOUNT_POSITIVE} />
          }
          meta={formatPaymentsCountLine(paymentsDone)}
          tone="positive"
        />
      </div>

      {loanEndDate || nextPaymentSubline ? (
        <div className="flex items-baseline justify-between gap-2 border-t border-white/55 px-2 py-2">
          <p className="shrink-0 text-[10px] font-medium leading-tight text-zinc-400">
            {loanEndDate ? `Конец кредита ${formatAppDateNumeric(loanEndDate)}` : ""}
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

function formatCurrentMonthLabel() {
  return new Intl.DateTimeFormat("ru-RU", { month: "long", year: "numeric" }).format(new Date());
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
  const { allVehicleRecords } = useAutoVehicleRecords(vehicle.id);

  const stats = useMemo(
    () => computeAutoVehicleLoanStats(vehicle, allVehicleRecords),
    [vehicle, allVehicleRecords]
  );

  const expenseTotals = useMemo(
    () => computeAutoVehicleExpensePeriodTotals(allVehicleRecords),
    [allVehicleRecords]
  );

  const loanEndDate = useMemo(() => resolveLoanEndDate(vehicle), [vehicle]);

  const nextPaymentSubline = useMemo(() => {
    const nextDate = resolveNextLoanPaymentDate(vehicle, allVehicleRecords);

    if (!nextDate) {
      return undefined;
    }

    return formatNextPaymentSubline(nextDate);
  }, [vehicle, allVehicleRecords]);

  const showLoan =
    vehicle.financingType !== "cash" &&
    (stats.loanAmount > 0 || stats.monthlyPayment > 0 || stats.paymentsTotal > 0);

  return (
    <div className="space-y-5">
      <StatSection title="Общее">
        <div className="grid grid-cols-3 gap-1.5">
          <StatPlaque
            label="Сумма покупки"
            value={
              <UsdAmount amount={stats.purchasePrice} exact className={AUTO_VEHICLE_STAT_AMOUNT_NEUTRAL} />
            }
            subValue={formatAppDateNumeric(vehicle.purchaseDate)}
          />
          <StatPlaque
            label="Месячный платёж"
            value={
              showLoan ? (
                <UsdAmount amount={stats.monthlyPayment} exact className={AUTO_VEHICLE_STAT_AMOUNT_NEUTRAL} />
              ) : (
                "—"
              )
            }
            subValue={showLoan ? formatPaymentDayLabel(resolveLoanPaymentDay(vehicle)) : undefined}
          />
          <StatPlaque
            label="Ставка"
            value={showLoan ? formatRatePercent(stats.annualRatePercent) : "—"}
          />
        </div>
      </StatSection>

      {showLoan ? (
        <StatSection title="Сейчас" dense>
          <div className="-mt-5">
            <AutoVehicleLoanPaidProgress vehicle={vehicle} />
            <div className="mt-0">
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
        <StatSection title="Проценты">
          <div className="grid grid-cols-3 gap-1.5">
            <StatPlaque
              label="Осталось"
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
              label="Выплачено"
              value={
                <UsdAmount amount={stats.paidInterest} exact className={AUTO_VEHICLE_STAT_AMOUNT_DANGER} />
              }
              tone="danger"
            />
            <StatPlaque
              label="В этом месяце"
              value={
                <UsdAmount amount={stats.monthlyInterest} exact className={AUTO_VEHICLE_STAT_AMOUNT_DANGER} />
              }
              tone="danger"
            />
          </div>
        </StatSection>
      ) : null}

      <StatSection title="Расходы">
        <div className="grid grid-cols-2 gap-1.5">
          <StatPlaque
            label="Месяц"
            value={
              <UsdAmount
                amount={expenseTotals.thisMonth}
                exact
                className={AUTO_VEHICLE_STAT_AMOUNT_NEUTRAL}
              />
            }
            subValue={formatCurrentMonthLabel()}
          />
          <StatPlaque
            label="Год"
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
