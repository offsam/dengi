import type { BankId } from "@/lib/bank-logos";
import { BANKS, isOtherBank } from "@/lib/bank-logos";
import { readDebitCashAccounts } from "./debit-storage";

export type DebitAccountKind = "bank" | "cash" | "crypto";

export type CryptoExchangeId = "coinbase" | "binance" | "kraken" | "other";

export type DebitCashAccount = {
  id: string;
  kind: DebitAccountKind;
  bank: string;
  bankColor: string;
  name: string;
  balance: number;
  /** Логотип банка — если не инкогнито */
  bankId?: BankId;
  customBankName?: string;
  /** Биржа — необязательно для крипты */
  exchangeId?: CryptoExchangeId;
  customExchangeName?: string;
  /** Не показывать банк или биржу на карточке */
  incognito?: boolean;
};

export type DebitCashAccountDraft = Omit<DebitCashAccount, "id">;

export const DEBIT_ACCOUNT_KIND_LABELS: Record<DebitAccountKind, string> = {
  bank: "Банк",
  cash: "Наличные",
  crypto: "Криптовалюта",
};

export const CRYPTO_EXCHANGES: Record<
  CryptoExchangeId,
  { id: CryptoExchangeId; name: string; accentColor: string }
> = {
  coinbase: { id: "coinbase", name: "Coinbase", accentColor: "bg-blue-500" },
  binance: { id: "binance", name: "Binance", accentColor: "bg-amber-500" },
  kraken: { id: "kraken", name: "Kraken", accentColor: "bg-violet-600" },
  other: { id: "other", name: "Другая биржа", accentColor: "bg-zinc-600" },
};

export const POPULAR_CRYPTO_EXCHANGE_IDS: CryptoExchangeId[] = [
  "coinbase",
  "binance",
  "kraken",
];

/** Счета и кошельки на главной */
export const DEBIT_CASH_ACCOUNTS: DebitCashAccount[] = [
  {
    id: "dc-1",
    kind: "bank",
    bankId: "chase",
    bank: "Chase",
    bankColor: "bg-blue-600",
    name: "Расчётный счёт",
    balance: 8_420,
  },
  {
    id: "dc-2",
    kind: "bank",
    bank: "Ally",
    bankColor: "bg-purple-600",
    name: "Сбережения",
    balance: 22_100,
  },
  {
    id: "dc-3",
    kind: "cash",
    bank: "Наличные",
    bankColor: "bg-emerald-600",
    name: "Кошелёк",
    balance: 340,
  },
];

export function resolveCryptoExchange(exchangeId: CryptoExchangeId) {
  return CRYPTO_EXCHANGES[exchangeId] ?? CRYPTO_EXCHANGES.other;
}

export function inferDebitAccountKind(
  account: Pick<DebitCashAccount, "kind" | "bank">
): DebitAccountKind {
  if (account.kind) {
    return account.kind;
  }

  if (account.bank === "Наличные") {
    return "cash";
  }

  if (account.bank === "Криптовалюта") {
    return "crypto";
  }

  return "bank";
}

export function normalizeDebitAccount(
  account: Partial<DebitCashAccount> & Pick<DebitCashAccount, "id">
): DebitCashAccount {
  const kind = inferDebitAccountKind(account as DebitCashAccount);

  return {
    id: account.id,
    kind,
    bank: account.bank ?? (kind === "cash" ? "Наличные" : kind === "crypto" ? "Криптовалюта" : "Счёт"),
    bankColor: account.bankColor ?? "bg-zinc-600",
    name: account.name ?? (kind === "cash" ? "Кошелёк" : kind === "crypto" ? "Криптокошелёк" : "Счёт"),
    balance: account.balance ?? 0,
    bankId: account.bankId,
    customBankName: account.customBankName,
    exchangeId: account.exchangeId,
    customExchangeName: account.customExchangeName,
    incognito: account.incognito ?? false,
  };
}

export function resolveDebitBankLabel(account: Pick<DebitCashAccount, "bankId" | "customBankName" | "bank">) {
  if (account.bankId && isOtherBank(account.bankId)) {
    return account.customBankName?.trim() || BANKS.other.name;
  }

  if (account.bankId) {
    return BANKS[account.bankId]?.name ?? account.bank;
  }

  return account.bank;
}

export function resolveDebitExchangeLabel(
  account: Pick<DebitCashAccount, "exchangeId" | "customExchangeName">
) {
  if (!account.exchangeId) {
    return null;
  }

  if (account.exchangeId === "other") {
    return account.customExchangeName?.trim() || CRYPTO_EXCHANGES.other.name;
  }

  return resolveCryptoExchange(account.exchangeId).name;
}

/** Подпись institution на карточке */
export function resolveDebitInstitutionLabel(account: DebitCashAccount) {
  if (account.incognito) {
    return "Инкогнито";
  }

  if (account.kind === "cash") {
    return "Наличные";
  }

  if (account.kind === "crypto") {
    return resolveDebitExchangeLabel(account) ?? "Криптовалюта";
  }

  return resolveDebitBankLabel(account);
}

export function resolveDebitBadgeColor(account: DebitCashAccount) {
  if (account.incognito) {
    return "bg-zinc-500";
  }

  if (account.kind === "cash") {
    return "bg-emerald-600";
  }

  if (account.kind === "crypto") {
    if (account.exchangeId) {
      return resolveCryptoExchange(account.exchangeId).accentColor;
    }

    return "bg-zinc-600";
  }

  if (account.bankId && !isOtherBank(account.bankId)) {
    return "bg-zinc-700";
  }

  return account.bankColor;
}

export function createEmptyDebitBankDraft(): DebitCashAccountDraft {
  return {
    kind: "bank",
    bank: "",
    bankColor: "bg-zinc-600",
    name: "",
    balance: 0,
    bankId: undefined,
    incognito: false,
  };
}

export function createEmptyDebitCashDraft(): DebitCashAccountDraft {
  return {
    kind: "cash",
    bank: "Наличные",
    bankColor: "bg-emerald-600",
    name: "Кошелёк",
    balance: 0,
  };
}

export function createEmptyDebitCryptoDraft(): DebitCashAccountDraft {
  return {
    kind: "crypto",
    bank: "Криптовалюта",
    bankColor: "bg-zinc-600",
    name: "Криптокошелёк",
    balance: 0,
    incognito: false,
  };
}

export function buildDebitAccountDraftForPersist(
  draft: DebitCashAccountDraft & { id?: string }
): DebitCashAccount & { id: string } {
  const id = draft.id ?? "draft";
  if (draft.kind === "cash") {
    return {
      id,
      kind: draft.kind,
      bank: "Наличные",
      bankColor: "bg-emerald-600",
      name: "Кошелёк",
      balance: draft.balance,
      incognito: false,
    };
  }

  if (draft.kind === "crypto") {
    const exchangeLabel = draft.incognito
      ? null
      : draft.exchangeId
        ? resolveDebitExchangeLabel(draft)
        : null;

    return {
      id,
      kind: draft.kind,
      bank: exchangeLabel ?? "Криптовалюта",
      bankColor: draft.exchangeId
        ? resolveCryptoExchange(draft.exchangeId).accentColor
        : "bg-zinc-600",
      name: draft.name.trim() || "Криптокошелёк",
      balance: draft.balance,
      exchangeId: draft.incognito ? undefined : draft.exchangeId,
      customExchangeName: draft.incognito ? undefined : draft.customExchangeName,
      incognito: draft.incognito,
    };
  }

  const bankLabel = draft.incognito
    ? "Счёт"
    : draft.bankId
      ? resolveDebitBankLabel(draft)
      : draft.bank.trim() || "Счёт";

  const bankColor =
    draft.incognito || !draft.bankId
      ? "bg-zinc-600"
      : isOtherBank(draft.bankId)
        ? "bg-zinc-600"
        : "bg-zinc-700";

  return {
    id,
    kind: draft.kind,
    bank: bankLabel,
    bankColor,
    name: draft.name.trim() || "Счёт",
    balance: draft.balance,
    bankId: draft.incognito ? undefined : draft.bankId,
    customBankName: draft.incognito ? undefined : draft.customBankName,
    incognito: draft.incognito,
  };
}

export function toDebitCashAccountDraft(account: DebitCashAccount): DebitCashAccountDraft {
  return {
    kind: account.kind,
    bank: account.bank,
    bankColor: account.bankColor,
    name: account.name,
    balance: account.balance,
    bankId: account.bankId,
    customBankName: account.customBankName,
    exchangeId: account.exchangeId,
    customExchangeName: account.customExchangeName,
    incognito: account.incognito,
  };
}

export function getDebitCashAccount(id: string | undefined) {
  if (!id) {
    return null;
  }

  return readDebitCashAccounts().find((account) => account.id === id) ?? null;
}

export function formatDebitCashAccountLabel(account: DebitCashAccount) {
  if (account.incognito) {
    return `${account.name} · инкогнито`;
  }

  return `${resolveDebitInstitutionLabel(account)} · ${account.name}`;
}

export function debitKindLabel(account: DebitCashAccount) {
  return DEBIT_ACCOUNT_KIND_LABELS[account.kind];
}
