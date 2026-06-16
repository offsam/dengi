import { AutoVehicleVisual } from "@/app/components/auto-vehicle-visual";
import { UsdAmount } from "@/app/components/usd-amount";
import { formatMileage } from "@/lib/format-money";
import { buildVehicleDisplayHeading } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

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

export function AutoVehicleCard({ vehicle }: { vehicle: AutoVehicle }) {
  const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);

  return (
    <article className="w-[156px] shrink-0">
      <div className="relative z-[2] text-right leading-tight">
        <p className="text-[13px] font-semibold text-zinc-900">{heading.primary}</p>
        {heading.secondary ? (
          <p className="text-[12px] text-zinc-600">{heading.secondary}</p>
        ) : null}
      </div>

      <AutoVehicleVisual
        variant="shelf"
        catalogId={vehicle.catalogId}
        bodyIconId={vehicle.bodyIconId}
        year={vehicle.year}
        bodyColorHex={vehicle.bodyColorHex}
        wheelColorHex={vehicle.wheelColorHex}
      />

      <p className="-mt-0.5 text-center text-[11px] tabular-nums text-zinc-600">
        {formatMileage(vehicle.mileage)}
      </p>

      <div className="mt-2 space-y-1">
        <InfoRow label="Остаток" value={<UsdAmount amount={vehicle.remaining} exact />} />
        <InfoRow
          label="Платёж по кредиту"
          value={<UsdAmount amount={vehicle.loanPayment} exact />}
        />
        <InfoRow
          label="Проценты по кредиту"
          value={<UsdAmount amount={vehicle.loanInterest} exact tone="danger" />}
          tone="danger"
        />
      </div>
    </article>
  );
}
