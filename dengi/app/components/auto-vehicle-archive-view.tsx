"use client";

import Link from "next/link";
import { useState } from "react";
import { AutoVehicleArchiveTotals } from "@/app/components/auto-vehicle-archive-totals";
import { AutoVehicleDetailHero } from "@/app/components/auto-vehicle-detail-hero";
import { AutoVehicleExpensesPanel } from "@/app/components/auto-vehicle-expenses-panel";
import { AutoVehicleFormFields } from "@/app/components/auto-vehicle-form-fields";
import { AutoVehiclePaymentsPanel } from "@/app/components/auto-vehicle-payments-panel";
import { AutoVehicleSoldSummary } from "@/app/components/auto-vehicle-sold-summary";
import { AutoVehicleStatsPanel } from "@/app/components/auto-vehicle-stats-panel";
import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";
import { buildVehicleDisplayHeading } from "@/lib/auto-vehicles";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

type ArchiveTab = "stats" | "payments" | "expenses" | "info";

const ARCHIVE_TABS: { id: ArchiveTab; label: string }[] = [
  { id: "stats", label: "Статистика" },
  { id: "payments", label: "Платежи" },
  { id: "expenses", label: "Расходы" },
  { id: "info", label: "Информация" },
];

export function AutoVehicleArchiveView({ vehicle }: { vehicle: AutoVehicle }) {
  const [tab, setTab] = useState<ArchiveTab>("stats");
  const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);

  return (
    <div className={APP_PAGE_CLASS}>
      <main
        className={`mx-auto flex w-full max-w-md flex-col px-4 py-6 ${
          tab === "payments" ? "h-dvh min-h-0 gap-3 overflow-hidden" : "gap-5"
        }`}
      >
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/auto/archive"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Архив
          </Link>
          <div className="min-w-0 text-center">
            <p className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              {heading.primary}
            </p>
            {heading.secondary ? (
              <p className="truncate text-xs text-zinc-500">{heading.secondary}</p>
            ) : null}
          </div>
          <span className="w-[42px]" aria-hidden />
        </header>

        <p className="rounded-full bg-zinc-200/80 px-3 py-1 text-center text-[11px] font-semibold uppercase tracking-wide text-zinc-600">
          Продано
        </p>

        <AutoVehicleDetailHero vehicle={vehicle} compact={tab === "payments"} />

        <AutoVehicleSoldSummary vehicle={vehicle} />

        <BubbleSegmentedControl
          options={ARCHIVE_TABS}
          value={tab}
          onChange={setTab}
          ariaLabel="Разделы архива"
        />

        {tab === "stats" ? (
          <div className="space-y-5">
            <AutoVehicleArchiveTotals vehicleId={vehicle.id} />
            <AutoVehicleStatsPanel vehicle={vehicle} />
          </div>
        ) : null}

        {tab === "payments" ? (
          <AutoVehiclePaymentsPanel vehicleId={vehicle.id} readOnly expanded />
        ) : null}

        {tab === "expenses" ? (
          <AutoVehicleExpensesPanel vehicleId={vehicle.id} readOnly />
        ) : null}

        {tab === "info" ? (
          <AutoVehicleFormFields draft={vehicle} onPatch={() => {}} readOnly />
        ) : null}
      </main>
    </div>
  );
}
