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
import {
  CREDIT_STATS_CONTENT_OFFSET_TOP_PX,
  resolvePaymentsContentOffsetTop,
  shouldShowCreditVehicleStats,
} from "@/lib/auto-vehicles/credit-stats-layout";
import { APP_BUBBLE_SHELL, APP_PAGE_CLASS } from "@/lib/app-theme";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

function AutoVehicleDetailContent({ vehicle }: { vehicle: AutoVehicle }) {
  const router = useRouter();
  const { updateVehicle, disposeVehicle } = useAutoVehicles();
  const [tab, setTab] = useState<AutoVehicleDetailTab>("stats");
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [paymentsHeroCompress, setPaymentsHeroCompress] = useState(0);

  const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);
  const creditStatsLayout = shouldShowCreditVehicleStats(vehicle);

  function handleTabChange(next: AutoVehicleDetailTab) {
    if (next !== "payments") {
      setPaymentsHeroCompress(0);
    }
    setTab(next);
  }

  return (
    <div className={APP_PAGE_CLASS}>
      <main
        className={`mx-auto flex w-full max-w-md flex-col px-4 py-6 ${
          tab === "payments" ? "h-dvh min-h-0 gap-3 overflow-hidden" : "gap-5"
        }`}
      >
        <header className="flex shrink-0 items-start justify-between gap-3">
          <Link
            href="/"
            className="shrink-0 text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Назад
          </Link>
          <div className="min-w-0 max-w-[70%] text-right">
            <p className="truncate text-sm font-semibold tracking-tight text-zinc-900">
              {heading.primary}
            </p>
            {heading.secondary ? (
              <p className="truncate text-xs text-zinc-500">{heading.secondary}</p>
            ) : null}
          </div>
        </header>

        <div
          className={`relative ${tab === "payments" ? "flex min-h-0 flex-1 flex-col" : ""}`}
        >
          <AutoVehicleDetailHero
            vehicle={vehicle}
            large
            statsLayout={creditStatsLayout}
            heroCompress={
              tab === "payments" && creditStatsLayout ? paymentsHeroCompress : 0
            }
          />

          <div
            className={`relative z-[2] flex flex-col gap-5 ${
              tab === "payments" ? "min-h-0 flex-1" : ""
            }`}
            style={
              creditStatsLayout
                ? {
                    marginTop:
                      tab === "payments"
                        ? resolvePaymentsContentOffsetTop(paymentsHeroCompress)
                        : CREDIT_STATS_CONTENT_OFFSET_TOP_PX,
                  }
                : undefined
            }
          >
            <AutoVehicleDetailTabs active={tab} onChange={handleTabChange} />

            {tab === "stats" ? <AutoVehicleStatsPanel vehicle={vehicle} /> : null}

            {tab === "payments" ? (
              <AutoVehiclePaymentsPanel
                vehicleId={vehicle.id}
                expanded
                onHeroCompress={
                  creditStatsLayout ? setPaymentsHeroCompress : undefined
                }
              />
            ) : null}

            {tab === "expenses" ? (
              <AutoVehicleExpensesPanel vehicleId={vehicle.id} />
            ) : null}

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
          </div>
        </div>
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
      <div className={APP_PAGE_CLASS}>
        <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
          <div className="h-5 w-14 animate-pulse rounded bg-zinc-200/80" />
          <div className={`h-40 animate-pulse ${APP_BUBBLE_SHELL}`} />
          <div className={`h-10 animate-pulse ${APP_BUBBLE_SHELL}`} />
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
