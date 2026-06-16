import { addMonthsToIsoDate, resolveLoanFirstPaymentDate } from "../loan";
import type { AutoVehicle } from "../vehicle";
import type { AutoVehiclePaymentType, AutoVehicleRecord } from "./types";

export type PaymentTimelineStatus = "paid" | "current" | "upcoming";

export type PaymentTimelineEntry = {
  key: string;
  date: string;
  amount: number;
  description: string;
  paymentType?: AutoVehiclePaymentType;
  status: PaymentTimelineStatus;
  record?: AutoVehicleRecord;
};

function dateKey(iso: string) {
  return iso.slice(0, 10);
}

function todayKey(asOf: Date) {
  return asOf.toISOString().slice(0, 10);
}

function findLoanRecordForDate(records: AutoVehicleRecord[], scheduleDate: string) {
  return records.find(
    (record) =>
      record.kind === "payment" &&
      record.paymentType === "loan" &&
      dateKey(record.occurredAt) === scheduleDate
  );
}

function buildLoanSchedule(vehicle: AutoVehicle) {
  if (vehicle.financingType === "cash" || vehicle.status === "sold") {
    return [];
  }

  const loanTermMonths = vehicle.loanTermMonths ?? 0;
  const loanPayment = Math.max(0, vehicle.loanPayment ?? 0);

  if (loanTermMonths <= 0 || loanPayment <= 0) {
    return [];
  }

  const paymentStartDate = resolveLoanFirstPaymentDate(vehicle);
  const schedule: { date: string; amount: number }[] = [];

  for (let monthIndex = 0; monthIndex < loanTermMonths; monthIndex += 1) {
    schedule.push({
      date: addMonthsToIsoDate(paymentStartDate, monthIndex),
      amount: loanPayment,
    });
  }

  return schedule;
}

/** Лента платежей: сверху будущие, по центру текущий, снизу оплаченные */
export function buildAutoVehiclePaymentTimeline(
  vehicle: AutoVehicle,
  records: AutoVehicleRecord[],
  asOf: Date = new Date()
): PaymentTimelineEntry[] {
  const payments = records.filter((record) => record.kind === "payment");
  const schedule = buildLoanSchedule(vehicle);
  const today = todayKey(asOf);

  if (schedule.length === 0) {
    return payments
      .sort(
        (left, right) =>
          new Date(right.occurredAt).getTime() - new Date(left.occurredAt).getTime()
      )
      .map((record) => ({
        key: record.id,
        date: dateKey(record.occurredAt),
        amount: record.amount,
        description: record.description,
        paymentType: record.paymentType,
        status: "paid" as const,
        record,
      }));
  }

  const scheduleDates = new Set(schedule.map((slot) => slot.date));
  const upcoming: PaymentTimelineEntry[] = [];
  const paid: PaymentTimelineEntry[] = [];
  let current: PaymentTimelineEntry | null = null;

  const currentSlotIndex = schedule.findIndex(
    (slot) => !findLoanRecordForDate(payments, slot.date)
  );

  schedule.forEach((slot, index) => {
    const record = findLoanRecordForDate(payments, slot.date);
    const entry: PaymentTimelineEntry = {
      key: record?.id ?? `schedule-${slot.date}`,
      date: slot.date,
      amount: record?.amount ?? slot.amount,
      description: record?.description ?? "Ежемесячный платёж",
      paymentType: "loan",
      status: "paid",
      record,
    };

    if (index === currentSlotIndex && currentSlotIndex >= 0) {
      current = { ...entry, status: "current", record: undefined };
      return;
    }

    if (record || slot.date < today) {
      if (record) {
        paid.push({ ...entry, status: "paid", record });
      }
      return;
    }

    if (slot.date > today) {
      upcoming.push({ ...entry, status: "upcoming", record: undefined });
    }
  });

  for (const record of payments) {
    if (record.paymentType === "loan" && scheduleDates.has(dateKey(record.occurredAt))) {
      continue;
    }

    paid.push({
      key: record.id,
      date: dateKey(record.occurredAt),
      amount: record.amount,
      description: record.description,
      paymentType: record.paymentType,
      status: "paid",
      record,
    });
  }

  upcoming.sort((left, right) => right.date.localeCompare(left.date));
  paid.sort((left, right) => right.date.localeCompare(left.date));

  const timeline: PaymentTimelineEntry[] = [...upcoming];

  if (current) {
    timeline.push(current);
  }

  timeline.push(...paid);

  return timeline;
}

/** Сколько дней до даты платежа */
export function formatDaysUntilPayment(dateIso: string, asOf: Date = new Date()) {
  const today = new Date(asOf);
  today.setHours(12, 0, 0, 0);
  const target = new Date(`${dateIso}T12:00:00.000Z`);
  const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

  if (days <= 0) {
    return "Сегодня";
  }

  if (days === 1) {
    return "Завтра";
  }

  const mod10 = days % 10;
  const mod100 = days % 100;
  let word = "дней";

  if (mod10 === 1 && mod100 !== 11) {
    word = "день";
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    word = "дня";
  }

  return `Через ${days} ${word}`;
}

/** Подпись под остатком платежей в статистике */
export function formatNextPaymentSubline(dateIso: string, asOf: Date = new Date()) {
  const until = formatDaysUntilPayment(dateIso, asOf);

  if (until === "Сегодня") {
    return "Следующий платёж сегодня";
  }

  if (until === "Завтра") {
    return "Следующий платёж завтра";
  }

  const rest = until.charAt(0).toLowerCase() + until.slice(1);
  return `Следующий платёж ${rest}`;
}

/** Короткая подпись: «Следующий через N дней» */
export function formatNextPaymentShortSubline(dateIso: string, asOf: Date = new Date()) {
  const until = formatDaysUntilPayment(dateIso, asOf);

  if (until === "Сегодня") {
    return "Следующий сегодня";
  }

  if (until === "Завтра") {
    return "Следующий завтра";
  }

  const rest = until.charAt(0).toLowerCase() + until.slice(1);
  return `Следующий ${rest}`;
}

/** Дата ближайшего неоплаченного платежа по графику */
export function resolveNextLoanPaymentDate(
  vehicle: AutoVehicle,
  records: AutoVehicleRecord[],
  asOf: Date = new Date()
) {
  const current = buildAutoVehiclePaymentTimeline(vehicle, records, asOf).find(
    (entry) => entry.status === "current"
  );

  return current?.date ?? null;
}

export type PaymentMonthDotStatus = "none" | "paid" | "current" | "upcoming";

export type PaymentMonthDot = {
  monthIndex: number;
  date?: string;
  status: PaymentMonthDotStatus;
};

export type PaymentYearRow = {
  year: number;
  months: PaymentMonthDot[];
};

function emptyYearMonths(): PaymentMonthDot[] {
  return Array.from({ length: 12 }, (_, monthIndex) => ({
    monthIndex,
    status: "none" as const,
  }));
}

/** Сетка по годам: 12 кружков в ряд — оплаченные, текущий, будущие */
export function buildAutoVehiclePaymentChart(
  vehicle: AutoVehicle,
  records: AutoVehicleRecord[],
  asOf: Date = new Date()
): PaymentYearRow[] {
  const payments = records.filter((record) => record.kind === "payment");
  const schedule = buildLoanSchedule(vehicle);
  const today = todayKey(asOf);

  if (schedule.length === 0) {
    return [];
  }

  const currentSlotIndex = schedule.findIndex(
    (slot) => !findLoanRecordForDate(payments, slot.date)
  );

  const yearMap = new Map<number, PaymentMonthDot[]>();

  function ensureYear(year: number) {
    if (!yearMap.has(year)) {
      yearMap.set(year, emptyYearMonths());
    }

    return yearMap.get(year)!;
  }

  schedule.forEach((slot, index) => {
    const record = findLoanRecordForDate(payments, slot.date);
    const date = new Date(`${slot.date}T12:00:00.000Z`);

    if (Number.isNaN(date.getTime())) {
      return;
    }

    const year = date.getUTCFullYear();
    const monthIndex = date.getUTCMonth();
    const months = ensureYear(year);

    let status: PaymentMonthDotStatus = "upcoming";

    if (index === currentSlotIndex && currentSlotIndex >= 0) {
      status = "current";
    } else if (record || slot.date < today) {
      status = record ? "paid" : "none";
    }

    months[monthIndex] = {
      monthIndex,
      date: slot.date,
      status,
    };
  });

  return [...yearMap.entries()]
    .sort(([leftYear], [rightYear]) => leftYear - rightYear)
    .map(([year, months]) => ({ year, months }));
}
