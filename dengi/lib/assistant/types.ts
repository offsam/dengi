import type { CreditCardDraft } from "@/lib/credit-cards/types";
import type { CreditCardTransactionType } from "@/lib/credit-cards/transactions/types";
import type { CatalogEntityKind } from "./catalog";
import { APP_LANG } from "@/lib/i18n/locale";

export type AssistantAddCardAction = {
  type: "add_card";
  draft: CreditCardDraft;
};

export type AssistantCreditCardTransactionAction = {
  type: "add_credit_card_transaction";
  cardId: string;
  cardLabel: string;
  transactionType: Extract<CreditCardTransactionType, "purchase" | "payment">;
  amount: number;
  description: string;
};

export type AssistantUnsupportedAction = {
  type: "unsupported";
  targetKind: CatalogEntityKind;
  targetLabel: string;
  message: string;
};

export type AssistantUnknownAction = {
  type: "unknown";
  raw: string;
};

export type AssistantExecutableAction =
  | AssistantAddCardAction
  | AssistantCreditCardTransactionAction;

export type AssistantAction =
  | AssistantExecutableAction
  | AssistantUnsupportedAction
  | AssistantUnknownAction;

export type AssistantMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

export type PendingConfirmation = {
  action: AssistantExecutableAction;
  prompt: string;
};

export function isAffirmative(text: string) {
  return /^(yes|y|da|да|ok|okay|confirm|подтверждаю|верно)$/i.test(text.trim());
}

export function isNegative(text: string) {
  return /^(no|n|net|нет|cancel|отмена)$/i.test(text.trim());
}

export function getAssistantLocale(): "en" | "ru" {
  return APP_LANG;
}
