import { createDefaultCashFunding } from "./cash-funding";
import { defaultLoanPaymentDay, syncFinancingFromLoanInputs } from "./loan";
import type { AutoVehicle, AutoVehicleDraft } from "./vehicle";

/** Пустой черновик для экрана добавления авто */
export function createEmptyAutoVehicleDraft(): AutoVehicleDraft {
  const purchaseDate = new Date().toISOString().slice(0, 10);

  return {
    catalogId: "voltara-prism",
    financingType: "credit",
    year: new Date().getFullYear(),
    bodyColorHex: "#e8eaed",
    bodyColorLabel: "серебристый",
    wheelColorHex: "#141414",
    wheelColorLabel: "чёрные",
    purchasePrice: 0,
    purchaseDate,
    loanPaymentDay: defaultLoanPaymentDay(purchaseDate),
    marketPrice: 0,
    loanPayment: 0,
    loanTermMonths: 60,
    loanAprPercent: 0,
    loanInterest: 0,
    remaining: 0,
    mileage: 0,
  };
}

export function toAutoVehicleDraft(vehicle: AutoVehicle): AutoVehicleDraft {
  const { id, ...draft } = vehicle;
  void id;
  return draft;
}

/** Перед сохранением: остаток, ставка и месячные проценты для кредита/лизинга */
export function prepareAutoVehicleDraft(draft: AutoVehicleDraft): AutoVehicleDraft {
  if (draft.financingType === "cash") {
    return {
      ...draft,
      remaining: 0,
      loanPayment: 0,
      loanTermMonths: 0,
      loanAprPercent: 0,
      loanInterest: 0,
      cashFunding: draft.cashFunding ?? createDefaultCashFunding(),
    };
  }

  const synced = syncFinancingFromLoanInputs(draft);

  return {
    ...draft,
    ...synced,
  };
}
