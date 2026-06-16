import { buildVehicleDisplayTitle } from "@/lib/auto-vehicles";
import { SEED_AUTO_VEHICLES } from "@/lib/auto-vehicles/seed";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

export type { AutoVehicle, AutoVehicleDraft } from "@/lib/auto-vehicles/vehicle";

export function getAutoVehicleTitle(vehicle: Pick<AutoVehicle, "catalogId" | "year">) {
  return buildVehicleDisplayTitle(vehicle.catalogId, vehicle.year);
}

export const DASHBOARD_AUTO_VEHICLES = SEED_AUTO_VEHICLES;

/** @deprecated Используйте DASHBOARD_AUTO_VEHICLES */
export const DASHBOARD_AUTO_LOANS = DASHBOARD_AUTO_VEHICLES;
