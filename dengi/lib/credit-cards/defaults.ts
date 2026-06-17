import type { BankId } from "@/lib/bank-logos";
import { patchPaymentDueDay } from "@/lib/credit-cards/payment-due-date";
import type { CreditCard, CreditCardDraft } from "./types";

/** Черновик в форме добавления — банк выбирается первым */
export type CreditCardAddDraft = Omit<CreditCardDraft, "bankId"> & {
  bankId: BankId | "";
};

const DEFAULT_PAYMENT_DUE_DAY = 15;

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
    ...patchPaymentDueDay(DEFAULT_PAYMENT_DUE_DAY),
  };
}

export function createEmptyCreditCardAddDraft(): CreditCardAddDraft {
  return {
    bankId: "",
    name: "",
    balance: 0,
    limit: 0,
    apr: 0,
    dueDate: "",
    daysUntilDue: 0,
    minPayment: 0,
    previousBalance: 0,
    ...patchPaymentDueDay(DEFAULT_PAYMENT_DUE_DAY),
  };
}

export function draftToPreviewCard(
  draft: CreditCardDraft | CreditCardAddDraft
): CreditCard {
  const bankId = draft.bankId || "chase";

  return {
    ...draft,
    bankId,
    id: "preview",
    name: draft.name.trim() || "Новая карта",
    dueDate: draft.dueDate.trim() || "—",
  };
}

export function isCreditCardBankReady(
  draft: Pick<CreditCardAddDraft, "bankId" | "customBankName">
) {
  if (!draft.bankId) {
    return false;
  }

  if (draft.bankId === "other") {
    return Boolean(draft.customBankName?.trim());
  }

  return true;
}
