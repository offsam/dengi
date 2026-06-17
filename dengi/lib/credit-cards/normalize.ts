import { isOtherBank } from "@/lib/bank-logos";
import { calculateMinimumPayment } from "@/lib/credit-cards/min-payment";
import {
  patchPaymentDueDay,
  resolvePaymentDueDay,
} from "@/lib/credit-cards/payment-due-date";
import type { CreditCardDraft } from "@/lib/credit-cards/types";
import type { CreditCardAddDraft } from "./defaults";

export type CreditCardValidationIssue =
  | "bank"
  | "customBank"
  | "name"
  | "paymentDay";

export function validateCreditCardDraft(
  draft: CreditCardDraft | CreditCardAddDraft
): CreditCardValidationIssue | null {
  if (!draft.bankId) {
    return "bank";
  }

  if (isOtherBank(draft.bankId) && !draft.customBankName?.trim()) {
    return "customBank";
  }

  if (!draft.name.trim()) {
    return "name";
  }

  if (resolvePaymentDueDay(draft) <= 0) {
    return "paymentDay";
  }

  return null;
}

export function creditCardValidationMessage(issue: CreditCardValidationIssue) {
  switch (issue) {
    case "bank":
      return "Выберите банк.";
    case "customBank":
      return "Укажите название банка.";
    case "name":
      return "Укажите название карты.";
    case "paymentDay":
      return "Укажите число месяца для платежа (1–31).";
  }
}

/** Нормализация перед сохранением: дата платежа и мин. платёж из баланса */
export function normalizeCreditCardForPersist(
  draft: CreditCardDraft | CreditCardAddDraft
): CreditCardDraft {
  const paymentDueDay = resolvePaymentDueDay(draft);
  const paymentPatch = patchPaymentDueDay(paymentDueDay);
  const balance = Math.max(0, draft.balance);
  const bankId = draft.bankId as CreditCardDraft["bankId"];
  const minPayment = calculateMinimumPayment({
    balance,
    apr: draft.apr,
    contract: draft.contract,
  });

  return {
    ...draft,
    bankId,
    name: draft.name.trim(),
    balance,
    customBankName: isOtherBank(bankId)
      ? draft.customBankName?.trim()
      : undefined,
    ...paymentPatch,
    minPayment,
  };
}
