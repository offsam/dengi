"use client";

import { useEffect, useMemo, useState } from "react";
import { AutoVehiclePaymentChart } from "@/app/components/auto-vehicle-payment-chart";
import { AutoVehiclePaymentTimeline } from "@/app/components/auto-vehicle-payment-timeline";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { BubbleCard } from "@/app/components/bubble-card";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { useClientMounted } from "@/app/hooks/use-client-mounted";
import {
  buildAutoVehiclePaymentChart,
  buildAutoVehiclePaymentTimeline,
} from "@/lib/auto-vehicles/records/payment-timeline";
import { syncAutoVehicleLoanPayments } from "@/lib/auto-vehicles/records/sync-loan-payments";
import { APP_BUBBLE_BUTTON, APP_BUBBLE_INPUT } from "@/lib/app-theme";
import type { AutoVehiclePaymentType, AutoVehicleRecord } from "@/lib/auto-vehicles/records/types";

const PAYMENT_LABELS: Record<AutoVehiclePaymentType, string> = {
  loan: "Кредит",
  extra: "Досрочный",
  insurance: "Страховка",
};

const inputClassName = APP_BUBBLE_INPUT;

const panelActionButtonClassName = APP_BUBBLE_BUTTON;

function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

function PaymentEditForm({
  record,
  onSave,
  onCancel,
}: {
  record: AutoVehicleRecord;
  onSave: (patch: {
    amount: number;
    description: string;
    occurredAt: string;
  }) => void;
  onCancel: () => void;
}) {
  const [amount, setAmount] = useState(String(record.amount));
  const [description, setDescription] = useState(record.description);
  const [date, setDate] = useState(toDateInputValue(record.occurredAt));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    onSave({
      amount: parsedAmount,
      description: description.trim() || record.description,
      occurredAt: new Date(`${date}T12:00:00.000Z`).toISOString(),
    });
  }

  return (
    <form onSubmit={handleSubmit}>
      <BubbleCard className="mx-1 space-y-3 p-3">
      <div className="grid grid-cols-2 gap-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Сумма</span>
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
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Дата</span>
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
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Описание</span>
        <input
          className={inputClassName}
          value={description}
          onChange={(event) => setDescription(event.target.value)}
        />
      </label>

      <div className="flex items-center gap-3">
        <button
          type="button"
          className="shrink-0 py-2 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
          onClick={onCancel}
        >
          Отмена
        </button>
        <button
          type="submit"
          className="flex-1 rounded-full bg-zinc-900 px-4 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
        >
          Сохранить
        </button>
      </div>
      </BubbleCard>
    </form>
  );
}

export function AutoVehiclePaymentsPanel({
  vehicleId,
  readOnly = false,
  expanded = false,
}: {
  vehicleId: string;
  readOnly?: boolean;
  expanded?: boolean;
}) {
  const mounted = useClientMounted();
  const { getVehicle } = useAutoVehicles();
  const vehicle = getVehicle(vehicleId);
  const { records, addRecord, updateRecord } = useAutoVehicleRecords(vehicleId, "payment");
  const [chartOpen, setChartOpen] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [paymentType, setPaymentType] = useState<AutoVehiclePaymentType>("loan");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  useEffect(() => {
    if (!mounted || !vehicle) {
      return;
    }

    syncAutoVehicleLoanPayments(vehicle);
  }, [mounted, vehicle]);

  const timelineEntries = useMemo(() => {
    if (!vehicle) {
      return [];
    }

    return buildAutoVehiclePaymentTimeline(vehicle, records);
  }, [vehicle, records]);

  const chartRows = useMemo(() => {
    if (!vehicle) {
      return [];
    }

    return buildAutoVehiclePaymentChart(vehicle, records);
  }, [vehicle, records]);

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    addRecord({
      kind: "payment",
      paymentType,
      amount: parsedAmount,
      description: description.trim() || PAYMENT_LABELS[paymentType],
      occurredAt: new Date(`${date}T12:00:00.000Z`).toISOString(),
    });

    setAmount("");
    setDescription("");
    setAddOpen(false);
  }

  function handleSaveEdit(
    record: AutoVehicleRecord,
    patch: { amount: number; description: string; occurredAt: string }
  ) {
    updateRecord(record.id, {
      ...patch,
      autoGenerated: false,
    });
    setEditingId(null);
  }

  return (
    <div className={`flex min-h-0 flex-col gap-3 ${expanded ? "flex-1" : ""}`}>
      <div className="flex shrink-0 items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">Платежи по кредиту</p>
        {readOnly ? null : (
          <div className="flex shrink-0 items-center gap-2">
            <button
              type="button"
              onClick={() => {
                setChartOpen((current) => !current);
                setAddOpen(false);
              }}
              className={panelActionButtonClassName}
              aria-pressed={chartOpen}
            >
              <svg
                aria-hidden
                className="size-3.5"
                fill="none"
                viewBox="0 0 16 16"
                stroke="currentColor"
                strokeWidth={1.75}
              >
                <circle cx="3" cy="8" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="8" cy="8" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="13" cy="8" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              {chartOpen ? "Список" : "График"}
            </button>
            <BubbleAddButton
              ariaLabel={addOpen ? "Закрыть форму добавления" : "Добавить платёж"}
              active={addOpen}
              onClick={() => {
                setAddOpen((current) => !current);
                setChartOpen(false);
              }}
            />
          </div>
        )}
      </div>

      {!readOnly && addOpen ? (
        <form onSubmit={handleAdd}>
          <BubbleCard className="shrink-0 space-y-3 p-4">
          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">Тип</span>
            <select
              className={inputClassName}
              value={paymentType}
              onChange={(event) =>
                setPaymentType(event.target.value as AutoVehiclePaymentType)
              }
            >
              {Object.entries(PAYMENT_LABELS).map(([value, label]) => (
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
            Добавить платёж
          </button>
          </BubbleCard>
        </form>
      ) : null}

      {chartOpen ? (
        <AutoVehiclePaymentChart rows={chartRows} />
      ) : (
        <AutoVehiclePaymentTimeline
          entries={timelineEntries}
          readOnly={readOnly}
          expanded={expanded}
          editingId={editingId}
          onEdit={(record) => setEditingId(record.id)}
          editForm={(record) => (
            <PaymentEditForm
              record={record}
              onCancel={() => setEditingId(null)}
              onSave={(patch) => handleSaveEdit(record, patch)}
            />
          )}
        />
      )}
    </div>
  );
}
