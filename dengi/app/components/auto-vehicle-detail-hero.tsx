import { AutoVehicleVisual } from "@/app/components/auto-vehicle-visual";
import { buildVehicleDisplayHeading } from "@/lib/auto-vehicles";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

/** Машина без плашки — «парит» над фоном страницы */
export function AutoVehicleDetailHero({
  vehicle,
  compact = false,
}: {
  vehicle: AutoVehicle;
  compact?: boolean;
}) {
  const heading = buildVehicleDisplayHeading(vehicle.catalogId, vehicle.year);

  return (
    <div
      className={`relative flex justify-center ${compact ? "-mt-1 py-0" : "py-1"}`}
      aria-label={
        heading.secondary ? `${heading.primary} ${heading.secondary}` : heading.primary
      }
    >
      <div
        className={`pointer-events-none absolute bottom-0 left-1/2 -translate-x-1/2 rounded-full bg-zinc-900/12 blur-md ${
          compact ? "h-1.5 w-14" : "h-2 w-20"
        }`}
        aria-hidden
      />
      <AutoVehicleVisual
        variant={compact ? "compact" : "float"}
        catalogId={vehicle.catalogId}
        year={vehicle.year}
        bodyColorHex={vehicle.bodyColorHex}
        wheelColorHex={vehicle.wheelColorHex}
      />
    </div>
  );
}
