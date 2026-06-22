"use client";

import Link from "next/link";
import { BubbleCard } from "@/app/components/bubble-card";
import { UsdAmount } from "@/app/components/usd-amount";
import { useLocale } from "@/app/components/locale-provider";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { formatAppDateNumeric } from "@/lib/i18n/locale";
import { buildVehicleDisplayHeading } from "@/lib/auto-vehicles";
import { APP_PAGE_CLASS } from "@/lib/app-theme";

export function AutoVehicleArchivePageView() {
  const { t } = useLocale();
  const { archivedVehicles } = useAutoVehicles();

  return (
    <div className={APP_PAGE_CLASS}>
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            {t("common.back")}
          </Link>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900">{t("auto.archive.title")}</h1>
          <span className="w-[42px]" aria-hidden />
        </header>

        <p className="px-1 text-sm leading-snug text-zinc-500">{t("auto.archive.description")}</p>

        {archivedVehicles.length === 0 ? (
          <BubbleCard className="border-dashed px-4 py-10 text-center text-sm text-zinc-500">
            {t("auto.archive.empty")}
          </BubbleCard>
        ) : (
          <ul className="space-y-2">
            {archivedVehicles.map((vehicle) => {
              const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);

              return (
                <li key={vehicle.id}>
                  <Link href={`/auto/${vehicle.id}`} className="block">
                    <BubbleCard className="flex items-center justify-between gap-3 px-4 py-3 transition-opacity hover:opacity-95">
                      <div className="min-w-0">
                        <p className="truncate text-sm font-semibold text-zinc-900">
                          {heading.primary}
                        </p>
                        {heading.secondary ? (
                          <p className="truncate text-xs text-zinc-500">{heading.secondary}</p>
                        ) : null}
                      </div>
                      <div className="shrink-0 text-right">
                        {vehicle.soldAt ? (
                          <p className="text-[11px] tabular-nums text-zinc-500">
                            {formatAppDateNumeric(vehicle.soldAt)}
                          </p>
                        ) : null}
                        {(vehicle.soldPrice ?? 0) > 0 ? (
                          <p className="text-sm font-semibold tabular-nums text-zinc-900">
                            <UsdAmount amount={vehicle.soldPrice ?? 0} />
                          </p>
                        ) : null}
                      </div>
                    </BubbleCard>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </main>
    </div>
  );
}
