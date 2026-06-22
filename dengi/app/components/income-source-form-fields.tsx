"use client";

import { BubbleCard } from "@/app/components/bubble-card";
import { UsdAmountInput } from "@/app/components/usd-amount";
import { useLocale } from "@/app/components/locale-provider";
import { APP_BUBBLE_INPUT } from "@/lib/app-theme";
import { getIncomeKindLabel } from "@/lib/i18n/labels";
import {
  INCOME_SOURCE_KIND_PRESETS,
  type IncomeSource,
  type IncomeSourceKind,
} from "@/lib/income-sources/types";

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

export function IncomeSourceFormFields({
  draft,
  customKindLabel,
  onPatch,
  onKindChange,
  onCustomKindLabelChange,
  readOnly = false,
}: {
  draft: IncomeSource;
  customKindLabel: string;
  onPatch: (patch: Partial<IncomeSource>) => void;
  onKindChange: (kind: IncomeSourceKind) => void;
  onCustomKindLabelChange: (value: string) => void;
  readOnly?: boolean;
}) {
  const { lang, t } = useLocale();
  const showCustomKind = draft.kind === "other";

  return (
    <BubbleCard className="space-y-4 p-4">
      <h2 className="text-sm font-semibold text-zinc-900">{t("income.form.sectionTitle")}</h2>

      <Field label={t("income.card.type")}>
        <select
          className={inputClassName}
          value={draft.kind}
          disabled={readOnly}
          onChange={(event) => onKindChange(event.target.value as IncomeSourceKind)}
        >
          {INCOME_SOURCE_KIND_PRESETS.map((preset) => (
            <option key={preset.kind} value={preset.kind}>
              {getIncomeKindLabel(preset.kind, lang)}
            </option>
          ))}
        </select>
      </Field>

      {showCustomKind ? (
        <Field label={t("income.form.customKindLabel")}>
          <input
            className={inputClassName}
            value={customKindLabel}
            disabled={readOnly}
            onChange={(event) => onCustomKindLabelChange(event.target.value)}
            placeholder={t("income.form.customKindPlaceholder")}
            required
          />
        </Field>
      ) : null}

      <Field label={t("common.name")}>
        <input
          className={inputClassName}
          value={draft.name}
          disabled={readOnly}
          onChange={(event) => onPatch({ name: event.target.value })}
          placeholder={t("income.form.namePlaceholder")}
          required
        />
      </Field>

      <Field label={t("income.form.monthlyAmount")}>
        <UsdAmountInput
          className={inputClassName}
          value={draft.monthlyAmount}
          disabled={readOnly}
          onChange={(monthlyAmount) => onPatch({ monthlyAmount })}
          min={0}
        />
      </Field>
    </BubbleCard>
  );
}
