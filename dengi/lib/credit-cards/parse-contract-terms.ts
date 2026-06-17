import { APP_LOCALE } from "@/lib/i18n/locale";

export type ContractTermCategory =
  | "rate"
  | "fee"
  | "payment"
  | "penalty"
  | "other";

export type ContractTerm = {
  id: string;
  label: string;
  value: string;
  category: ContractTermCategory;
};

type TermPattern = {
  key: string;
  label: string;
  category: ContractTermCategory;
  regex: RegExp;
  format: (match: RegExpMatchArray) => string;
};

function money(value: string) {
  const amount = Number(value.replace(/,/g, ""));
  if (!Number.isFinite(amount)) {
    return value;
  }

  return new Intl.NumberFormat(APP_LOCALE, {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 2,
  }).format(amount);
}

function percent(value: string) {
  const amount = Number(value);
  if (!Number.isFinite(amount)) {
    return value;
  }

  return `${amount.toFixed(2)}%`;
}

const TERM_PATTERNS: TermPattern[] = [
  {
    key: "purchase_apr",
    label: "Ставка на покупки",
    category: "rate",
    regex:
      /purchase\s+(?:apr|annual\s+percentage\s+rate)[:\s-]*(\d+(?:\.\d+)?)\s*%/gi,
    format: (match) => percent(match[1]),
  },
  {
    key: "balance_transfer_apr",
    label: "Ставка на перевод баланса",
    category: "rate",
    regex:
      /balance\s+transfer\s+(?:apr|annual\s+percentage\s+rate)[:\s-]*(\d+(?:\.\d+)?)\s*%/gi,
    format: (match) => percent(match[1]),
  },
  {
    key: "cash_advance_apr",
    label: "Ставка на снятие наличных",
    category: "rate",
    regex:
      /cash\s+advance\s+(?:apr|annual\s+percentage\s+rate)[:\s-]*(\d+(?:\.\d+)?)\s*%/gi,
    format: (match) => percent(match[1]),
  },
  {
    key: "penalty_apr",
    label: "Штрафная ставка",
    category: "penalty",
    regex:
      /penalty\s+(?:apr|annual\s+percentage\s+rate)[:\s-]*(?:up\s+to\s+)?(\d+(?:\.\d+)?)\s*%/gi,
    format: (match) => percent(match[1]),
  },
  {
    key: "standard_apr",
    label: "Базовая ставка",
    category: "rate",
    regex:
      /(?:standard\s+)?annual\s+percentage\s+rate(?:\s*\(apr\))?[:\s-]*(\d+(?:\.\d+)?)\s*%/gi,
    format: (match) => percent(match[1]),
  },
  {
    key: "late_payment_fee",
    label: "Штраф за просрочку",
    category: "fee",
    regex: /late\s+(?:payment\s+)?fee[:\s-]*(?:up\s+to\s+)?\$?\s*(\d+(?:\.\d+)?)/gi,
    format: (match) => money(match[1]),
  },
  {
    key: "annual_fee",
    label: "Годовая комиссия",
    category: "fee",
    regex: /annual\s+fee[:\s-]*\$?\s*(\d+(?:\.\d+)?|none|waived)/gi,
    format: (match) => {
      const raw = match[1].toLowerCase();
      if (raw === "none" || raw === "waived") {
        return raw === "none" ? money("0") : "Отменена";
      }
      return money(match[1]);
    },
  },
  {
    key: "over_limit_fee",
    label: "Комиссия за превышение лимита",
    category: "fee",
    regex: /over[-\s]?limit\s+fee[:\s-]*\$?\s*(\d+(?:\.\d+)?)/gi,
    format: (match) => money(match[1]),
  },
  {
    key: "returned_payment_fee",
    label: "Комиссия за возврат платежа",
    category: "fee",
    regex: /returned\s+payment\s+fee[:\s-]*\$?\s*(\d+(?:\.\d+)?)/gi,
    format: (match) => money(match[1]),
  },
  {
    key: "foreign_transaction_fee",
    label: "Комиссия за операции за рубежом",
    category: "fee",
    regex:
      /foreign\s+transaction\s+fee[:\s-]*(?:(\d+(?:\.\d+)?)\s*%|\$?\s*(\d+(?:\.\d+)?))/gi,
    format: (match) =>
      match[1] ? percent(match[1]) : money(match[2] ?? match[1]),
  },
  {
    key: "minimum_payment",
    label: "Минимальный платёж",
    category: "payment",
    regex:
      /minimum\s+(?:monthly\s+)?payment[:\s-]*(?:due\s+)?\$?\s*(\d+(?:\.\d+)?)/gi,
    format: (match) => money(match[1]),
  },
  {
    key: "credit_limit",
    label: "Кредитный лимит",
    category: "other",
    regex: /credit\s+limit[:\s-]*\$?\s*([\d,]+(?:\.\d+)?)/gi,
    format: (match) => money(match[1]),
  },
  {
    key: "grace_period",
    label: "Льготный период",
    category: "other",
    regex: /grace\s+period[:\s-]*(\d+)\s+days?/gi,
    format: (match) => `${match[1]} дн.`,
  },
];

function normalizeText(text: string) {
  return text.replace(/\s+/g, " ").trim();
}

export function findTermByKey(terms: ContractTerm[], key: string) {
  return terms.find((term) => term.id.startsWith(`${key}-`)) ?? null;
}

export function parseContractTerms(rawText: string): ContractTerm[] {
  const text = normalizeText(rawText);
  if (!text) {
    return [];
  }

  const found: ContractTerm[] = [];
  const seen = new Set<string>();

  for (const pattern of TERM_PATTERNS) {
    pattern.regex.lastIndex = 0;
    const match = pattern.regex.exec(text);
    if (!match) {
      continue;
    }

    const dedupeKey = `${pattern.key}:${match[0]}`;
    if (seen.has(dedupeKey)) {
      continue;
    }

    seen.add(dedupeKey);
    found.push({
      id: `${pattern.key}-${found.length}`,
      label: pattern.label,
      value: pattern.format(match),
      category: pattern.category,
    });
  }

  return found;
}

export function applyParsedTermsToCard(
  card: {
    apr: number;
    limit: number;
  },
  terms: ContractTerm[]
) {
  const patch: Partial<typeof card> = {};

  const purchaseApr = findTermByKey(terms, "purchase_apr");
  const standardApr = findTermByKey(terms, "standard_apr");
  const aprTerm = purchaseApr ?? standardApr;
  if (aprTerm) {
    const parsed = Number(aprTerm.value.replace("%", "").replace(",", "."));
    if (Number.isFinite(parsed)) {
      patch.apr = parsed;
    }
  }

  const limitTerm = findTermByKey(terms, "credit_limit");
  if (limitTerm) {
    const parsed = Number(limitTerm.value.replace(/[^\d.,-]/g, "").replace(",", ""));
    if (Number.isFinite(parsed)) {
      patch.limit = parsed;
    }
  }

  return patch;
}
