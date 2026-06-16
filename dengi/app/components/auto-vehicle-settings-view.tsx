"use client";

import Link from "next/link";
import { AutoVehicleArchiveView } from "@/app/components/auto-vehicle-archive-view";
import { isArchivedAutoVehicle } from "@/lib/auto-vehicles/status";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useClientMounted } from "@/app/hooks/use-client-mounted";
import {
  AutoVehicleDetailTabs,
  type AutoVehicleDetailTab,
} from "@/app/components/auto-vehicle-detail-tabs";
import { AutoVehicleDetailHero } from "@/app/components/auto-vehicle-detail-hero";
import { AutoVehicleExpensesPanel } from "@/app/components/auto-vehicle-expenses-panel";
import { AutoVehiclePaymentsPanel } from "@/app/components/auto-vehicle-payments-panel";
import { AutoVehicleDeleteDialog } from "@/app/components/auto-vehicle-delete-dialog";
import { AutoVehicleSettingsPanel } from "@/app/components/auto-vehicle-settings-panel";
import { AutoVehicleStatsPanel } from "@/app/components/auto-vehicle-stats-panel";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { buildVehicleDisplayHeading } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

function AutoVehicleDetailContent({ vehicle }: { vehicle: AutoVehicle }) {
  const router = useRouter();
  const { updateVehicle, disposeVehicle } = useAutoVehicles();
  const [tab, setTab] = useState<AutoVehicleDetailTab>("stats");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <main
        className={`mx-auto flex w-full max-w-md flex-col px-4 py-6 ${
          tab === "payments" ? "h-dvh min-h-0 gap-3 overflow-hidden" : "gap-5"
        }`}
      >
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Назад
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

        <AutoVehicleDetailHero vehicle={vehicle} compact={tab === "payments"} />

        <AutoVehicleDetailTabs active={tab} onChange={setTab} />

        {tab === "stats" ? <AutoVehicleStatsPanel vehicle={vehicle} /> : null}

        {tab === "payments" ? (
          <AutoVehiclePaymentsPanel vehicleId={vehicle.id} expanded />
        ) : null}

        {tab === "expenses" ? <AutoVehicleExpensesPanel vehicleId={vehicle.id} /> : null}

        {tab === "settings" ? (
          <div className="space-y-3">
            <AutoVehicleSettingsPanel
              vehicle={vehicle}
              onSave={(next) => {
                updateVehicle(next.id, next);
              }}
              onDelete={() => setDeleteDialogOpen(true)}
            />
            <AutoVehicleDeleteDialog
              open={deleteDialogOpen}
              vehicle={vehicle}
              onClose={() => setDeleteDialogOpen(false)}
              onConfirm={(mode, sold) => {
                disposeVehicle(vehicle.id, mode, sold);
                setDeleteDialogOpen(false);
                router.push(mode === "sold" ? "/auto/archive" : "/");
              }}
            />
          </div>
        ) : null}
      </main>
    </div>
  );
}

export function AutoVehicleSettingsView({ vehicleId }: { vehicleId: string }) {
  const mounted = useClientMounted();
  const { getVehicle } = useAutoVehicles();
  const vehicle = getVehicle(vehicleId);

  if (!mounted) {
    return (
      <div className="min-h-full bg-zinc-50">
        <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
          <div className="h-5 w-14 animate-pulse rounded bg-zinc-200" />
          <div className="h-40 animate-pulse rounded-2xl bg-zinc-200/80" />
          <div className="h-10 animate-pulse rounded-2xl bg-zinc-200/80" />
        </main>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          На главную
        </Link>
        <p className="text-sm text-zinc-600">Автомобиль не найден.</p>
      </div>
    );
  }

  if (isArchivedAutoVehicle(vehicle)) {
    return <AutoVehicleArchiveView vehicle={vehicle} />;
  }

  return <AutoVehicleDetailContent key={vehicle.id} vehicle={vehicle} />;
}
