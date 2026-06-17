import { DEBIT_CASH_ACCOUNTS } from "./debit-accounts";
import { SEED_HOUSING_BILLS } from "./housing-bills";

export const DASHBOARD_DEBIT_CASH = DEBIT_CASH_ACCOUNTS;

export { DASHBOARD_AUTO_LOANS, DASHBOARD_AUTO_VEHICLES } from "./auto";

export const DASHBOARD_HOUSING_BILLS = SEED_HOUSING_BILLS;

export { readDebitCashAccounts } from "./debit-storage";
export { readHousingBills } from "./housing-storage";
