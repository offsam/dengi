"use client";

import { BubbleCard } from "@/app/components/bubble-card";
import { ReadonlyFormValue } from "@/app/components/editable-form-value";
import { FormRowEnd, UsdAmount, UsdAmountInput } from "@/app/components/usd-amount";
import { APP_BUBBLE_INSET_CONTROL } from "@/lib/app-theme";
import type { DebitCashAccount } from "@/lib/dashboard/debit-accounts";
import {
  CRYPTO_EXCHANGES,
  POPULAR_CRYPTO_EXCHANGE_IDS,
  resolveDebitExchangeLabel,
  type CryptoExchangeId,
} from "@/lib/dashboard/debit-accounts";
import { toCreditCardNumber } from "@/app/components/credit-card-form-fields";

const fieldClassName =
  "w-full min-w-0 border-0 bg-transparent py-0 text-right text-[15px] leading-none text-zinc-900 outline-none ring-0 placeholder:text-zinc-300 focus:ring-0";

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
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 border-b border-white/35 px-4 py-2.5 last:border-b-0">
      <span className="w-[42%] shrink-0 text-[15px] leading-tight text-zinc-900">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

function IncognitoToggle({
  checked,
  onChange,
  disabled = false,
}: {
  checked: boolean;
  onChange: (value: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => onChange(!checked)}
      className={`relative h-7 w-12 shrink-0 rounded-full transition-colors ${
        checked ? "bg-zinc-900" : "bg-zinc-300"
      } ${disabled ? "opacity-50" : ""}`}
    >
      <span
        className={`absolute top-0.5 size-6 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-5" : "translate-x-0.5"
        }`}
      />
    </button>
  );
}

export function DebitCryptoFormFields({
  draft,
  onPatch,
  addFlow = false,
  readOnly = false,
}: {
  draft: DebitCashAccount;
  onPatch: (patch: Partial<DebitCashAccount>) => void;
  addFlow?: boolean;
  readOnly?: boolean;
}) {
  const incognito = draft.incognito ?? false;
  const showCustomExchange = draft.exchangeId === "other";
  const editable = addFlow ? true : !readOnly;
  const activeSelectClassName = `${fieldClassName} max-w-full truncate ${
    editable ? APP_BUBBLE_INSET_CONTROL : ""
  }`;

  return (
    <div className="space-y-5">
      <FormSection title="Основное">
        <EditRow label="Инкогнито">
          <div className="flex items-center gap-2">
            <span className="text-xs text-zinc-500">Скрыть биржу</span>
            <IncognitoToggle
              checked={incognito}
              disabled={readOnly && !addFlow}
              onChange={(value) =>
                onPatch({
                  incognito: value,
                  exchangeId: value ? undefined : draft.exchangeId,
                  customExchangeName: value ? undefined : draft.customExchangeName,
                })
              }
            />
          </div>
        </EditRow>

        {!incognito ? (
          <>
            <EditRow label="Биржа">
              {readOnly && !addFlow ? (
                <ReadonlyFormValue>
                  <span className="text-[15px] text-zinc-700">
                    {resolveDebitExchangeLabel(draft) ?? "Не указана"}
                  </span>
                </ReadonlyFormValue>
              ) : (
                <FormRowEnd>
                  <select
                    className={activeSelectClassName}
                    value={draft.exchangeId ?? ""}
                    onChange={(event) => {
                      const value = event.target.value as CryptoExchangeId | "";
                      onPatch({
                        exchangeId: value || undefined,
                        customExchangeName:
                          value === "other" ? draft.customExchangeName ?? "" : undefined,
                      });
                    }}
                  >
                    <option value="">Не указывать</option>
                    {POPULAR_CRYPTO_EXCHANGE_IDS.map((exchangeId) => (
                      <option key={exchangeId} value={exchangeId}>
                        {CRYPTO_EXCHANGES[exchangeId].name}
                      </option>
                    ))}
                    <option value="other">{CRYPTO_EXCHANGES.other.name}</option>
                  </select>
                </FormRowEnd>
              )}
            </EditRow>

            {showCustomExchange ? (
              <EditRow label="Название биржи">
                <FormRowEnd>
                  <span className={APP_BUBBLE_INSET_CONTROL}>
                    <input
                      type="text"
                      className={`${fieldClassName} w-[8rem]`}
                      value={draft.customExchangeName ?? ""}
                      disabled={readOnly && !addFlow}
                      placeholder="Bybit"
                      onChange={(event) => onPatch({ customExchangeName: event.target.value })}
                    />
                  </span>
                </FormRowEnd>
              </EditRow>
            ) : null}

            <p className="px-4 pb-2.5 text-xs leading-relaxed text-zinc-500">
              Биржа необязательна — можно оставить пустым или включить инкогнито.
            </p>
          </>
        ) : (
          <p className="px-4 pb-2.5 text-xs leading-relaxed text-zinc-500">
            Биржа не будет видна на карточке.
          </p>
        )}

        <EditRow label="Название">
          {readOnly && !addFlow ? (
            <ReadonlyFormValue>
              <span className="text-[15px] text-zinc-700">{draft.name || "—"}</span>
            </ReadonlyFormValue>
          ) : (
            <FormRowEnd>
              <span className={APP_BUBBLE_INSET_CONTROL}>
                <input
                  type="text"
                  className={`${fieldClassName} w-[9rem]`}
                  value={draft.name}
                  placeholder="Криптокошелёк"
                  disabled={readOnly && !addFlow}
                  onChange={(event) => onPatch({ name: event.target.value })}
                />
              </span>
            </FormRowEnd>
          )}
        </EditRow>
      </FormSection>

      <FormSection title="Баланс">
        <EditRow label="Сумма">
          {readOnly && !addFlow ? (
            <ReadonlyFormValue>
              <UsdAmount amount={draft.balance} exact />
            </ReadonlyFormValue>
          ) : (
            <FormRowEnd>
              <span className={APP_BUBBLE_INSET_CONTROL}>
                <UsdAmountInput
                  value={draft.balance}
                  onChange={(balance) => onPatch({ balance })}
                  parse={toCreditCardNumber}
                  digitsClassName="w-[5.5rem]"
                />
              </span>
            </FormRowEnd>
          )}
        </EditRow>
      </FormSection>
    </div>
  );
}
