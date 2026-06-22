import type { AppLang } from "./types";
import { DEFAULT_APP_LANG } from "./types";

/** Даты в US-формате: MM/DD/YYYY */
export const APP_DATE_LOCALE = "en-US";

export function resolveAppLocale(lang: AppLang = DEFAULT_APP_LANG) {
  return lang === "en" ? "en-US" : "ru-RU";
}

/** @deprecated Используйте resolveAppLocale(lang) */
export const APP_LOCALE = resolveAppLocale("ru");

/** @deprecated Используйте readStoredAppLang() или useLocale() */
export const APP_LANG = "ru" as const;

function parseAppDateInput(date: Date | string): Date {
  if (typeof date === "string") {
    const isoDay = date.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoDay) {
      return new Date(`${isoDay[1]}-${isoDay[2]}-${isoDay[3]}T12:00:00`);
    }

    return new Date(date);
  }

  return date;
}

export function formatAppDate(
  date: Date | string,
  options?: Intl.DateTimeFormatOptions
) {
  const value = parseAppDateInput(date);

  if (Number.isNaN(value.getTime())) {
    return "—";
  }

  return new Intl.DateTimeFormat(APP_DATE_LOCALE, options).format(value);
}

export function formatAppDateNumeric(date: Date | string) {
  return formatAppDate(date, {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}
