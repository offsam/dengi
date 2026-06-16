import type { AutoVehicle } from "./vehicle";

/** Сдвиг ISO-даты на N месяцев */
export function addMonthsToIsoDate(isoDate: string, months: number) {
  const date = new Date(`${isoDate}T12:00:00.000Z`);
  if (Number.isNaN(date.getTime())) {
    return isoDate;
  }

  date.setUTCMonth(date.getUTCMonth() + months);
  return date.toISOString().slice(0, 10);
}

function clampPaymentDay(day: number) {
  if (!Number.isFinite(day)) {
    return 1;
  }

  return Math.min(31, Math.max(1, Math.round(day)));
}

function daysInUtcMonth(year: number, monthIndex: number) {
  return new Date(Date.UTC(year, monthIndex + 1, 0)).getUTCDate();
}

function buildIsoDateUtc(year: number, monthIndex: number, day: number) {
  const safeDay = Math.min(clampPaymentDay(day), daysInUtcMonth(year, monthIndex));
  return `${year}-${String(monthIndex + 1).padStart(2, "0")}-${String(safeDay).padStart(2, "0")}`;
}

/** День платежа по умолчанию — тот же день, что и дата покупки */
export function defaultLoanPaymentDay(purchaseDate: string) {
  if (!purchaseDate) {
    return new Date().getUTCDate();
  }

  const purchase = new Date(`${purchaseDate}T12:00:00.000Z`);
  if (Number.isNaN(purchase.getTime())) {
    return 1;
  }

  return purchase.getUTCDate();
}

export function resolveLoanPaymentDay(
  vehicle: Pick<AutoVehicle, "loanPaymentDay" | "purchaseDate">
) {
  return clampPaymentDay(vehicle.loanPaymentDay ?? defaultLoanPaymentDay(vehicle.purchaseDate));
}

/** Дата первого платежа: следующий месяц после покупки, в выбранный день */
export function computeLoanFirstPaymentDate(purchaseDate: string, paymentDay: number) {
  if (!purchaseDate) {
    const today = new Date();
    return buildIsoDateUtc(
      today.getUTCFullYear(),
      today.getUTCMonth() + 1,
      resolveLoanPaymentDay({ purchaseDate, loanPaymentDay: paymentDay })
    );
  }

  const purchase = new Date(`${purchaseDate}T12:00:00.000Z`);
  if (Number.isNaN(purchase.getTime())) {
    return purchaseDate;
  }

  let year = purchase.getUTCFullYear();
  let monthIndex = purchase.getUTCMonth() + 1;

  if (monthIndex > 11) {
    monthIndex = 0;
    year += 1;
  }

  return buildIsoDateUtc(year, monthIndex, paymentDay);
}

export function resolveLoanFirstPaymentDate(
  vehicle: Pick<AutoVehicle, "loanPaymentDay" | "purchaseDate">
) {
  return computeLoanFirstPaymentDate(
    vehicle.purchaseDate,
    resolveLoanPaymentDay(vehicle)
  );
}

/** Дата последнего платежа по графику кредита */
export function resolveLoanEndDate(
  vehicle: Pick<
    AutoVehicle,
    "financingType" | "loanTermMonths" | "loanPaymentDay" | "purchaseDate"
  >
) {
  if (vehicle.financingType === "cash") {
    return null;
  }

  const loanTermMonths = vehicle.loanTermMonths ?? 0;

  if (loanTermMonths <= 0) {
    return null;
  }

  const firstPaymentDate = resolveLoanFirstPaymentDate(vehicle);
  return addMonthsToIsoDate(firstPaymentDate, loanTermMonths - 1);
}

/** Доля пройденного пути кредита от покупки до последнего платежа, 0–100 */
export function resolveLoanProgressPercent(
  vehicle: Pick<
    AutoVehicle,
    | "financingType"
    | "purchaseDate"
    | "loanTermMonths"
    | "loanPaymentDay"
    | "remaining"
  >,
  loanPaymentsCount: number,
  asOf: Date = new Date()
) {
  if (vehicle.financingType === "cash") {
    return null;
  }

  const loanTermMonths = vehicle.loanTermMonths ?? 0;

  if (loanTermMonths <= 0) {
    return null;
  }

  if (vehicle.remaining <= 0 || loanPaymentsCount >= loanTermMonths) {
    return 100;
  }

  const loanEndDate = resolveLoanEndDate(vehicle);

  if (!vehicle.purchaseDate || !loanEndDate) {
    return Math.min(100, Math.max(0, (loanPaymentsCount / loanTermMonths) * 100));
  }

  const startMs = new Date(`${vehicle.purchaseDate}T12:00:00.000Z`).getTime();
  const endMs = new Date(`${loanEndDate}T12:00:00.000Z`).getTime();
  const nowMs = asOf.getTime();

  if (Number.isNaN(startMs) || Number.isNaN(endMs) || endMs <= startMs) {
    return Math.min(100, Math.max(0, (loanPaymentsCount / loanTermMonths) * 100));
  }

  const elapsed = (nowMs - startMs) / (endMs - startMs);
  return Math.min(100, Math.max(0, elapsed * 100));
}

/** Сколько полных ежемесячных платежей прошло с даты первого платежа */
export function countLoanMonthsElapsed(
  paymentStartDate: string,
  asOf: Date = new Date()
) {
  if (!paymentStartDate) {
    return 0;
  }

  const start = new Date(`${paymentStartDate}T12:00:00.000Z`);
  if (Number.isNaN(start.getTime())) {
    return 0;
  }

  let months =
    (asOf.getFullYear() - start.getFullYear()) * 12 + (asOf.getMonth() - start.getMonth());

  if (asOf.getDate() < start.getDate()) {
    months -= 1;
  }

  return Math.max(0, months);
}

/** Ежемесячный платёж по сумме, ставке и сроку (стандартная амортизация) */
export function computeLoanMonthlyPayment(
  principal: number,
  loanAprPercent: number,
  termMonths: number
) {
  if (principal <= 0 || termMonths <= 0) {
    return 0;
  }

  const monthlyRate = loanAprPercent / 100 / 12;

  if (monthlyRate <= 0) {
    return Math.round(principal / termMonths);
  }

  const factor = (1 + monthlyRate) ** termMonths;
  return Math.round((principal * monthlyRate * factor) / (factor - 1));
}

/** Остаток долга на сегодня с учётом срока кредита */
export function computeLoanRemainingBalance(input: {
  principal: number;
  loanAprPercent: number;
  loanPayment: number;
  paymentStartDate: string;
  loanTermMonths?: number;
  asOf?: Date;
}) {
  const {
    principal,
    loanAprPercent,
    loanPayment,
    paymentStartDate,
    loanTermMonths = 0,
    asOf = new Date(),
  } = input;

  if (principal <= 0) {
    return 0;
  }

  const monthsElapsed = countLoanMonthsElapsed(paymentStartDate, asOf);

  if (loanTermMonths > 0 && monthsElapsed >= loanTermMonths) {
    return 0;
  }

  const paymentsToSimulate =
    loanTermMonths > 0 ? Math.min(monthsElapsed, loanTermMonths) : monthsElapsed;

  if (paymentsToSimulate <= 0) {
    return Math.round(principal);
  }

  const monthlyRate = loanAprPercent / 100 / 12;

  if (monthlyRate <= 0) {
    return Math.max(0, Math.round(principal - loanPayment * paymentsToSimulate));
  }

  if (loanPayment <= 0) {
    return Math.round(principal * (1 + monthlyRate) ** paymentsToSimulate);
  }

  let balance = principal;

  for (let month = 0; month < paymentsToSimulate; month += 1) {
    const interest = balance * monthlyRate;
    const principalPart = loanPayment - interest;

    if (principalPart <= 0) {
      break;
    }

    if (principalPart >= balance) {
      return 0;
    }

    balance -= principalPart;
  }

  return Math.max(0, Math.round(balance));
}

/** Синхронизация финансов: платёж — от пользователя, остаток и проценты — из калькулятора */
export function syncFinancingFromLoanInputs(
  vehicle: Pick<
    AutoVehicle,
    | "purchasePrice"
    | "purchaseDate"
    | "loanPaymentDay"
    | "loanTermMonths"
    | "loanAprPercent"
    | "loanPayment"
    | "loanInterest"
    | "remaining"
  >,
  asOf?: Date
) {
  const loanAprPercent = resolveLoanAprPercent(vehicle);
  const loanTermMonths = vehicle.loanTermMonths ?? 0;
  const loanPaymentDay = resolveLoanPaymentDay(vehicle);
  const paymentStartDate = computeLoanFirstPaymentDate(vehicle.purchaseDate, loanPaymentDay);
  const loanPayment = Math.max(0, vehicle.loanPayment ?? 0);

  const remaining = computeLoanRemainingBalance({
    principal: vehicle.purchasePrice,
    loanAprPercent,
    loanPayment,
    paymentStartDate,
    loanTermMonths,
    asOf,
  });

  return {
    loanAprPercent,
    loanTermMonths,
    loanPaymentDay,
    loanPayment,
    remaining,
    loanInterest: syncLoanInterestFromApr(remaining, loanAprPercent),
  };
}

/** Месячные проценты из годовой ставки и текущего остатка */
export function syncLoanInterestFromApr(
  remaining: number,
  loanAprPercent: number
) {
  if (remaining <= 0 || loanAprPercent <= 0) {
    return 0;
  }

  return Math.round((remaining * loanAprPercent) / 100 / 12);
}

export function resolveLoanAprPercent(vehicle: Pick<AutoVehicle, "loanAprPercent" | "loanInterest" | "remaining">) {
  if (vehicle.loanAprPercent != null && vehicle.loanAprPercent > 0) {
    return vehicle.loanAprPercent;
  }

  if (vehicle.remaining <= 0) {
    return 0;
  }

  return (vehicle.loanInterest / vehicle.remaining) * 12 * 100;
}

export function toLoanAprInput(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return String(Math.round(value * 10) / 10);
}

export function toLoanTermMonthsInput(value: number) {
  if (!Number.isFinite(value) || value <= 0) {
    return "";
  }

  return String(Math.round(value));
}

/** Миграция старых данных: loanFirstPaymentDate → день месяца */
export function resolveStoredLoanPaymentDay(
  raw: Pick<AutoVehicle, "loanPaymentDay" | "purchaseDate"> & {
    loanFirstPaymentDate?: string;
  }
) {
  if (raw.loanPaymentDay != null && raw.loanPaymentDay >= 1 && raw.loanPaymentDay <= 31) {
    return clampPaymentDay(raw.loanPaymentDay);
  }

  if (raw.loanFirstPaymentDate) {
    const legacy = new Date(`${raw.loanFirstPaymentDate}T12:00:00.000Z`);
    if (!Number.isNaN(legacy.getTime())) {
      return legacy.getUTCDate();
    }
  }

  return defaultLoanPaymentDay(raw.purchaseDate);
}
