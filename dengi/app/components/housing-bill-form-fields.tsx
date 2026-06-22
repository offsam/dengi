"use client";

import { BubbleCard } from "@/app/components/bubble-card";
import { UsdAmountInput } from "@/app/components/usd-amount";
import { useLocale } from "@/app/components/locale-provider";
import { APP_BUBBLE_INPUT } from "@/lib/app-theme";
import type { HousingBill } from "@/lib/dashboard/housing-bills";
import { toCreditCardNumber } from "@/app/components/credit-card-form-fields";

const inputClassName = APP_BUBBLE_INPUT;

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">{label}</span>
      {children}
    </label>
  );
}

export function HousingBillFormFields({
  draft,
  onPatch,
  readOnly = false,
}: {
  draft: HousingBill;
  onPatch: (patch: Partial<HousingBill>) => void;
  readOnly?: boolean;
}) {
  const { t } = useLocale();

  return (
    <BubbleCard className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">{t("housing.form.sectionTitle")}</h2>

      <Field label={t("common.name")}>
        <input
          className={inputClassName}
          value={draft.name}
          disabled={readOnly}
          onChange={(event) => onPatch({ name: event.target.value })}
          placeholder={t("housing.form.namePlaceholder")}
          required
        />
      </Field>

      <Field label={t("housing.form.dueDate")}>
        <input
          className={inputClassName}
          value={draft.date}
          disabled={readOnly}
          onChange={(event) => onPatch({ date: event.target.value })}
          placeholder={t("housing.form.dueDatePlaceholder")}
          required
        />
      </Field>

      <Field label={t("common.amount")}>
        <div className={`${inputClassName} flex items-center justify-start py-0 pl-3 pr-3`}>
          <UsdAmountInput
            value={draft.amount}
            onChange={(value) => onPatch({ amount: value })}
            parse={toCreditCardNumber}
            digitsClassName="w-full min-w-0 flex-1"
            className="w-full text-sm"
            disabled={readOnly}
          />
        </div>
      </Field>
    </BubbleCard>
  );
}
