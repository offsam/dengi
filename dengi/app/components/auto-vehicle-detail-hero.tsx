import { AutoVehicleVisual } from "@/app/components/auto-vehicle-visual";
import { buildVehicleDisplayHeading } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

/** Машина без плашки — «парит» над фоном страницы */
export function AutoVehicleDetailHero({
  vehicle,
  compact = false,
  large = false,
  statsLayout = false,
}: {
  vehicle: AutoVehicle;
  compact?: boolean;
  large?: boolean;
  statsLayout?: boolean;
}) {
  const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);
  const variant = compact ? "compact" : large && statsLayout ? "heroStats" : large ? "hero" : "float";

  return (
    <div
      className={`relative flex justify-center ${
        compact
          ? "-mt-1 py-0"
          : large
            ? "-mx-4 w-[calc(100%+2rem)] pb-0 pt-0"
            : "py-1"
      }`}
      aria-label={
        heading.secondary ? `${heading.primary} ${heading.secondary}` : heading.primary
      }
    >
      <div
        className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full blur-md ${
          compact
            ? "h-1.5 w-14 bg-zinc-900/12"
            : large
              ? "h-3 w-28 bg-zinc-900/10"
              : "h-2 w-20 bg-zinc-900/12"
        }`}
        aria-hidden
      />
      <AutoVehicleVisual
        variant={variant}
        catalogId={vehicle.catalogId}
        bodyIconId={vehicle.bodyIconId}
        year={vehicle.year}
        bodyColorHex={vehicle.bodyColorHex}
        wheelColorHex={vehicle.wheelColorHex}
      />
    </div>
  );
}
