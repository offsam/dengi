import { DEBIT_CASH_ACCOUNTS } from "./debit-accounts";

export const DASHBOARD_DEBIT_CASH = DEBIT_CASH_ACCOUNTS;

export { DASHBOARD_AUTO_LOANS, DASHBOARD_AUTO_VEHICLES } from "./auto";

export const DASHBOARD_HOUSING_BILLS = [
  { id: "hb-1", name: "Ипотека", date: "1 июл", amount: 2_150 },
  { id: "hb-2", name: "Электричество", date: "20 июн", amount: 142 },
  { id: "hb-3", name: "Интернет", date: "24 июн", amount: 79 },
  { id: "hb-4", name: "Вода", date: "26 июн", amount: 58 },
  { id: "hb-5", name: "ТСЖ", date: "5 июл", amount: 210 },
] as const;
