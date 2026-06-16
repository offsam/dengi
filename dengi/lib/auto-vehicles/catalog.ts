import type { VehicleCatalogEntry } from "./types";
import { VEHICLE_CATALOG } from "./catalog-data";

export { VEHICLE_CATALOG } from "./catalog-data";

const catalogById = new Map(VEHICLE_CATALOG.map((item) => [item.id, item]));

export function getVehicleCatalogEntry(id: string) {
  return catalogById.get(id) ?? null;
}

export function getVehicleModelsForMake(make: string) {
  return VEHICLE_CATALOG.filter((item) => item.make === make);
}

export function getVehicleCatalogTitle(entry: VehicleCatalogEntry) {
  return entry.trim ? `${entry.make} ${entry.model} ${entry.trim}` : `${entry.make} ${entry.model}`;
}

export function findVehicleCatalogEntry(text: string) {
  const haystack = text.toLowerCase();
  let best: { entry: VehicleCatalogEntry; score: number } | null = null;

  for (const item of VEHICLE_CATALOG) {
    const candidates = [
      item.id.replace(/-/g, " "),
      `${item.make} ${item.model}`.toLowerCase(),
      getVehicleCatalogTitle(item).toLowerCase(),
      ...item.aliases.map((alias) => alias.toLowerCase()),
    ];

    for (const candidate of candidates) {
      if (!candidate || !haystack.includes(candidate)) {
        continue;
      }

      const score = candidate.length;
      if (!best || score > best.score) {
        best = { entry: item, score };
      }
    }
  }

  return best?.entry ?? null;
}

export const VEHICLE_CATALOG_MAKES = [...new Set(VEHICLE_CATALOG.map((item) => item.make))].sort();
