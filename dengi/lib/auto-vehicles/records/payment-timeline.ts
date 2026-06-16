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
