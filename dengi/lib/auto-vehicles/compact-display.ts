import { messages } from "@/lib/i18n/messages/index";
import type { AppLang } from "@/lib/i18n/types";
import { getVehicleCatalogEntry } from "./catalog";

/** Короткое имя марки на компактной плитке: Mercedes-Benz → Mercedes */
export function formatCompactVehicleMake(make: string, lang: AppLang = "ru") {
  const trimmed = make.trim();
  if (!trimmed) {
    return messages[lang].common.compactVehicleFallback;
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
export function buildVehicleCompactLabel(
  catalogId: string,
  year?: number,
  lang: AppLang = "ru"
) {
  const entry = getVehicleCatalogEntry(catalogId);
  if (!entry) {
    return year ? String(year) : messages[lang].common.compactVehicleFallback;
  }

  const make = formatCompactVehicleMake(entry.make, lang);
  return year ? `${year} ${make}` : make;
}
