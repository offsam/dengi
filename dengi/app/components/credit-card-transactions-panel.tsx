"use client";

import { useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { useCreditCardTransactions } from "@/app/hooks/use-credit-card-transactions";
import { UsdAmount } from "@/app/components/usd-amount";
import { APP_BUBBLE_INPUT } from "@/lib/app-theme";
import { formatAppDate } from "@/lib/i18n/locale";
import type { CreditCardTransactionType } from "@/lib/credit-cards/transactions/types";

const TYPE_LABELS: Record<CreditCardTransactionType, string> = {
  purchase: "Покупка",
  payment: "Платёж",
  interest: "Проценты",
  fee: "Комиссия",
};

const TYPE_TONES: Record<CreditCardTransactionType, string> = {
  purchase: "text-zinc-900",
  payment: "text-emerald-600",
  interest: "text-rose-600",
  fee: "text-rose-600",
};

const inputClassName = APP_BUBBLE_INPUT;

function formatDate(iso: string) {
  return formatAppDate(iso, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function CreditCardTransactionsPanel({ cardId }: { cardId: string }) {
  const { transactions, addTransaction } = useCreditCardTransactions(cardId);
  const [open, setOpen] = useState(false);
  const [type, setType] = useState<CreditCardTransactionType>("purchase");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    addTransaction({
      type,
      amount: parsedAmount,
      description: description.trim() || TYPE_LABELS[type],
      occurredAt: new Date(`${date}T12:00:00.000Z`).toISOString(),
    });

    setAmount("");
    setDescription("");
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">Транзакции</p>
        <BubbleAddButton
          ariaLabel={open ? "Закрыть форму добавления" : "Добавить транзакцию"}
          active={open}
          onClick={() => setOpen((current) => !current)}
        />
      </div>

      {open ? (
        <form onSubmit={handleAdd}>
          <BubbleCard className="space-y-3 p-4">
          <div className="grid grid-cols-2 gap-3">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Тип
              </span>
              <select
                className={inputClassName}
                value={type}
                onChange={(event) =>
                  setType(event.target.value as CreditCardTransactionType)
                }
              >
                {Object.entries(TYPE_LABELS).map(([value, label]) => (
                  <option key={value} value={value}>
                    {label}
                  </option>
                ))}
              </select>
            </label>

            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                Дата
              </span>
              <input
                className={inputClassName}
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
                required
              />
            </label>
          </div>

          <label className="block space-y-1.5">
            <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Сумма
            </span>
            <input
              className={inputClassName}
              type="number"
              min={0}
              step="0.01"
              value={amount}
              onChange={(event) => setAmount(event.target.value)}
              required
            />
          </label>

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
            Добавить транзакцию
          </button>
          </BubbleCard>
        </form>
      ) : null}

      {transactions.length === 0 ? (
        <BubbleCard className="border-dashed px-4 py-8 text-center text-sm text-zinc-500">
          По этой карте пока нет транзакций.
        </BubbleCard>
      ) : (
        <BubbleCard>
          {transactions.map((transaction) => (
            <div
              key={transaction.id}
              className="flex items-center justify-between gap-3 border-b border-white/40 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {transaction.description}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {TYPE_LABELS[transaction.type]} ·{" "}
                  {formatDate(transaction.occurredAt)}
                </p>
              </div>
              <p
                className={`shrink-0 text-sm font-semibold tabular-nums ${TYPE_TONES[transaction.type]}`}
              >
                {transaction.type === "payment" ? "−" : "+"}
                <UsdAmount amount={transaction.amount} exact />
              </p>
            </div>
          ))}
        </BubbleCard>
      )}
    </div>
  );
}
