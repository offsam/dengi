"use client";

import { useState } from "react";
import { BubbleAddDialog } from "@/app/components/bubble-add-dialog";
import { CreditCardFormFields } from "@/app/components/credit-card-form-fields";
import { CreditCardTile } from "@/app/components/credit-card-tile";
import { isOtherBank } from "@/lib/bank-logos";
import {
  createEmptyCreditCardAddDraft,
  draftToPreviewCard,
  type CreditCardAddDraft,
} from "@/lib/credit-cards/defaults";
import {
  creditCardValidationMessage,
  normalizeCreditCardForPersist,
  validateCreditCardDraft,
} from "@/lib/credit-cards/normalize";
import type { CreditCard, CreditCardDraft } from "@/lib/credit-cards/types";

export function CreditCardAddDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (draft: CreditCardDraft) => void;
}) {
  const [draft, setDraft] = useState(createEmptyCreditCardAddDraft);
  const [error, setError] = useState<string | null>(null);

  function patchDraft(patch: Partial<CreditCardAddDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const issue = validateCreditCardDraft(draft);
    if (issue) {
      setError(creditCardValidationMessage(issue));
      return;
    }

    if (!draft.bankId) {
      setError(creditCardValidationMessage("bank"));
      return;
    }

    const bankId = draft.bankId;
    const customBankName = isOtherBank(bankId)
      ? draft.customBankName?.trim()
      : undefined;

    onAdd(
      normalizeCreditCardForPersist({
        ...draft,
        bankId,
        customBankName,
      })
    );
    onClose();
  }

  return (
    <BubbleAddDialog
      open={open}
      onClose={onClose}
      title="Добавить карту"
      titleId="add-card-title"
      closeAriaLabel="Закрыть окно добавления карты"
      submitLabel="Добавить карту"
      onSubmit={handleSubmit}
      preview={<CreditCardTile {...draftToPreviewCard(draft)} />}
    >
      <CreditCardFormFields
        draft={{ ...draft, id: "preview" } as CreditCard}
        onPatch={patchDraft}
        addFlow
      />

      {error ? (
        <p className="text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}
    </BubbleAddDialog>
  );
}
