import { APP_LOCALE } from "@/lib/i18n/locale";

/** Цифры без символа валюты — en-US для единого вида */
export function formatUsdDigits(amount: number, exact = false) {
  return new Intl.NumberFormat("en-US", {
    minimumFractionDigits: 0,
    maximumFractionDigits: exact ? 2 : 0,
  }).format(amount);
}

/** $ сразу перед цифрами — один формат по всему приложению */
export function formatUsdAmount(amount: number, exact = false) {
  return `$${formatUsdDigits(amount, exact)}`;
}

export function formatMoney(amount: number) {
  return formatUsdAmount(amount, false);
}

export function formatMoneyExact(amount: number) {
  return formatUsdAmount(amount, true);
}

export function formatMileage(miles: number) {
  return `${new Intl.NumberFormat(APP_LOCALE, { maximumFractionDigits: 0 }).format(miles)} mi`;
}
