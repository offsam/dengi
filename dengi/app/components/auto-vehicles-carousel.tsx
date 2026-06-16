import Link from "next/link";
import { AutoVehicleCard } from "@/app/components/auto-vehicle-card";
import { getAutoVehicleTitle } from "@/lib/dashboard/auto";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

export function AutoVehiclesCarousel({ vehicles }: { vehicles: AutoVehicle[] }) {
  return (
    <div
      className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      aria-label="Авто"
    >
      {vehicles.map((vehicle) => (
        <Link
          key={vehicle.id}
          href={`/auto/${vehicle.id}`}
          className="block shrink-0 snap-start rounded-lg transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
          aria-label={`Открыть ${getAutoVehicleTitle(vehicle)}`}
        >
          <AutoVehicleCard vehicle={vehicle} />
        </Link>
      ))}
    </div>
  );
}
