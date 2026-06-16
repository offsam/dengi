export type DebitCashAccount = {
  id: string;
  bank: string;
  bankColor: string;
  name: string;
  balance: number;
};

/** Счета и кошельки на главной (пока статичные) */
export const DEBIT_CASH_ACCOUNTS: DebitCashAccount[] = [
  {
    id: "dc-1",
    bank: "Chase",
    bankColor: "bg-blue-600",
    name: "Расчётный счёт",
    balance: 8_420,
  },
  {
    id: "dc-2",
    bank: "Ally",
    bankColor: "bg-purple-600",
    name: "Сбережения",
    balance: 22_100,
  },
  {
    id: "dc-3",
    bank: "Наличные",
    bankColor: "bg-emerald-600",
    name: "Кошелёк",
    balance: 340,
  },
];

export function getDebitCashAccount(id: string | undefined) {
  if (!id) {
    return null;
  }

  return DEBIT_CASH_ACCOUNTS.find((account) => account.id === id) ?? null;
}

export function formatDebitCashAccountLabel(account: DebitCashAccount) {
  return `${account.bank} · ${account.name}`;
}
