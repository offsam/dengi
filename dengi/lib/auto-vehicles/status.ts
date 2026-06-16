import type { AutoVehicle } from "./vehicle";

export function isActiveAutoVehicle(vehicle: AutoVehicle) {
  return (vehicle.status ?? "active") === "active";
}

export function isArchivedAutoVehicle(vehicle: AutoVehicle) {
  return vehicle.status === "sold";
}
