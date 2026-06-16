import type { AutoVehicle } from "./vehicle";

export const SEED_AUTO_VEHICLES: AutoVehicle[] = [
  {
    id: "av-1",
    catalogId: "voltara-prism",
    financingType: "credit",
    year: 2019,
    bodyIconId: "sport",
    bodyColorHex: "#D4DCE4",
    bodyColorLabel: "серебристый",
    wheelColorHex: "#141414",
    wheelColorLabel: "чёрные диски",
    purchasePrice: 32_500,
    purchaseDate: "2019-03-12",
    loanPaymentDay: 12,
    marketPrice: 24_800,
    marketPriceSource: "local",
    marketPriceUpdatedAt: "2026-06-15T12:00:00.000Z",
    loanPayment: 468,
    loanTermMonths: 102,
    loanAprPercent: 9.7,
    loanInterest: 94,
    remaining: 11_650,
    mileage: 36_287,
  },
];
