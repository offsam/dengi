"use client";

import { BubbleCard } from "@/app/components/bubble-card";
import { ReadonlyFormValue } from "@/app/components/editable-form-value";
import { FormRowEnd, UsdAmount, UsdAmountInput } from "@/app/components/usd-amount";
import { useLocale } from "@/app/components/locale-provider";
import { APP_BUBBLE_INSET_CONTROL } from "@/lib/app-theme";
import type { DebitCashAccount } from "@/lib/dashboard/debit-accounts";
import { toCreditCardNumber } from "@/app/components/credit-card-form-fields";

function EditRow({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-[48px] items-center gap-3 px-4 py-2.5">
      <span className="w-[42%] shrink-0 text-[15px] leading-tight text-zinc-900">{label}</span>
      <div className="flex min-w-0 flex-1 items-center justify-end">{children}</div>
    </div>
  );
}

export function DebitCashSimpleFormFields({
  draft,
  onPatch,
  readOnly = false,
}: {
  draft: DebitCashAccount;
  onPatch: (patch: Partial<DebitCashAccount>) => void;
  readOnly?: boolean;
}) {
  const { t } = useLocale();

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {t("debit.kind.cash")}
      </h2>
      <BubbleCard>
        <EditRow label={t("common.amount")}>
          {readOnly ? (
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
      </BubbleCard>
      {!readOnly ? (
        <p className="px-1 text-xs leading-relaxed text-zinc-500">{t("debit.cashForm.hint")}</p>
      ) : null}
    </section>
  );
}
