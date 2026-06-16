export type AutoVehicleFinancingType = "credit" | "leasing" | "cash";

export type AutoVehicleStatus = "active" | "sold";

/** Как убрать автомобиль из гаража */
export type AutoVehicleRemoveMode = "with-records" | "sold" | "vehicle-only";

export type AutoVehicleSoldDetails = {
  soldPrice: number;
  /** Сколько из выручки пошло на погашение кредита */
  soldLoanPayoff: number;
  soldWalletId: string;
  /** Не погашать кредит из выручки — вся сумма на счёт */
  ignoreLoanPayoff?: boolean;
};

export type AutoVehicleCashMethod = "wallet" | "credit_card" | "trade";

export type AutoVehicleTradePart = "cash" | "vehicle" | "wallet";

/** Откуда взяты деньги при покупке за наличные */
export type AutoVehicleCashFunding = {
  method: AutoVehicleCashMethod;
  walletId?: string;
  creditCardId?: string;
  tradePart?: AutoVehicleTradePart;
  tradeCashAmount?: number;
  tradeVehicleCatalogId?: string;
  tradeVehicleYear?: number;
  tradeVehicleValue?: number;
  tradeWalletId?: string;
  tradeWalletAmount?: number;
};

export type AutoVehicle = {
  id: string;
  /** ID из lib/auto-vehicles/catalog */
  catalogId: string;
  year: number;
  /** active — в гараже; sold — продан, скрыт с главной */
  status?: AutoVehicleStatus;
  /** ISO YYYY-MM-DD — когда продан */
  soldAt?: string;
  /** Сумма продажи */
  soldPrice?: number;
  /** Погашение кредита из выручки */
  soldLoanPayoff?: number;
  /** Сумма, полученная на счёт */
  soldWalletAmount?: number;
  /** Кошелёк, куда поступили деньги */
  soldWalletId?: string;
  /** При продаже не погашали кредит из выручки */
  soldIgnoreLoanPayoff?: boolean;
  /** credit | leasing | cash */
  financingType: AutoVehicleFinancingType;
  /** Только для financingType === cash */
  cashFunding?: AutoVehicleCashFunding;
  /** id иконки типа кузова — lib/car-icons/registry */
  bodyIconId?: string;
  bodyColorHex: string;
  bodyColorLabel: string;
  wheelColorHex: string;
  wheelColorLabel: string;
  purchasePrice: number;
  /** ISO YYYY-MM-DD */
  purchaseDate: string;
  marketPrice: number;
  /** local | vinaudit */
  marketPriceSource?: "local" | "vinaudit";
  marketPriceUpdatedAt?: string;
  /** Опционально — для VinAudit / других VIN-API */
  vin?: string;
  /** День месяца для ежемесячного платежа (1–31) */
  loanPaymentDay?: number;
  loanPayment: number;
  /** Срок кредита / лизинга, месяцев */
  loanTermMonths: number;
  /** Годовая ставка, % */
  loanAprPercent: number;
  /** Месячная часть процентов — пересчитывается из остатка и ставки */
  loanInterest: number;
  remaining: number;
  /** Пробег, мили */
  mileage: number;
};

export type AutoVehicleDraft = Omit<AutoVehicle, "id">;
