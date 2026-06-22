"use client";

import { BubbleCard } from "@/app/components/bubble-card";
import { ReadonlyFormValue } from "@/app/components/editable-form-value";
import {
  FormRowEnd,
  PercentAmountInput,
  UsdAmount,
  UsdAmountInput,
} from "@/app/components/usd-amount";
import { APP_BUBBLE_INPUT, APP_BUBBLE_INSET_CONTROL } from "@/lib/app-theme";
import { BANKS, isOtherBank, POPULAR_BANK_IDS, type BankId } from "@/lib/bank-logos";
import type { CreditCard } from "@/lib/credit-cards/types";
import { calculateMinimumPayment } from "@/lib/credit-cards/min-payment";
import {
  formatPaymentDueDayDisplay,
  patchPaymentDueDay,
  resolvePaymentDueDay,
} from "@/lib/credit-cards/payment-due-date";
import { useLocale } from "@/app/components/locale-provider";

const fieldClassName =
  "w-full min-w-0 border-0 bg-transparent py-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 placeholder:text-zinc-300 focus:ring-0";

const textInputClassName = `${fieldClassName} max-w-full`;

const numberInputClassName = `${fieldClassName} tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`;

function FormSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {title}
      </h2>
      <BubbleCard>{children}</BubbleCard>
    </section>
  );
}

function EditRow({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 border-b border-white/35 px-4 py-2.5 transition-colors duration-200 last:border-b-0">
      <span className="w-[42%] shrink-0 text-[15px] leading-tight text-zinc-900">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
      {hint ? <span className="sr-only">{hint}</span> : null}
    </div>
  );
}

function InfoValue({ children }: { children: React.ReactNode }) {
  return (
    <ReadonlyFormValue>
      <span className="text-[15px] leading-none text-zinc-700">{children}</span>
    </ReadonlyFormValue>
  );
}

function DirectNumberInput({
  value,
  onChange,
  min,
  max,
  suffix,
  widthClassName = "w-[5.5rem]",
  highlighted = false,
  highlightClassName = APP_BUBBLE_INSET_CONTROL,
}: {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  suffix?: string;
  widthClassName?: string;
  highlighted?: boolean;
  highlightClassName?: string;
}) {
  return (
    <FormRowEnd>
      <span
        className={`inline-flex items-center whitespace-nowrap text-[15px] leading-none text-zinc-900 tabular-nums ${
          highlighted ? highlightClassName : ""
        }`}
      >
        <input
          type="number"
          className={`${numberInputClassName} ${widthClassName}`}
          value={value || ""}
          min={min}
          max={max}
          onChange={(event) => onChange(toCreditCardNumber(event.target.value, value))}
        />
        {suffix ? (
          <span className="ml-0.5 shrink-0 text-zinc-400" aria-hidden>
            {suffix}
          </span>
        ) : null}
      </span>
    </FormRowEnd>
  );
}

function DirectTextInput({
  value,
  onChange,
  placeholder,
  widthClassName = "w-[8rem]",
  highlighted = false,
  highlightClassName = APP_BUBBLE_INSET_CONTROL,
}: {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  widthClassName?: string;
  highlighted?: boolean;
  highlightClassName?: string;
}) {
  return (
    <FormRowEnd>
      <span
        className={`inline-flex max-w-full items-center text-[15px] leading-none text-zinc-900 ${
          highlighted ? highlightClassName : ""
        }`}
      >
        <input
          type="text"
          className={`${textInputClassName} ${widthClassName}`}
          value={value}
          placeholder={placeholder}
          onChange={(event) => onChange(event.target.value)}
        />
      </span>
    </FormRowEnd>
  );
}

function EditableUsdRow({
  value,
  onChange,
  readOnly,
  editable,
  activeControlClassName,
}: {
  value: number;
  onChange: (value: number) => void;
  readOnly: boolean;
  editable: boolean;
  activeControlClassName: string;
}) {
  if (readOnly) {
    return (
      <ReadonlyFormValue>
        <UsdAmount amount={value} exact />
      </ReadonlyFormValue>
    );
  }

  return (
    <FormRowEnd>
      <span className={editable ? activeControlClassName : ""}>
        <UsdAmountInput
          value={value}
          onChange={onChange}
          parse={toCreditCardNumber}
          digitsClassName="w-[5.5rem]"
        />
      </span>
    </FormRowEnd>
  );
}

export const creditCardInputClassName = APP_BUBBLE_INPUT;

export function toCreditCardNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function resolveBankLabel(draft: CreditCard) {
  if (isOtherBank(draft.bankId)) {
    return draft.customBankName?.trim() || BANKS.other.name;
  }

  return BANKS[draft.bankId]?.name ?? draft.bankId;
}

function formatAprInput(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return Number.isInteger(value) ? String(value) : value.toFixed(2);
}

export function CreditCardFormFields({
  draft,
  onPatch,
  addFlow = false,
  readOnly = false,
}: {
  draft: CreditCard;
  onPatch: (patch: Partial<CreditCard>) => void;
  /** Форма добавления: сначала банк, потом остальные поля */
  addFlow?: boolean;
  readOnly?: boolean;
}) {
  const { lang, t } = useLocale();
  const showCustomBankName = isOtherBank(draft.bankId);
  const bankReady = addFlow
    ? Boolean(draft.bankId) && (!showCustomBankName || Boolean(draft.customBankName?.trim()))
    : true;
  const editable = addFlow ? true : !readOnly;
  const activeControlClassName = editable ? APP_BUBBLE_INSET_CONTROL : "";
  const activeSelectClassName = `${fieldClassName} max-w-full truncate ${
    editable ? activeControlClassName : ""
  }`;
  const computedMinPayment = calculateMinimumPayment({
    balance: draft.balance,
    apr: draft.apr,
    contract: draft.contract,
  });

  return (
    <div className="space-y-5">
      <FormSection title={t("common.sectionMain")}>
        <EditRow label={t("credit.form.bank")}>
          {readOnly && !addFlow ? (
            <InfoValue>{resolveBankLabel(draft)}</InfoValue>
          ) : (
            <FormRowEnd>
              <select
                className={activeSelectClassName}
                value={draft.bankId || ""}
                onChange={(event) => {
                  const bankId = event.target.value as BankId;
                  onPatch({
                    bankId,
                    customBankName: isOtherBank(bankId)
                      ? draft.customBankName ?? ""
                      : undefined,
                    name: addFlow ? "" : draft.name,
                  });
                }}
                required
              >
                {addFlow ? (
                  <option value="" disabled>
                    {t("credit.form.bankPlaceholder")}
                  </option>
                ) : null}
                {POPULAR_BANK_IDS.map((bankId) => (
                  <option key={bankId} value={bankId}>
                    {BANKS[bankId].name}
                  </option>
                ))}
                <option value="other">{BANKS.other.name}</option>
              </select>
            </FormRowEnd>
          )}
        </EditRow>

        {showCustomBankName ? (
          <EditRow label={t("credit.form.customBankName")}>
            {readOnly && !addFlow ? (
              <InfoValue>{draft.customBankName?.trim() || t("common.dash")}</InfoValue>
            ) : (
              <DirectTextInput
                value={draft.customBankName ?? ""}
                placeholder="Capital One"
                highlighted={editable}
                highlightClassName={activeControlClassName}
                onChange={(customBankName) => onPatch({ customBankName })}
              />
            )}
          </EditRow>
        ) : null}

        {bankReady ? (
          <>
            <EditRow label={t("credit.form.cardName")}>
              {readOnly && !addFlow ? (
                <InfoValue>{draft.name || t("common.dash")}</InfoValue>
              ) : (
                <DirectTextInput
                  value={draft.name}
                  placeholder="Sapphire Preferred"
                  widthClassName="w-[9rem]"
                  highlighted={editable}
                  highlightClassName={activeControlClassName}
                  onChange={(name) => onPatch({ name })}
                />
              )}
            </EditRow>

            <EditRow label={t("credit.form.limit")}>
              <EditableUsdRow
                value={draft.limit}
                onChange={(limit) => onPatch({ limit })}
                readOnly={readOnly && !addFlow}
                editable={editable}
                activeControlClassName={activeControlClassName}
              />
            </EditRow>

            <EditRow label={t("credit.form.apr")}>
              {readOnly && !addFlow ? (
                <InfoValue>{formatAprInput(draft.apr)}%</InfoValue>
              ) : (
                <FormRowEnd>
                  <span className={editable ? activeControlClassName : ""}>
                    <PercentAmountInput
                      value={formatAprInput(draft.apr)}
                      fallback={draft.apr}
                      parse={toCreditCardNumber}
                      step={0.01}
                      max={100}
                      onChange={(apr) => onPatch({ apr })}
                    />
                  </span>
                </FormRowEnd>
              )}
            </EditRow>

            <EditRow label={t("credit.form.paymentDate")}>
              {readOnly && !addFlow ? (
                <InfoValue>
                  {formatPaymentDueDayDisplay(resolvePaymentDueDay(draft), lang)}
                </InfoValue>
              ) : (
                <DirectNumberInput
                  value={resolvePaymentDueDay(draft)}
                  min={1}
                  max={31}
                  suffix={t("credit.form.daySuffix")}
                  widthClassName="w-[3.5rem]"
                  highlighted={editable}
                  highlightClassName={activeControlClassName}
                  onChange={(paymentDueDay) => onPatch(patchPaymentDueDay(paymentDueDay, lang))}
                />
              )}
            </EditRow>
            {addFlow ? (
              <p className="px-4 pb-2.5 text-xs text-zinc-500">
                {t("credit.form.paymentDayHint")}
              </p>
            ) : null}
          </>
        ) : null}
      </FormSection>

      {!addFlow || bankReady ? (
        <>
          <FormSection title={t("credit.form.sectionBalances")}>
            <EditRow label={t("credit.form.currentBalance")}>
              <EditableUsdRow
                value={draft.balance}
                onChange={(balance) => onPatch({ balance })}
                readOnly={readOnly && !addFlow}
                editable={editable}
                activeControlClassName={activeControlClassName}
              />
            </EditRow>

            <EditRow label={t("credit.form.previousBalance")}>
              <EditableUsdRow
                value={draft.previousBalance}
                onChange={(previousBalance) => onPatch({ previousBalance })}
                readOnly={readOnly && !addFlow}
                editable={editable}
                activeControlClassName={activeControlClassName}
              />
            </EditRow>

            <EditRow label={t("credit.form.minPayment")}>
              <InfoValue>
                <UsdAmount amount={computedMinPayment} exact />
              </InfoValue>
            </EditRow>
            <p className="px-4 pb-2.5 text-xs leading-relaxed text-zinc-500">
              {t("credit.form.minPaymentHint")}
            </p>
          </FormSection>
        </>
      ) : null}
    </div>
  );
}
