"use client";

import { useMemo } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { UsdAmount } from "@/app/components/usd-amount";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { computeAutoVehicleLifetimeSpendingTotals } from "@/lib/auto-vehicles/records/expense-stats";

function StatBox({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <BubbleCard className="px-3.5 py-3.5">
      <p className="text-[13px] leading-snug text-zinc-500">{label}</p>
      <p className="mt-1.5 text-[18px] font-semibold tabular-nums tracking-tight text-zinc-900">
        {value}
      </p>
    </BubbleCard>
  );
}

export function AutoVehicleArchiveTotals({ vehicleId }: { vehicleId: string }) {
  const { getVehicle } = useAutoVehicles();
  const vehicle = getVehicle(vehicleId);
  const { allVehicleRecords } = useAutoVehicleRecords(vehicleId);

  const totals = useMemo(() => {
    if (!vehicle) {
      return {
        paymentsTotal: 0,
        expensesTotal: 0,
        investedTotal: 0,
      };
    }

    return computeAutoVehicleLifetimeSpendingTotals(vehicle, allVehicleRecords);
  }, [vehicle, allVehicleRecords]);

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Итого за время владения
      </h2>
      <div className="grid grid-cols-2 gap-3">
        <StatBox label="Платежи" value={<UsdAmount amount={totals.paymentsTotal} exact />} />
        <StatBox label="Расходы" value={<UsdAmount amount={totals.expensesTotal} exact />} />
      </div>
      <StatBox
        label="Всего вложено"
        value={<UsdAmount amount={totals.investedTotal} exact />}
      />
    </section>
  );
}
