import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";
import type { CreditCard } from "@/lib/credit-cards/types";
import type { DebitCashAccount } from "./debit-accounts";

function estimateCardMonthlyInterest(card: CreditCard) {
  if (card.balance <= 0 || card.apr <= 0) {
    return 0;
  }

  return Math.round((card.balance * card.apr) / 100 / 12);
}

function isFinancedVehicle(vehicle: AutoVehicle) {
  return vehicle.financingType === "credit" || vehicle.financingType === "leasing";
}

export function computeDashboardMetrics(input: {
  cards: CreditCard[];
  vehicles: AutoVehicle[];
  debitAccounts: readonly DebitCashAccount[];
  billsDueSoon: number;
}) {
  const cardDebt = input.cards.reduce((sum, card) => sum + Math.max(0, card.balance), 0);
  const cardInterest = input.cards.reduce(
    (sum, card) => sum + estimateCardMonthlyInterest(card),
    0
  );

  const financedVehicles = input.vehicles.filter(isFinancedVehicle);
  const vehicleDebt = financedVehicles.reduce(
    (sum, vehicle) => sum + Math.max(0, vehicle.remaining),
    0
  );
  const vehicleInterest = financedVehicles.reduce(
    (sum, vehicle) => sum + Math.max(0, vehicle.loanInterest),
    0
  );

  const totalDebt = cardDebt + vehicleDebt;
  const interestThisMonth = cardInterest + vehicleInterest;

  const cashAssets = input.debitAccounts.reduce((sum, account) => sum + account.balance, 0);
  const vehicleAssets = input.vehicles.reduce(
    (sum, vehicle) => sum + Math.max(0, vehicle.purchasePrice),
    0
  );
  const assets = cashAssets + vehicleAssets;
  const netWorth = assets - totalDebt;

  return {
    totalDebt,
    interestThisMonth,
    assets,
    netWorth,
    billsDueSoon: input.billsDueSoon,
  };
}
