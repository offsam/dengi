"use client";

import { useMemo } from "react";
import { UsdAmount } from "@/app/components/usd-amount";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { computeAutoVehicleLoanStats } from "@/lib/auto-vehicles/records/loan-stats";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

function StatPlaque({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "danger" | "positive";
}) {
  const valueClass =
    tone === "danger"
      ? "text-rose-600"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-zinc-900";

  return (
    <div className="flex h-full min-w-0 flex-col rounded-2xl border border-zinc-200/80 bg-white px-3.5 py-3.5 shadow-sm">
      <p className="min-h-[2.75rem] shrink-0 text-[14px] leading-snug text-zinc-500">{label}</p>
      <p
        className={`mt-auto pt-1.5 text-[18px] font-semibold leading-tight tabular-nums tracking-tight ${valueClass}`}
      >
        {value}
      </p>
    </div>
  );
}

function StatSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h2>
      {children}
    </section>
  );
}

function formatRatePercent(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "—";
  }

  return `${value.toFixed(1).replace(".", ",")}%`;
}

function formatCount(value: number) {
  return String(value);
}

export function AutoVehicleStatsPanel({ vehicle }: { vehicle: AutoVehicle }) {
  const { allVehicleRecords } = useAutoVehicleRecords(vehicle.id);

  const stats = useMemo(
    () => computeAutoVehicleLoanStats(vehicle, allVehicleRecords),
    [vehicle, allVehicleRecords]
  );

  return (
    <div className="space-y-5">
      <StatSection title="Общее">
        <div className="grid grid-cols-3 items-stretch gap-3">
          <StatPlaque label="Остаток долга" value={<UsdAmount amount={stats.remaining} exact />} />
          <StatPlaque
            label="Месячный платёж"
            value={<UsdAmount amount={stats.monthlyPayment} exact />}
          />
          <StatPlaque
            label="Процент по кредиту"
            value={formatRatePercent(stats.annualRatePercent)}
          />
        </div>
      </StatSection>

      <StatSection title="Выплаты">
        <div className="grid grid-cols-2 items-stretch gap-3">
          <StatPlaque
            label="Уже выплачено"
            value={<UsdAmount amount={stats.totalPaid} exact tone="positive" />}
            tone="positive"
          />
          <StatPlaque label="Сделано платежей" value={formatCount(stats.loanPaymentsCount)} />
        </div>
      </StatSection>

      <StatSection title="Проценты">
        <div className="grid grid-cols-3 items-stretch gap-3">
          <StatPlaque
            label="Выплачено процентов"
            value={<UsdAmount amount={stats.paidInterest} exact tone="danger" />}
            tone="danger"
          />
          <StatPlaque
            label="Примерно осталось"
            value={<UsdAmount amount={stats.remainingInterestApprox} exact tone="danger" />}
            tone="danger"
          />
          <StatPlaque
            label="В каждом платеже"
            value={<UsdAmount amount={stats.monthlyInterest} exact tone="danger" />}
            tone="danger"
          />
        </div>
      </StatSection>
    </div>
  );
}
