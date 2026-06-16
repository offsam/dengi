import { getCreditCardBankName } from "@/lib/bank-logos";
import { formatMoneyExact } from "@/lib/format-money";
import type {
  AssistantAction,
  AssistantAddCardAction,
  AssistantCreditCardTransactionAction,
  AssistantExecutableAction,
} from "./types";

export function describeAssistantAction(
  action: Exclude<AssistantAction, { type: "unknown" }>,
  locale: "en" | "ru"
) {
  if (action.type === "add_card") {
    return describeAddCardAction(action, locale);
  }

  if (action.type === "add_credit_card_transaction") {
    return describeCreditCardTransactionAction(action, locale);
  }

  return action.message;
}

function describeAddCardAction(action: AssistantAddCardAction, locale: "en" | "ru") {
  const bankName = getCreditCardBankName(action.draft);
  const limit = action.draft.limit
    ? formatMoneyExact(action.draft.limit)
    : locale === "ru"
      ? "не указан"
      : "not set";

  if (locale === "ru") {
    return `Понял: добавить карту ${bankName}${action.draft.name ? ` «${action.draft.name}»` : ""} с лимитом ${limit}. Добавить?`;
  }

  return `Got it: add a ${bankName} card${action.draft.name ? ` named “${action.draft.name}”` : ""} with a ${limit} limit. Add it?`;
}

function describeCreditCardTransactionAction(
  action: AssistantCreditCardTransactionAction,
  locale: "en" | "ru"
) {
  const amount = formatMoneyExact(action.amount);

  if (locale === "ru") {
    if (action.transactionType === "purchase") {
      return `Понял: расход ${amount} на карту «${action.cardLabel}» (${action.description}). Добавить?`;
    }

    return `Понял: платёж ${amount} на карту «${action.cardLabel}» (${action.description}). Добавить?`;
  }

  if (action.transactionType === "purchase") {
    return `Got it: add a ${amount} purchase on “${action.cardLabel}” (${action.description}). Add it?`;
  }

  return `Got it: add a ${amount} payment to “${action.cardLabel}” (${action.description}). Add it?`;
}

export function buildUnknownReply(locale: "en" | "ru") {
  if (locale === "ru") {
    return "Примеры: «Потратил 50 на Sapphire», «Положил 200 на Discover», «Добавь карту Chase лимит 10000».";
  }

  return 'Try: “Spent 50 on Sapphire”, “Paid 200 to Discover”, or “Add a Chase card with a 10000 limit”.';
}

export function buildDoneReply(action: AssistantExecutableAction, locale: "en" | "ru") {
  if (action.type === "add_card") {
    return locale === "ru"
      ? "Готово. Карта добавлена."
      : "Done. The card was added.";
  }

  return locale === "ru" ? "Готово. Транзакция добавлена." : "Done. Transaction added.";
}

export function buildCancelledReply(locale: "en" | "ru") {
  return locale === "ru" ? "Ок, ничего не делаю." : "Okay, I won't do it.";
}
