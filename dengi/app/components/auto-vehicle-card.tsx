"use client";

import { AutoVehicleVisual } from "@/app/components/auto-vehicle-visual";
import { UsdAmount } from "@/app/components/usd-amount";
import { useLocale } from "@/app/components/locale-provider";
import { formatMileage } from "@/lib/format-money";
import { buildVehicleCompactLabel, buildVehicleDisplayHeading } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

export type AutoVehicleTileDensity = "full" | "minimal";

function InfoRow({
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
    <div className="flex items-baseline justify-between gap-2">
      <span className="text-[10px] leading-tight text-zinc-500">{label}</span>
      <span className={`text-[11px] font-semibold tabular-nums ${valueClass}`}>{value}</span>
    </div>
  );
}

export function AutoVehicleCard({
  vehicle,
  density = "full",
}: {
  vehicle: AutoVehicle;
  density?: AutoVehicleTileDensity;
}) {
  const { lang, t } = useLocale();

  if (density === "minimal") {
    const label = buildVehicleCompactLabel(vehicle.catalogId, vehicle.year, lang);

    return (
      <article className="w-[115px] shrink-0">
        <AutoVehicleVisual
          variant="minimal"
          catalogId={vehicle.catalogId}
          bodyIconId={vehicle.bodyIconId}
          year={vehicle.year}
          bodyColorHex={vehicle.bodyColorHex}
          wheelColorHex={vehicle.wheelColorHex}
        />
        <p
          className="mt-1 truncate text-center text-[10.5px] font-semibold leading-tight text-zinc-900"
          title={label}
        >
          {label}
        </p>
      </article>
    );
  }

  const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);

  return (
    <article className="w-[156px] shrink-0 overflow-x-clip">
      <div className="relative z-[2] text-right leading-tight">
        <p className="text-[13px] font-semibold text-zinc-900">{heading.primary}</p>
        {heading.secondary ? (
          <p className="text-[12px] text-zinc-600">{heading.secondary}</p>
        ) : null}
      </div>

      <div className="mt-[45px]">
        <AutoVehicleVisual
          variant="shelf"
          catalogId={vehicle.catalogId}
          bodyIconId={vehicle.bodyIconId}
          year={vehicle.year}
          bodyColorHex={vehicle.bodyColorHex}
          wheelColorHex={vehicle.wheelColorHex}
        />

        <p className="-mt-1 text-center text-[11px] tabular-nums text-zinc-600">
          {formatMileage(vehicle.mileage)}
        </p>

        <div className="mt-1 space-y-1">
          <InfoRow label={t("auto.card.remaining")} value={<UsdAmount amount={vehicle.remaining} exact />} />
          <InfoRow
            label={t("auto.card.loanPayment")}
            value={<UsdAmount amount={vehicle.loanPayment} exact />}
          />
          <InfoRow
            label={t("auto.card.loanInterest")}
            value={<UsdAmount amount={vehicle.loanInterest} exact tone="danger" />}
            tone="danger"
          />
        </div>
      </div>
    </article>
  );
}
