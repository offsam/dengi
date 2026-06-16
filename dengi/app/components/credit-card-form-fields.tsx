import { UsdAmountInput } from "@/app/components/usd-amount";
import { BANKS, isOtherBank, POPULAR_BANK_IDS, type BankId } from "@/lib/bank-logos";
import type { CreditCard } from "@/lib/credit-cards/types";

type FieldProps = {
  label: string;
  children: React.ReactNode;
  hint?: string;
};

export function CreditCardField({ label, children, hint }: FieldProps) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </span>
      {children}
      {hint ? <span className="block text-xs text-zinc-400">{hint}</span> : null}
    </label>
  );
}

export const creditCardInputClassName =
  "w-full rounded-xl border border-zinc-200 bg-white px-3 py-2.5 text-sm text-zinc-900 outline-none transition-colors focus:border-zinc-400";

function CreditCardUsdInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  return (
    <div className={`${creditCardInputClassName} flex items-center justify-start py-0 pl-3 pr-3`}>
      <UsdAmountInput
        value={value}
        onChange={onChange}
        parse={toCreditCardNumber}
        digitsClassName="w-full min-w-0 flex-1"
        className="w-full text-sm"
      />
    </div>
  );
}

export function toCreditCardNumber(value: string, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function CreditCardFormFields({
  draft,
  onPatch,
}: {
  draft: CreditCard;
  onPatch: (patch: Partial<CreditCard>) => void;
}) {
  const showCustomBankName = isOtherBank(draft.bankId);

  return (
    <>
      <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Основное</h2>

        <CreditCardField label="Название карты">
          <input
            className={creditCardInputClassName}
            value={draft.name}
            onChange={(event) => onPatch({ name: event.target.value })}
            placeholder="Sapphire Preferred"
            required
          />
        </CreditCardField>

        <CreditCardField label="Банк">
          <select
            className={creditCardInputClassName}
            value={draft.bankId}
            onChange={(event) => {
              const bankId = event.target.value as BankId;
              onPatch({
                bankId,
                customBankName: isOtherBank(bankId)
                  ? draft.customBankName ?? ""
                  : undefined,
              });
            }}
          >
            {POPULAR_BANK_IDS.map((bankId) => (
              <option key={bankId} value={bankId}>
                {BANKS[bankId].name}
              </option>
            ))}
            <option value="other">{BANKS.other.name}</option>
          </select>
        </CreditCardField>

        {showCustomBankName ? (
          <CreditCardField label="Название банка">
            <input
              className={creditCardInputClassName}
              value={draft.customBankName ?? ""}
              onChange={(event) => onPatch({ customBankName: event.target.value })}
              placeholder="Например, Capital One"
              required
            />
          </CreditCardField>
        ) : null}
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Балансы</h2>

        <div className="grid grid-cols-2 gap-3">
          <CreditCardField label="Текущий баланс">
            <CreditCardUsdInput
              value={draft.balance}
              onChange={(balance) => onPatch({ balance })}
            />
          </CreditCardField>

          <CreditCardField label="Предыдущий баланс">
            <CreditCardUsdInput
              value={draft.previousBalance}
              onChange={(previousBalance) => onPatch({ previousBalance })}
            />
          </CreditCardField>

          <CreditCardField label="Кредитный лимит">
            <CreditCardUsdInput
              value={draft.limit}
              onChange={(limit) => onPatch({ limit })}
            />
          </CreditCardField>

          <CreditCardField label="Мин. платёж">
            <CreditCardUsdInput
              value={draft.minPayment}
              onChange={(minPayment) => onPatch({ minPayment })}
            />
          </CreditCardField>
        </div>
      </section>

      <section className="space-y-4 rounded-2xl border border-zinc-200/80 bg-white p-4 shadow-sm">
        <h2 className="text-sm font-semibold text-zinc-900">Условия</h2>

        <div className="grid grid-cols-2 gap-3">
          <CreditCardField label="Годовая ставка, %">
            <input
              className={creditCardInputClassName}
              type="number"
              min={0}
              step="0.01"
              value={draft.apr}
              onChange={(event) =>
                onPatch({ apr: toCreditCardNumber(event.target.value) })
              }
              required
            />
          </CreditCardField>

          <CreditCardField label="Дней до срока">
            <input
              className={creditCardInputClassName}
              type="number"
              min={0}
              step="1"
              value={draft.daysUntilDue}
              onChange={(event) =>
                onPatch({
                  daysUntilDue: toCreditCardNumber(event.target.value),
                })
              }
              required
            />
          </CreditCardField>
        </div>

        <CreditCardField
          label="Подпись срока на карте"
          hint='Как показывается на плитке, например «22 июн»'
        >
          <input
            className={creditCardInputClassName}
            value={draft.dueDate}
            onChange={(event) => onPatch({ dueDate: event.target.value })}
            placeholder="22 июн"
            required
          />
        </CreditCardField>
      </section>
    </>
  );
}
