import type { AppLang } from "./types";
import type { Translator } from "./translate";
import { PRESET_NAME_BY_RU, presetMessages } from "./messages/presets";

export function translatePresetName(name: string, lang: AppLang, t?: Translator): string {
  const trimmed = name.trim();
  if (!trimmed || lang === "ru") {
    return trimmed;
  }

  const key = PRESET_NAME_BY_RU[trimmed];
  if (key) {
    return presetMessages.en[key];
  }

  return trimmed;
}

/** «20 июн» / «1 июл» и уже en-US даты */
export function translateShortDueDate(date: string, lang: AppLang): string {
  const trimmed = date.trim();
  if (!trimmed || lang === "ru") {
    return trimmed;
  }

  const match = trimmed.match(/^(\d{1,2})\s+([а-яё]{3})$/i);
  if (!match) {
    return trimmed;
  }

  const day = match[1];
  const monthRu = match[2].toLowerCase();
  const monthEn = {
    янв: "Jan",
    фев: "Feb",
    мар: "Mar",
    апр: "Apr",
    май: "May",
    июн: "Jun",
    июл: "Jul",
    авг: "Aug",
    сен: "Sep",
    окт: "Oct",
    ноя: "Nov",
    дек: "Dec",
  }[monthRu];

  return monthEn ? `${monthEn} ${day}` : trimmed;
}

export function formatPaymentDueDay(dayOfMonth: number, lang: AppLang): string {
  if (dayOfMonth < 1 || dayOfMonth > 31) {
    return "—";
  }

  if (lang === "en") {
    const suffix =
      dayOfMonth % 10 === 1 && dayOfMonth !== 11
        ? "st"
        : dayOfMonth % 10 === 2 && dayOfMonth !== 12
          ? "nd"
          : dayOfMonth % 10 === 3 && dayOfMonth !== 13
            ? "rd"
            : "th";
    return `${dayOfMonth}${suffix}`;
  }

  return `${dayOfMonth}-е число`;
}
