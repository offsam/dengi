import type { AppLang } from "@/lib/i18n/types";
import { formatPaymentDueDay } from "@/lib/i18n/presets";
import type { CreditCard } from "./types";

const MS_PER_DAY = 86_400_000;

function clampDayOfMonth(day: number, year: number, monthIndex: number) {
  const lastDay = new Date(year, monthIndex + 1, 0).getDate();
  return Math.min(Math.max(day, 1), lastDay);
}

function dateWithDayOfMonth(year: number, monthIndex: number, dayOfMonth: number) {
  const day = clampDayOfMonth(dayOfMonth, year, monthIndex);
  return new Date(year, monthIndex, day, 12, 0, 0, 0);
}

/** Ближайшая дата платежа — N-е число текущего или следующего месяца */
export function resolveNextPaymentDueDate(dayOfMonth: number, from = new Date()) {
  if (dayOfMonth < 1 || dayOfMonth > 31) {
    return null;
  }

  const start = new Date(from);
  start.setHours(12, 0, 0, 0);

  let year = start.getFullYear();
  let month = start.getMonth();
  let due = dateWithDayOfMonth(year, month, dayOfMonth);

  if (due.getTime() < start.getTime()) {
    month += 1;
    if (month > 11) {
      month = 0;
      year += 1;
    }
    due = dateWithDayOfMonth(year, month, dayOfMonth);
  }

  return due;
}

export function resolveDaysUntilDueFromDay(dayOfMonth: number, from = new Date()) {
  const due = resolveNextPaymentDueDate(dayOfMonth, from);
  if (!due) {
    return 0;
  }

  const start = new Date(from);
  start.setHours(12, 0, 0, 0);

  return Math.max(0, Math.ceil((due.getTime() - start.getTime()) / MS_PER_DAY));
}

/** Короткая подпись дня платежа */
export function formatCreditCardDueLabel(dayOfMonth: number, lang: AppLang = "ru") {
  return formatPaymentDueDay(dayOfMonth, lang);
}

export function formatPaymentDueDayDisplay(dayOfMonth: number, lang: AppLang = "ru") {
  return formatCreditCardDueLabel(dayOfMonth, lang);
}

/** Число месяца из сохранённых полей (в т.ч. старые записи) */
export function resolvePaymentDueDay(
  card: Pick<CreditCard, "paymentDueDay" | "dueDate">
): number {
  const stored = card.paymentDueDay;
  if (stored !== undefined && stored >= 1 && stored <= 31) {
    return stored;
  }

  const match = card.dueDate.match(/^(\d{1,2})/);
  if (match) {
    const day = Number(match[1]);
    if (day >= 1 && day <= 31) {
      return day;
    }
  }

  return 0;
}

export function patchPaymentDueDay(dayOfMonth: number, lang: AppLang = "ru"): Partial<CreditCard> {
  const day = Math.round(dayOfMonth);

  if (day < 1 || day > 31) {
    return {
      paymentDueDay: undefined,
      dueDate: "",
      daysUntilDue: 0,
    };
  }

  return {
    paymentDueDay: day,
    dueDate: formatCreditCardDueLabel(day, lang),
    daysUntilDue: resolveDaysUntilDueFromDay(day),
  };
}

/** Пересчитать daysUntilDue для всех карт (например при открытии) */
export function refreshPaymentDueDerivedFields(
  card: Pick<CreditCard, "paymentDueDay" | "dueDate" | "daysUntilDue">,
  lang: AppLang = "ru"
): Partial<CreditCard> {
  const day = resolvePaymentDueDay(card);
  if (day <= 0) {
    return {};
  }

  return {
    paymentDueDay: day,
    dueDate: formatCreditCardDueLabel(day, lang),
    daysUntilDue: resolveDaysUntilDueFromDay(day),
  };
}
