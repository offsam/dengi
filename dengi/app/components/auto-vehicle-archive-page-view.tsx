"use client";

import Link from "next/link";
import { UsdAmount } from "@/app/components/usd-amount";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { formatAppDateNumeric } from "@/lib/i18n/locale";
import { buildVehicleDisplayHeading } from "@/lib/auto-vehicles";

export function AutoVehicleArchivePageView() {
  const { archivedVehicles } = useAutoVehicles();

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Назад
          </Link>
          <h1 className="text-sm font-semibold tracking-tight text-zinc-900">Архив авто</h1>
          <span className="w-[42px]" aria-hidden />
        </header>

        <p className="px-1 text-sm leading-snug text-zinc-500">
          Проданные автомобили. Платежи, расходы и условия покупки сохранены.
        </p>

        {archivedVehicles.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-10 text-center text-sm text-zinc-500">
            В архиве пока пусто.
          </p>
        ) : (
          <ul className="space-y-2">
            {archivedVehicles.map((vehicle) => {
              const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);

              return (
                <li key={vehicle.id}>
                  <Link
                    href={`/auto/${vehicle.id}`}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white px-4 py-3 shadow-sm ring-1 ring-zinc-200/60 transition-colors hover:bg-zinc-50"
                  >
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
