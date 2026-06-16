import { BANKS, type BankId } from "@/lib/bank-logos";
import { createEmptyCreditCardDraft } from "@/lib/credit-cards/defaults";
import type { AppCatalog } from "./catalog";
import { findCatalogEntity } from "./catalog";
import type { AssistantAction } from "./types";
import { getAssistantLocale } from "./types";

const BANK_ALIASES: { id: BankId; patterns: RegExp[] }[] = [
  { id: "discover", patterns: [/discover/i, /discovery/i, /дискавер/i] },
  { id: "chase", patterns: [/chase/i, /чейз/i] },
  {
    id: "americanexpress",
    patterns: [/american express/i, /amex/i, /амекс/i],
  },
  { id: "bankofamerica", patterns: [/bank of america/i, /bofa/i] },
  { id: "wellsfargo", patterns: [/wells fargo/i] },
  { id: "citibank", patterns: [/citi/i, /citibank/i, /сити/i] },
];

function parseAmount(raw: string) {
  const normalized = raw.replace(/\s/g, "").replace(/,/g, "");
  const amount = Number(normalized);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

export function extractAmount(text: string) {
  const patterns = [
    /(?:\$|usd\s*)?\s*([\d\s,]+(?:\.\d+)?)\s*(?:\$|usd|dollars|баксов|долларов)?/i,
    /(?:на|for|amount|сумм(?:а|у|ой)|лимит|limit)\s*[:\s-]*\$?\s*([\d\s,]+(?:\.\d+)?)/i,
    /([\d\s,]{2,})\s*(?:usd|dollars|\$|руб|rub)/i,
  ];

  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match?.[1]) {
      const amount = parseAmount(match[1]);
      if (amount !== null) {
        return amount;
      }
    }
  }

  return null;
}

function extractLimit(text: string) {
  const match = text.match(
    /(?:limit|лимит|credit limit)\s*[:\s-]*\$?\s*([\d\s,]+)/i
  );
  return match?.[1] ? parseAmount(match[1]) : null;
}

function extractBankId(text: string): BankId | null {
  for (const bank of BANK_ALIASES) {
    if (bank.patterns.some((pattern) => pattern.test(text))) {
      return bank.id;
    }
  }

  return null;
}

function looksLikeAddCard(text: string) {
  return /(?:add|create|new card|получил новую карту|добав(?:ь|ить)|новую карту)/i.test(
    text
  );
}

function detectCreditCardTransactionType(text: string) {
  if (
    /(?:spent|spend|purchase|buy|bought|расход|потратил|потратила|купил|купила|оплатил|оплатила)/i.test(
      text
    )
  ) {
    return "purchase" as const;
  }

  if (
    /(?:paid|payment|deposit|deposited|положил|положила|внес|внесла|пополнил|пополнила|заплатил|заплатила)/i.test(
      text
    )
  ) {
    return "payment" as const;
  }

  return null;
}

function looksLikeTransaction(text: string) {
  return (
    detectCreditCardTransactionType(text) !== null ||
    /(?:transaction|транзакц)/i.test(text)
  );
}

function extractDescription(text: string, fallback: string) {
  const quoted = text.match(/["“](.+?)["”]/);
  if (quoted?.[1]) {
    return quoted[1].trim();
  }

  return fallback;
}

export function parseAssistantIntentRules(
  text: string,
  catalog: AppCatalog
): AssistantAction {
  const trimmed = text.trim();
  if (!trimmed) {
    return { type: "unknown", raw: trimmed };
  }

  if (looksLikeAddCard(trimmed)) {
    const bankId = extractBankId(trimmed);
    const limit = extractLimit(trimmed);

    if (!bankId && limit === null) {
      return { type: "unknown", raw: trimmed };
    }

    return {
      type: "add_card",
      draft: {
        ...createEmptyCreditCardDraft(),
        bankId: bankId ?? createEmptyCreditCardDraft().bankId,
        name: bankId ? `${BANKS[bankId].name} card` : "",
        limit: limit ?? 0,
      },
    };
  }

  if (looksLikeTransaction(trimmed)) {
    const amount = extractAmount(trimmed);
    const transactionType = detectCreditCardTransactionType(trimmed);
    const entity = findCatalogEntity(catalog, trimmed);

    if (!amount || !transactionType || !entity) {
      return { type: "unknown", raw: trimmed };
    }

    if (entity.kind === "credit_card") {
      return {
        type: "add_credit_card_transaction",
        cardId: entity.id,
        cardLabel: entity.label,
        transactionType,
        amount,
        description: extractDescription(
          trimmed,
          transactionType === "purchase" ? "Покупка" : "Платёж"
        ),
      };
    }

    if (entity.kind === "cash_wallet") {
      return {
        type: "unsupported",
        targetKind: entity.kind,
        targetLabel: entity.label,
        message:
          getAssistantLocale() === "ru"
            ? `Понял: операция с наличными «${entity.label}» на $${amount}. Скоро добавлю это действие в приложение.`
            : `Got it: a cash update for “${entity.label}” ($${amount}). I'll wire this action soon.`,
      };
    }

    if (entity.kind === "debit_account") {
      return {
        type: "unsupported",
        targetKind: entity.kind,
        targetLabel: entity.label,
        message:
          getAssistantLocale() === "ru"
            ? `Понял: операция по счёту «${entity.label}» на $${amount}. Скоро добавлю это действие.`
            : `Got it: an account move for “${entity.label}” ($${amount}). I'll wire this action soon.`,
      };
    }

    if (entity.kind === "bill") {
      return {
        type: "unsupported",
        targetKind: entity.kind,
        targetLabel: entity.label,
        message:
          getAssistantLocale() === "ru"
            ? `Понял: платёж по счёту «${entity.label}» на $${amount}. Скоро добавлю оплату bills.`
            : `Got it: a bill payment for “${entity.label}” ($${amount}). Bill payments are coming soon.`,
      };
    }
  }

  return { type: "unknown", raw: trimmed };
}
