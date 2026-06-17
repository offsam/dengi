"use client";

import { DebitBankFormFields } from "@/app/components/debit-bank-form-fields";
import { DebitCashSimpleFormFields } from "@/app/components/debit-cash-simple-form-fields";
import { DebitCryptoFormFields } from "@/app/components/debit-crypto-form-fields";
import type { DebitCashAccount } from "@/lib/dashboard/debit-accounts";

export function DebitCashFormFields({
  draft,
  onPatch,
  readOnly = false,
  addFlow = false,
}: {
  draft: DebitCashAccount;
  onPatch: (patch: Partial<DebitCashAccount>) => void;
  readOnly?: boolean;
  addFlow?: boolean;
}) {
  if (draft.kind === "cash") {
    return (
      <DebitCashSimpleFormFields draft={draft} onPatch={onPatch} readOnly={readOnly} />
    );
  }

  if (draft.kind === "crypto") {
    return (
      <DebitCryptoFormFields
        draft={draft}
        onPatch={onPatch}
        readOnly={readOnly}
        addFlow={addFlow}
      />
    );
  }

  return (
    <DebitBankFormFields
      draft={draft}
      onPatch={onPatch}
      readOnly={readOnly}
      addFlow={addFlow}
    />
  );
}
