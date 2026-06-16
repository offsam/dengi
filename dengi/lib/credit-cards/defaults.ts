import type { CreditCard, CreditCardDraft } from "./types";

export function createEmptyCreditCardDraft(): CreditCardDraft {
  return {
    bankId: "chase",
    name: "",
    balance: 0,
    limit: 0,
    apr: 0,
    dueDate: "",
    daysUntilDue: 0,
    minPayment: 0,
    previousBalance: 0,
  };
}

export function draftToPreviewCard(draft: CreditCardDraft): CreditCard {
  return {
    ...draft,
    id: "preview",
    name: draft.name.trim() || "Новая карта",
    dueDate: draft.dueDate.trim() || "—",
  };
}
