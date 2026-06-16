import { getDebitCashAccount } from "@/lib/dashboard/debit-accounts";
import type { AutoVehicleCashFunding } from "./vehicle";

export type CashFundingOption = {
  id: string;
  label: string;
  group: string;
};

export function createDefaultCashFunding(): AutoVehicleCashFunding {
  return {
    method: "wallet",
    walletId: "dc-3",
  };
}

export function normalizeCashFunding(
  funding: AutoVehicleCashFunding | undefined
): AutoVehicleCashFunding {
  const base = funding ?? createDefaultCashFunding();

  if (base.method === "wallet") {
    const walletId = getDebitCashAccount(base.walletId) ? base.walletId : "dc-3";
    return { method: "wallet", walletId };
  }

  if (base.method === "credit_card") {
    return {
      method: "credit_card",
      creditCardId: base.creditCardId,
    };
  }

  const tradePart = base.tradePart ?? "cash";
  return {
    method: "trade",
    tradePart,
    tradeCashAmount: base.tradeCashAmount ?? 0,
    tradeVehicleCatalogId: base.tradeVehicleCatalogId,
    tradeVehicleYear: base.tradeVehicleYear,
    tradeVehicleValue: base.tradeVehicleValue ?? 0,
    tradeWalletId: getDebitCashAccount(base.tradeWalletId) ? base.tradeWalletId : "dc-3",
    tradeWalletAmount: base.tradeWalletAmount ?? 0,
  };
}
