"use client";

import { useMemo, useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { useAutoVehicleRecords } from "@/app/hooks/use-auto-vehicle-records";
import { useCustomExpenseCategories } from "@/app/hooks/use-custom-expense-categories";
import { UsdAmount } from "@/app/components/usd-amount";
import { APP_BUBBLE_INPUT } from "@/lib/app-theme";
import { formatAppDate } from "@/lib/i18n/locale";
import { useLocale } from "@/app/components/locale-provider";
import { translatePresetName } from "@/lib/i18n/presets";
import { getAutoExpenseTypeLabel } from "@/lib/i18n/labels";
import type { AutoVehicleExpenseType } from "@/lib/auto-vehicles/records/types";
import {
  AUTO_VEHICLE_EXPENSE_LABELS,
  listBuiltInExpenseCategoryOptions,
  OTHER_EXPENSE_CATEGORY_ID,
  resolveExpenseCategoryLabel,
} from "@/lib/auto-vehicles/records/expense-labels";

const inputClassName = APP_BUBBLE_INPUT;

function formatDate(iso: string) {
  return formatAppDate(iso, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function toCustomCategoryValue(id: string) {
  return `custom:${id}`;
}

function isCustomCategoryValue(value: string) {
  return value.startsWith("custom:");
}

export function AutoVehicleExpensesPanel({
  vehicleId,
  readOnly = false,
}: {
  vehicleId: string;
  readOnly?: boolean;
}) {
  const { lang, t } = useLocale();
  const { records, addRecord } = useAutoVehicleRecords(vehicleId, "expense");
  const { categories, ensureCategory } = useCustomExpenseCategories(vehicleId);
  const [open, setOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>("fuel");
  const [customCategoryName, setCustomCategoryName] = useState("");
  const [amount, setAmount] = useState("");
  const [description, setDescription] = useState("");
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const builtInOptions = useMemo(() => listBuiltInExpenseCategoryOptions(), []);
  const isOtherSelected = selectedCategory === OTHER_EXPENSE_CATEGORY_ID;

  function resetForm() {
    setSelectedCategory("fuel");
    setCustomCategoryName("");
    setAmount("");
    setDescription("");
  }

  function handleAdd(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const parsedAmount = Number(amount);
    if (!Number.isFinite(parsedAmount) || parsedAmount <= 0) {
      return;
    }

    const occurredAt = new Date(`${date}T12:00:00.000Z`).toISOString();
    const trimmedDescription = description.trim();

    if (isOtherSelected) {
      const category = ensureCategory(customCategoryName);

      if (!category) {
        return;
      }

      addRecord({
        kind: "expense",
        customExpenseCategoryId: category.id,
        amount: parsedAmount,
        description: trimmedDescription || category.label,
        occurredAt,
      });
    } else if (isCustomCategoryValue(selectedCategory)) {
      const customCategoryId = selectedCategory.slice("custom:".length);
      const customCategory = categories.find((category) => category.id === customCategoryId);

      addRecord({
        kind: "expense",
        customExpenseCategoryId: customCategoryId,
        amount: parsedAmount,
        description: trimmedDescription || customCategory?.label || t("auto.expenseType.default"),
        occurredAt,
      });
    } else {
      const expenseType = selectedCategory as AutoVehicleExpenseType;

      addRecord({
        kind: "expense",
        expenseType,
        amount: parsedAmount,
        description: trimmedDescription || AUTO_VEHICLE_EXPENSE_LABELS[expenseType],
        occurredAt,
      });
    }

    resetForm();
    setOpen(false);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-sm font-semibold text-zinc-900">{t("auto.expenses.title")}</p>
        {readOnly ? null : (
          <BubbleAddButton
            ariaLabel={open ? t("auto.expenses.closeFormAria") : t("auto.expenses.addAria")}
            active={open}
            onClick={() => setOpen((current) => !current)}
          />
        )}
      </div>

      {!readOnly && open ? (
        <form onSubmit={handleAdd}>
          <BubbleCard className="space-y-3 p-4">
            <label className="block space-y-1.5">
              <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                {t("common.category")}
              </span>
              <select
                className={inputClassName}
                value={selectedCategory}
                onChange={(event) => {
                  setSelectedCategory(event.target.value);
                  if (event.target.value !== OTHER_EXPENSE_CATEGORY_ID) {
                    setCustomCategoryName("");
                  }
                }}
              >
                {builtInOptions.map(({ id, label }) => (
                  <option key={id} value={id}>
                    {label}
                  </option>
                ))}
                {categories.map((category) => (
                  <option key={category.id} value={toCustomCategoryValue(category.id)}>
                    {category.label}
                  </option>
                ))}
                <option value={OTHER_EXPENSE_CATEGORY_ID}>
                  {AUTO_VEHICLE_EXPENSE_LABELS.other}
                </option>
              </select>
            </label>

            {isOtherSelected ? (
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {t("auto.expenses.categoryName")}
                </span>
                <input
                  className={inputClassName}
                  value={customCategoryName}
                  onChange={(event) => setCustomCategoryName(event.target.value)}
                  placeholder={t("auto.expenses.categoryPlaceholder")}
                  required
                />
              </label>
            ) : null}

            <div className="grid grid-cols-2 gap-3">
              <label className="block space-y-1.5">
                <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
                  {t("common.amount")}
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
                  {t("common.date")}
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
                {t("common.description")}
              </span>
              <input
                className={inputClassName}
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                placeholder={t("common.optional")}
              />
            </label>

            <button
              type="submit"
              className="w-full rounded-full bg-zinc-900 px-5 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              {t("auto.expenses.addExpense")}
            </button>
          </BubbleCard>
        </form>
      ) : null}

      {records.length === 0 ? (
        <BubbleCard className="border-dashed px-4 py-8 text-center text-sm text-zinc-500">
          {t("auto.expenses.empty")}
        </BubbleCard>
      ) : (
        <BubbleCard>
          {records.map((record) => (
            <div
              key={record.id}
              className="flex items-center justify-between gap-3 border-b border-white/40 px-4 py-3 last:border-b-0"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-zinc-900">
                  {translatePresetName(record.description, lang)}
                </p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {resolveExpenseCategoryLabel(record, categories, lang)} ·{" "}
                  {formatDate(record.occurredAt)}
                </p>
              </div>
              <p className="shrink-0 text-sm font-semibold tabular-nums text-rose-600">
                <UsdAmount amount={record.amount} exact />
              </p>
            </div>
          ))}
        </BubbleCard>
      )}
    </div>
  );
}
