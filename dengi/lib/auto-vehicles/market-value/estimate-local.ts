import { getVehicleCatalogEntry } from "../catalog";
import type { VehicleSilhouetteId } from "../types";
import type { MarketValueEstimate, MarketValueRequest } from "./types";

/** Базовая цена нового авто по типу кузова (USD, ориентир для US-рынка) */
const SEGMENT_MSRP: Record<VehicleSilhouetteId, number> = {
  "sport-coupe": 46_000,
  "sports-super": 72_000,
  sedan: 34_000,
  hatchback: 27_000,
  wagon: 36_000,
  "suv-compact": 38_000,
  "suv-mid": 50_000,
  truck: 44_000,
};

/** Локальная оценка — работает без API-ключей */
export function estimateLocalMarketValue(input: MarketValueRequest): MarketValueEstimate {
  const entry = getVehicleCatalogEntry(input.catalogId);
  const silhouetteId = entry?.silhouetteId ?? "sedan";
  const currentYear = new Date().getFullYear();
  const age = Math.max(0, currentYear - input.year);
  const mileageMiles = Math.round(Math.max(0, input.mileageMiles));

  const segmentMsrp = SEGMENT_MSRP[silhouetteId];
  const modelYearMsrp = segmentMsrp * Math.pow(0.985, Math.max(0, currentYear - input.year));

  const anchor =
    input.purchasePrice > 0 ? input.purchasePrice : Math.round(modelYearMsrp * 0.88);

  const ageFactor =
    age === 0
      ? 0.94
      : Math.pow(0.87, Math.min(age, 7)) * Math.pow(0.93, Math.max(0, age - 7));

  const expectedMiles = 12_000 + age * 12_000;
  const mileageDelta = mileageMiles - expectedMiles;
  const mileageFactor = 1 - Math.max(-0.08, Math.min(0.2, mileageDelta * 0.000028));

  const retail = Math.max(500, Math.round(anchor * ageFactor * mileageFactor));
  const low = Math.round(retail * 0.9);
  const high = Math.round(retail * 1.1);

  return {
    retail,
    low,
    high,
    source: "local",
    sourceLabel: "Оценка по году, пробегу и типу кузова",
    certainty: 0.42,
    mileageUsedMiles: mileageMiles,
  };
}
