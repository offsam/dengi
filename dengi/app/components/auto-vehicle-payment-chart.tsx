"use client";

import type { PaymentYearRow } from "@/lib/auto-vehicles/records/payment-timeline";

const MONTH_LABELS = ["Я", "Ф", "М", "А", "М", "И", "И", "А", "С", "О", "Н", "Д"];

function MonthDot({ status }: { status: PaymentYearRow["months"][number]["status"] }) {
  if (status === "none") {
    return <span aria-hidden className="block size-1.5 rounded-full bg-zinc-100" />;
  }

  if (status === "paid") {
    return <span aria-hidden className="block size-2 rounded-full bg-emerald-500" />;
  }

  if (status === "current") {
    return (
      <span
        aria-hidden
        className="block size-3 rounded-full bg-white ring-[1.5px] ring-zinc-500/70 shadow-[inset_0_1px_2px_rgba(55,50,45,0.15)]"
      />
    );
  }

  return <span aria-hidden className="block size-2 rounded-full bg-zinc-300" />;
}

export function AutoVehiclePaymentChart({ rows }: { rows: PaymentYearRow[] }) {
  if (rows.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-200 px-4 py-8 text-center text-sm text-zinc-500">
        Нет графика платежей — укажите срок и сумму кредита в настройках авто.
      </p>
    );
  }

  return (
    <div className="flex min-h-0 flex-col gap-1.5">
      <div className="flex items-end gap-1">
        <span className="w-8 shrink-0" aria-hidden />
        <div className="grid min-w-0 flex-1 grid-cols-12 gap-px">
          {MONTH_LABELS.map((label, monthIndex) => (
            <span
              key={label + monthIndex}
              className="text-center text-[7px] font-medium leading-none text-zinc-400"
            >
              {label}
            </span>
          ))}
        </div>
      </div>

      {rows.map((row) => (
        <section
          key={row.year}
          aria-label={`Платежи ${row.year} года`}
          className="flex items-center gap-1"
        >
          <span className="w-8 shrink-0 text-right text-[10px] font-semibold tabular-nums leading-none text-zinc-500">
            {row.year}
          </span>
          <div className="grid min-w-0 flex-1 grid-cols-12 gap-px">
            {row.months.map((month) => (
              <div
                key={month.monthIndex}
                className="flex h-3.5 items-center justify-center"
              >
                <MonthDot status={month.status} />
              </div>
            ))}
          </div>
        </section>
      ))}

      <div className="flex flex-wrap items-center gap-x-3 gap-y-0.5 pt-0.5 text-[10px] leading-none text-zinc-500">
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-emerald-500" />
          Оплачено
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-3 rounded-full bg-white ring-[1.5px] ring-zinc-500/70 shadow-[inset_0_1px_2px_rgba(55,50,45,0.15)]" />
          Текущий
        </span>
        <span className="inline-flex items-center gap-1">
          <span className="size-2 rounded-full bg-zinc-300" />
          Будущий
        </span>
      </div>
    </div>
  );
}
