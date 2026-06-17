import { getVehicleCatalogEntry } from "./catalog";

/** Короткое имя марки на компактной плитке: Mercedes-Benz → Mercedes */
export function formatCompactVehicleMake(make: string) {
  const trimmed = make.trim();
  if (!trimmed) {
    return "Авто";
  }

  if (trimmed.startsWith("Mercedes-Benz")) {
    return "Mercedes";
  }

  const hyphenShort = trimmed.split("-")[0]?.trim();
  if (hyphenShort && hyphenShort.length >= 3) {
    return hyphenShort;
  }

  return trimmed;
}

/** Подпись компактной плитки: «2019 Audi», без модели */
export function buildVehicleCompactLabel(catalogId: string, year?: number) {
  const entry = getVehicleCatalogEntry(catalogId);
  if (!entry) {
    return year ? String(year) : "Авто";
  }

  const make = formatCompactVehicleMake(entry.make);
  return year ? `${year} ${make}` : make;
}
