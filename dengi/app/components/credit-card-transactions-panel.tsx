"use client";

import { useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import {
  CheckIcon,
  CloseIcon,
  inlineEditIconButtonClassName,
  PencilIcon,
} from "@/app/components/inline-edit-icons";
import { useLocale } from "@/app/components/locale-provider";
import { useCreditCardTransactions } from "@/app/hooks/use-credit-card-transactions";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { UsdAmount } from "@/app/components/usd-amount";
import { APP_BUBBLE_INPUT } from "@/lib/app-theme";
import { formatAppDate } from "@/lib/i18n/locale";
import { getCreditTransactionTypeLabel } from "@/lib/i18n/labels";
import type {
  CreditCardTransaction,
  CreditCardTransactionType,
} from "@/lib/credit-cards/transactions/types";

const TRANSACTION_TYPES: CreditCardTransactionType[] = [
  "purchase",
  "payment",
  "interest",
  "fee",
];

const TYPE_TONES: Record<CreditCardTransactionType, string> = {
  purchase: "text-zinc-900",
  payment: "text-emerald-600",
  interest: "text-rose-600",
  fee: "text-rose-600",
};

const inputClassName = APP_BUBBLE_INPUT;

export function transactionEditFormId(transactionId: string) {
  return `credit-card-transaction-edit-${transactionId}`;
}

function toDateInputValue(iso: string) {
  return iso.slice(0, 10);
}

function formatDate(iso: string) {
  return formatAppDate(iso, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function TransactionFields({
  type,
  amount,
  description,
  date,
  onTypeChange,
  onAmountChange,
  onDescriptionChange,
  onDateChange,
}: {
  type: CreditCardTransactionType;
  amount: string;
  description: string;
  date: string;
  onTypeChange: (value: CreditCardTransactionType) => void;
  onAmountChange: (value: string) => void;
  onDescriptionChange: (value: string) => void;
  onDateChange: (value: string) => void;
}) {
  const { lang, t } = useLocale();

  return (
    <div className="grid grid-cols-4 gap-3">
      <label className="col-span-2 block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("common.date")}
        </span>
        <input
          className={inputClassName}
          type="date"
          value={date}
          onChange={(event) => onDateChange(event.target.value)}
          required
        />
      </label>

      <label className="col-span-2 block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("common.category")}
        </span>
        <select
          className={inputClassName}
          value={type}
          onChange={(event) =>
            onTypeChange(event.target.value as CreditCardTransactionType)
          }
        >
          {TRANSACTION_TYPES.map((value) => (
            <option key={value} value={value}>
              {getCreditTransactionTypeLabel(value, lang)}
            </option>
          ))}
        </select>
      </label>

      <label className="col-span-1 block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("common.amount")}
        </span>
        <input
          className={inputClassName}
          type="number"
          min={0}
          step="0.01"
          value={amount}
          onChange={(event) => onAmountChange(event.target.value)}
          required
        />
      </label>

      <label className="col-span-3 block space-y-1.5">
        <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
          {t("common.description")}
        </span>
        <input
          className={inputClassName}
          value={description}
          onChange={(event) => onDescriptionChange(event.target.value)}
          placeholder={t("common.optional")}
        />
      </label>
    </div>
  );
}

function TransactionEditForm({
  transaction,
  formId,
  onSave,
}: {
  transaction: CreditCardTransaction;
  formId: string;
  onSave: (patch: {
    type: CreditCardTransactionType;
    amount: number;
    description: string;
    occurredAt: string;
  }) => void;
}) {
  const { lang } = useLocale();
  const [type, setType] = useState(transaction.type);
  const [amount, setAmount] = useState(String(transaction.amount));
  const [description, setDescription] = useState(transaction.description);
  const [date, setDate] = useState(toDateInputValue(transaction.occurredAt));

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    onSave({
      type,
      amount: parsedAmount,
      description: description.trim() || getCreditTransactionTypeLabel(type, lang),
      occurredAt: new Date(`${date}T12:00:00.000Z`).toISOString(),
    });
  }

  return (
    <form id={formId} onSubmit={handleSubmit}>
      <BubbleCard className="mx-1 space-y-3 p-3">
        <TransactionFields
          type={type}
          amount={amount}
          description={description}
          date={date}
          onTypeChange={setType}
          onAmountChange={setAmount}
          onDescriptionChange={setDescription}
          onDateChange={setDate}
        />
      </BubbleCard>
    </form>
  );
}

function TransactionRow({
  transaction,
  isEditing,
  editFormId,
  onEdit,
  onCancel,
}: {
  transaction: CreditCardTransaction;
  isEditing: boolean;
  editFormId: string;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const { lang, t } = useLocale();

  return (
    <div className="border-b border-white/40 last:border-b-0">
      <div className="flex items-center justify-between gap-3 px-4 py-3">
        <div className="min-w-0">
          <p className="truncate text-sm font-medium text-zinc-900">
            {transaction.description}
          </p>
          <p className="mt-0.5 text-xs text-zinc-500">
            {getCreditTransactionTypeLabel(transaction.type, lang)} ·{" "}
            {formatDate(transaction.occurredAt)}
          </p>
        </div>

        <div className="flex shrink-0 items-center gap-1">
          <p
            className={`text-sm font-semibold tabular-nums ${TYPE_TONES[transaction.type]}`}
          >
            {transaction.type === "payment" ? "−" : "+"}
            <UsdAmount amount={transaction.amount} exact />
          </p>

          {isEditing ? (
            <>
              <button
                type="submit"
                form={editFormId}
                className={`${inlineEditIconButtonClassName} text-[#5DAA8C] hover:bg-[#5DAA8C]/10 hover:text-[#48946F]`}
                aria-label={t("common.save")}
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                className={inlineEditIconButtonClassName}
                aria-label={t("common.cancel")}
                onClick={onCancel}
              >
                <CloseIcon />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={inlineEditIconButtonClassName}
              aria-label={t("credit.transactions.editAria")}
              onClick={onEdit}
            >
              <PencilIcon />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export function CreditCardTransactionsPanel({ cardId }: { cardId: string }) {
  const { lang, t } = useLocale();
  const { getCard, updateCard } = useCreditCards();
  const card = getCard(cardId);
  const { transactions, addTransaction, updateTransaction } =
    useCreditCardTransactions(cardId);
  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);
  const [type, setType] = useState<CreditCardTransactionType>("purchase");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setAddError(null);

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      setAddError(t("credit.transactions.errorAmount"));
      return;
    }

    if (!card) {
      setAddError(t("credit.transactions.errorCardNotFound"));
      return;
    }

    addTransaction({
      type,
      amount: parsedAmount,
      description: description.trim() || getCreditTransactionTypeLabel(type, lang),
      occurredAt: new Date(`${date}T12:00:00.000Z`).toISOString(),
    });

    const nextBalance =
      type === "payment"
        ? Math.max(0, card.balance - parsedAmount)
        : card.balance + parsedAmount;

    updateCard(cardId, { balance: nextBalance });

    setAmount("");
    setDescription("");
    setOpen(false);
  }

  function startEditing(transactionId: string) {
    setOpen(false);
    setEditingId(transactionId);
  }

  function cancelEditing() {
    setEditingId(null);
  }

  function saveEditing(
    transactionId: string,
    patch: {
      type: CreditCardTransactionType;
      amount: number;
      description: string;
      occurredAt: string;
    }
  ) {
    updateTransaction(transactionId, patch);
    setEditingId(null);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">{t("credit.tabs.transactions")}</p>
        <BubbleAddButton
          ariaLabel={
            open ? t("credit.transactions.closeFormAria") : t("credit.transactions.addAria")
          }
          active={open}
          onClick={() => {
            setEditingId(null);
            setOpen((current) => !current);
          }}
        />
      </div>

      {open ? (
        <form onSubmit={handleAdd}>
          <BubbleCard className="space-y-3 p-4">
            <TransactionFields
              type={type}
              amount={amount}
              description={description}
              date={date}
              onTypeChange={setType}
              onAmountChange={setAmount}
              onDescriptionChange={setDescription}
              onDateChange={setDate}
            />

            <button
              type="submit"
              className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              {t("credit.transactions.submit")}
            </button>

            {addError ? (
              <p className="text-sm font-medium text-rose-600" role="alert">
                {addError}
              </p>
            ) : null}
          </BubbleCard>
        </form>
      ) : null}

      {transactions.length === 0 ? (
        <BubbleCard className="border-dashed px-4 py-8 text-center text-sm text-zinc-500">
          {t("credit.transactions.empty")}
        </BubbleCard>
      ) : (
        <BubbleCard className="py-0">
          {transactions.map((transaction) => {
            const isEditing = editingId === transaction.id;
            const formId = transactionEditFormId(transaction.id);

            return (
              <div key={transaction.id}>
                <TransactionRow
                  transaction={transaction}
                  isEditing={isEditing}
                  editFormId={formId}
                  onEdit={() => startEditing(transaction.id)}
                  onCancel={cancelEditing}
                />

                {isEditing ? (
                  <div className="pb-3">
                    <TransactionEditForm
                      transaction={transaction}
                      formId={formId}
                      onSave={(patch) => saveEditing(transaction.id, patch)}
                    />
                  </div>
                ) : null}
              </div>
            );
          })}
        </BubbleCard>
      )}
    </div>
  );
}
