"use client";

import Link from "next/link";
import { HorizontalWheelScroll } from "@/app/components/horizontal-wheel-scroll";
import { HorizontalReorderButtons } from "@/app/components/reorder-controls";
import { AutoVehicleCard, type AutoVehicleTileDensity } from "@/app/components/auto-vehicle-card";
import { useLocale } from "@/app/components/locale-provider";
import { getAutoVehicleTitle } from "@/lib/dashboard/auto";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

const MINIMAL_ROW_CLASSNAME =
  "-mx-4 flex gap-1.5 overflow-x-auto scroll-smooth px-4 pb-0.5 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const FULL_ROW_CLASSNAME =
  "-mx-4 -mt-[58px] flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 pt-[58px] touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function splitVehiclesIntoTwoRows(vehicles: AutoVehicle[]) {
  const midpoint = Math.ceil(vehicles.length / 2);
  return [vehicles.slice(0, midpoint), vehicles.slice(midpoint)] as const;
}

function AutoVehicleItem({
  vehicle,
  density,
  editOrder,
  index,
  total,
  onMoveItem,
}: {
  vehicle: AutoVehicle;
  density: AutoVehicleTileDensity;
  editOrder: boolean;
  index: number;
  total: number;
  onMoveItem?: (id: string, direction: -1 | 1) => void;
}) {
  const { t } = useLocale();
  const title = getAutoVehicleTitle(vehicle);
  const card = <AutoVehicleCard vehicle={vehicle} density={density} />;

  if (!editOrder) {
    return (
      <Link
        href={`/auto/${vehicle.id}`}
        className="block shrink-0 snap-start rounded-lg transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
        aria-label={t("common.openItem", { name: title })}
      >
        {card}
      </Link>
    );
  }

  return (
    <div className="flex shrink-0 snap-start items-center gap-1">
      <HorizontalReorderButtons
        canMoveLeft={index > 0}
        canMoveRight={index < total - 1}
        onMoveLeft={() => onMoveItem?.(vehicle.id, -1)}
        onMoveRight={() => onMoveItem?.(vehicle.id, 1)}
      />
      <div className="rounded-lg ring-1 ring-zinc-200/80">{card}</div>
    </div>
  );
}

export function AutoVehiclesCarousel({
  vehicles,
  density = "full",
  editOrder = false,
  onMoveItem,
}: {
  vehicles: AutoVehicle[];
  density?: AutoVehicleTileDensity;
  editOrder?: boolean;
  onMoveItem?: (id: string, direction: -1 | 1) => void;
}) {
  const { t } = useLocale();
  const total = vehicles.length;

  if (density === "minimal") {
    const [topRow, bottomRow] = splitVehiclesIntoTwoRows(vehicles);

    return (
      <div className="space-y-1.5" aria-label={t("auto.carousel.ariaLabel")}>
        <HorizontalWheelScroll className={MINIMAL_ROW_CLASSNAME}>
          {topRow.map((vehicle, index) => (
            <AutoVehicleItem
              key={vehicle.id}
              vehicle={vehicle}
              density={density}
              editOrder={editOrder}
              index={index}
              total={total}
              onMoveItem={onMoveItem}
            />
          ))}
        </HorizontalWheelScroll>
        {bottomRow.length > 0 ? (
          <HorizontalWheelScroll className={MINIMAL_ROW_CLASSNAME}>
            {bottomRow.map((vehicle, index) => (
              <AutoVehicleItem
                key={vehicle.id}
                vehicle={vehicle}
                density={density}
                editOrder={editOrder}
                index={topRow.length + index}
                total={total}
                onMoveItem={onMoveItem}
              />
            ))}
          </HorizontalWheelScroll>
        ) : null}
      </div>
    );
  }

  return (
    <HorizontalWheelScroll className={FULL_ROW_CLASSNAME} ariaLabel={t("auto.carousel.ariaLabel")}>
      {vehicles.map((vehicle, index) => (
        <AutoVehicleItem
          key={vehicle.id}
          vehicle={vehicle}
          density={density}
          editOrder={editOrder}
          index={index}
          total={total}
          onMoveItem={onMoveItem}
        />
      ))}
    </HorizontalWheelScroll>
  );
}
