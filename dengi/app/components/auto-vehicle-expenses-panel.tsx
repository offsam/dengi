"use client";

import { useState } from "react";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { UsdAmount } from "@/app/components/usd-amount";
import { formatAppDate } from "@/lib/i18n/locale";
import type { AutoVehicleExpenseType } from "@/lib/auto-vehicles/records/types";

const EXPENSE_LABELS: Record<AutoVehicleExpenseType, string> = {
  fuel: "Топливо",
  service: "Сервис",
  insurance: "Страховка",
  parking: "Парковка",
  other: "Другое",
};

const inputClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400";

function formatDate(iso: string) {
  return formatAppDate(iso, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function AutoVehicleExpensesPanel({
  vehicleId,
  readOnly = false,
}: {
  vehicleId: string;
  readOnly?: boolean;
}) {
  const { records, addRecord } = useAutoVehicleRecords(vehicleId, "expense");
  const [open, setOpen] = useState(false);
  const [expenseType, setExpenseType] = useState<AutoVehicleExpenseType>("fuel");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    addRecord({
      kind: "expense",
      expenseType,
      amount: parsedAmount,
      description: description.trim() || EXPENSE_LABELS[expenseType],
      occurredAt: new Date(`${date}T12:00:00.000Z`).toISOString(),
    });

    setAmount("");
    setDescription("");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">Расходы на авто</p>
        {readOnly ? null : (
          <button
            type="button"
            onClick={() => setOpen((current) => !current)}
            className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
          >
            {open ? "Закрыть" : "Добавить"}
          </button>
        )}
      </div>

      {!readOnly && open ? (
        <form
          className="space-y-3 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm"
          onSubmit={handleAdd}
        >
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Категория
            </span>
            <select
              className={inputClassName}
              value={expenseType}
              onChange={(event) =>
                setExpenseType(event.target.value as AutoVehicleExpenseType)
              }
            >
              {Object.entries(EXPENSE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Сумма
              </span>
              <input
                type="number"
                className={inputClassName}
                value={amount}
                min={0}
                step="0.01"
                onChange={(event) => setAmount(event.target.value)}
                required
              />
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Дата
              </span>
              <input
                type="date"
                className={inputClassName}
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Описание
            </span>
            <input
              className={inputClassName}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Необязательно"
            />
          </label>

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Добавить расход
          </button>
        </form>
      ) : null}

      {records.length === 0 ? (
        <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
          Расходов пока нет.
        </p>
      ) : (
        <div className="rounded-2xl border border-zinc-200/80 bg-white shadow-sm">
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between gap-3 border-b border-zinc-100 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {record.description}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {record.expenseType ? EXPENSE_LABELS[record.expenseType] : "Расход"} ·{" "}
                  {formatDate(record.occurredAt)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-rose-600">
                <UsdAmount amount={record.amount} exact />
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
