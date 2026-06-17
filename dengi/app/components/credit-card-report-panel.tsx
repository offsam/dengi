"use client";

import { BubbleCard } from "@/app/components/bubble-card";
import {
  CheckIcon,
  CloseIcon,
  inlineEditIconButtonClassName,
  PencilIcon,
} from "@/app/components/inline-edit-icons";
import { useMemo, useState } from "react";
import { useCreditCardStatementBalances } from "@/app/hooks/use-credit-card-statement-balances";
import { useCreditCardTransactions } from "@/app/hooks/use-credit-card-transactions";
import { UsdAmount } from "@/app/components/usd-amount";
import { APP_BUBBLE_INSET_SELECTED, APP_BUBBLE_INPUT } from "@/lib/app-theme";
import type { MonthlyDebtEntry } from "@/lib/credit-cards/transactions/report";
import {
  buildMonthlyDebtHistory,
  MAX_MONTHLY_DEBT_HISTORY,
  summarizeTransactionsForMonth,
} from "@/lib/credit-cards/transactions/report";

function ReportMetric({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: React.ReactNode;
  tone?: "neutral" | "danger" | "positive";
}) {
  const toneClass =
    tone === "danger"
      ? "text-rose-600"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-zinc-900";

  return (
    <BubbleCard className="px-3 py-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${toneClass}`}>
        {value}
      </p>
    </BubbleCard>
  );
}

function statementBalanceEditFormId(monthId: string) {
  return `credit-card-statement-balance-edit-${monthId}`;
}

function MonthlyDebtEditForm({
  entry,
  formId,
  onSave,
}: {
  entry: MonthlyDebtEntry;
  formId: string;
  onSave: (debt: number) => void;
}) {
  const [amount, setAmount] = useState(String(entry.debt));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount < 0) {
      return;
    }

    onSave(parsedAmount);
  }

  return (
    <form id={formId} onSubmit={handleSubmit} className="px-4 pb-3">
      <BubbleCard className="space-y-2 p-3">
        <label className="block space-y-1.5">
          <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
            Долг на конец месяца
          </span>
          <input
            className={APP_BUBBLE_INPUT}
            type="number"
            min={0}
            step="0.01"
            value={amount}
            onChange={(event) => setAmount(event.target.value)}
            required
            autoFocus
          />
        </label>
      </BubbleCard>
    </form>
  );
}

function MonthlyDebtDeltaStripe({ delta }: { delta: number | null }) {
  if (delta === null) {
    return null;
  }

  if (delta === 0) {
    return (
      <div
        className="mt-1 w-1 shrink-0 self-stretch rounded-full bg-zinc-200"
        aria-hidden
      />
    );
  }

  const increased = delta > 0;

  return (
    <div
      className={`mt-1 w-1 shrink-0 self-stretch rounded-full ${
        increased ? "bg-rose-500" : "bg-emerald-500"
      }`}
      aria-label={increased ? "Долг вырос" : "Долг снизился"}
    />
  );
}

function MonthlyDebtRow({
  entry,
  selected,
  isCurrentMonth,
  isEditing,
  editFormId,
  onSelect,
  onEdit,
  onCancel,
}: {
  entry: MonthlyDebtEntry;
  selected: boolean;
  isCurrentMonth: boolean;
  isEditing: boolean;
  editFormId: string;
  onSelect: () => void;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const delta = entry.deltaFromPreviousMonth;
  const showDelta = delta !== null && delta !== 0;
  const increased = (delta ?? 0) > 0;

  return (
    <div className="border-b border-white/40 last:border-b-0">
      <div
        className={`flex w-full items-stretch gap-2.5 px-4 py-3.5 ${
          selected ? APP_BUBBLE_INSET_SELECTED : ""
        }`}
      >
        <MonthlyDebtDeltaStripe delta={delta} />

        <button
          type="button"
          onClick={onSelect}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm font-medium text-zinc-900">{entry.label}</p>
          {entry.subtitle ? (
            <p className="mt-0.5 text-xs text-zinc-500">{entry.subtitle}</p>
          ) : null}
          {showDelta ? (
            <p
              className={`mt-1 text-xs font-semibold tabular-nums ${
                increased ? "text-rose-600" : "text-emerald-600"
              }`}
            >
              {increased ? "+" : "−"}
              <UsdAmount amount={Math.abs(delta)} exact className="text-inherit" />
              <span className="ml-1 font-medium text-zinc-500">к прошлому месяцу</span>
            </p>
          ) : delta === 0 ? (
            <p className="mt-1 text-xs text-zinc-500">Без изменений</p>
          ) : null}
        </button>

        <div className="flex shrink-0 items-center gap-1 self-center">
          <p className="text-sm font-semibold tabular-nums text-zinc-900">
            <UsdAmount amount={entry.debt} exact />
          </p>

          {!isCurrentMonth ? (
            isEditing ? (
              <>
                <button
                  type="submit"
                  form={editFormId}
                  className={`${inlineEditIconButtonClassName} text-[#5DAA8C] hover:bg-[#5DAA8C]/10 hover:text-[#48946F]`}
                  aria-label="Сохранить"
                >
                  <CheckIcon />
                </button>
                <button
                  type="button"
                  className={inlineEditIconButtonClassName}
                  aria-label="Отменить"
                  onClick={onCancel}
                >
                  <CloseIcon />
                </button>
              </>
            ) : (
              <button
                type="button"
                className={inlineEditIconButtonClassName}
                aria-label="Редактировать закрытие выписки"
                onClick={onEdit}
              >
                <PencilIcon />
              </button>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}

export function CreditCardReportPanel({
  cardId,
  currentBalance,
}: {
  cardId: string;
  currentBalance: number;
}) {
  const { transactions } = useCreditCardTransactions(cardId);
  const { manualBalances, saveStatementBalance } =
    useCreditCardStatementBalances(cardId);
  const [selectedMonthId, setSelectedMonthId] = useState<string | null>(null);
  const [editingMonthId, setEditingMonthId] = useState<string | null>(null);

  const monthlyDebt = useMemo(
    () => buildMonthlyDebtHistory(currentBalance, transactions, MAX_MONTHLY_DEBT_HISTORY, manualBalances),
    [currentBalance, transactions, manualBalances]
  );

  const activeMonthId = selectedMonthId ?? monthlyDebt[0]?.id ?? null;
  const activeMonth = monthlyDebt.find((item) => item.id === activeMonthId);

  const monthSummary = useMemo(() => {
    if (!activeMonthId) {
      return null;
    }

    const [year, month] = activeMonthId.split("-").map(Number);
    return summarizeTransactionsForMonth(
      transactions,
      new Date(year, month, 1)
    );
  }, [activeMonthId, transactions]);

  function startEditing(monthId: string) {
    setEditingMonthId(monthId);
  }

  function cancelEditing() {
    setEditingMonthId(null);
  }

  function saveEditing(monthId: string, debt: number) {
    saveStatementBalance(monthId, debt);
    setEditingMonthId(null);
  }

  return (
    <div className="space-y-5">
      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Отчёт</p>
          {activeMonth ? (
            <p className="mt-1 text-xs text-zinc-500">
              {activeMonth.label}
              {activeMonth.subtitle ? ` · ${activeMonth.subtitle}` : ""}
            </p>
          ) : null}
        </div>

        {monthSummary ? (
          <div className="grid grid-cols-2 gap-3">
            <ReportMetric
              label="Расходы"
              value={<UsdAmount amount={monthSummary.spending} exact />}
            />
            <ReportMetric
              label="Проценты"
              value={<UsdAmount amount={monthSummary.interest} exact tone="danger" />}
              tone="danger"
            />
            <ReportMetric
              label="Платежи"
              value={<UsdAmount amount={monthSummary.payments} exact tone="positive" />}
              tone="positive"
            />
            <ReportMetric
              label="Комиссии"
              value={<UsdAmount amount={monthSummary.fees} exact tone="danger" />}
              tone="danger"
            />
          </div>
        ) : null}
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-sm font-semibold text-zinc-900">Долг по месяцам</p>
          <p className="mt-1 text-xs text-zinc-500">
            От сегодня и до {MAX_MONTHLY_DEBT_HISTORY} месяцев назад. Карандаш — ввести
            закрытие выписки вручную.
          </p>
        </div>

        <BubbleCard className="py-0">
          {monthlyDebt.map((entry, index) => {
            const selected = entry.id === activeMonthId;
            const isCurrentMonth = index === 0;
            const isEditing = editingMonthId === entry.id;
            const formId = statementBalanceEditFormId(entry.id);

            return (
              <div key={entry.id}>
                <MonthlyDebtRow
                  entry={entry}
                  selected={selected}
                  isCurrentMonth={isCurrentMonth}
                  isEditing={isEditing}
                  editFormId={formId}
                  onSelect={() => setSelectedMonthId(entry.id)}
                  onEdit={() => startEditing(entry.id)}
                  onCancel={cancelEditing}
                />

                {isEditing ? (
                  <MonthlyDebtEditForm
                    entry={entry}
                    formId={formId}
                    onSave={(debt) => saveEditing(entry.id, debt)}
                  />
                ) : null}
              </div>
            );
          })}
        </BubbleCard>
      </div>
    </div>
  );
}
