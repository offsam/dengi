import { getVehicleCatalogEntry } from "./catalog";
import type { VehicleSilhouetteId } from "./types";

/** Иконка кузова по типу силуэта из каталога */
const SILHOUETTE_TO_BODY_ICON: Record<VehicleSilhouetteId, string> = {
  "sport-coupe": "sport",
  sedan: "sedan",
  hatchback: "hatchback",
  wagon: "universal",
  "suv-compact": "suv",
  "suv-mid": "FULLsizeSUV",
  truck: "pickup",
  "sports-super": "sport",
};

/** Подобрать bodyIconId при выборе модели в каталоге */
export function resolveBodyIconIdFromCatalog(catalogId: string) {
  const entry = getVehicleCatalogEntry(catalogId);

  if (!entry) {
    return undefined;
  }

  return SILHOUETTE_TO_BODY_ICON[entry.silhouetteId];
}
