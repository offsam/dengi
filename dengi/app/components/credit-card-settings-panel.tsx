"use client";

import { CreditCardContractUpload } from "@/app/components/credit-card-contract-upload";
import { CreditCardFormFields } from "@/app/components/credit-card-form-fields";
import { isOtherBank } from "@/lib/bank-logos";
import type { CreditCard } from "@/lib/credit-cards/types";

export function CreditCardSettingsPanel({
  card,
  draft,
  onDraftChange,
  onSave,
  onPersist,
}: {
  card: CreditCard;
  draft: CreditCard;
  onDraftChange: (patch: Partial<CreditCard>) => void;
  onSave: (next: CreditCard) => void;
  onPersist: (patch: Partial<CreditCard>) => void;
}) {
  return (
    <form
      className="space-y-5"
      onSubmit={(event) => {
        event.preventDefault();

        if (isOtherBank(draft.bankId) && !draft.customBankName?.trim()) {
          return;
        }

        onSave({
          ...draft,
          customBankName: isOtherBank(draft.bankId)
            ? draft.customBankName?.trim()
            : undefined,
        });
      }}
    >
      <CreditCardFormFields draft={draft} onPatch={onDraftChange} />

      <CreditCardContractUpload
        cardId={card.id}
        card={draft}
        contract={draft.contract}
        onImport={({ contract: nextContract, cardPatch }) => {
          const patch = { ...cardPatch, contract: nextContract };
          onDraftChange(patch);
          onPersist(patch);
        }}
        onContractRemove={() => {
          onDraftChange({ contract: undefined });
          onPersist({ contract: undefined });
        }}
      />

      <button
        type="submit"
        className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
      >
        Сохранить настройки
      </button>
    </form>
  );
}
