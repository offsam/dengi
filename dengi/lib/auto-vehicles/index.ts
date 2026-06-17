import { getVehicleCatalogEntry, getVehicleCatalogTitle } from "./catalog";

export {
  findVehicleCatalogEntry,
  getVehicleCatalogEntry,
  getVehicleCatalogTitle,
  getVehicleModelsForMake,
  VEHICLE_CATALOG,
  VEHICLE_CATALOG_MAKES,
} from "./catalog";
export { createEmptyAutoVehicleDraft, prepareAutoVehicleDraft, toAutoVehicleDraft } from "./defaults";
export {
  CREDIT_STATS_CONTENT_OFFSET_TOP_PX,
  CREDIT_STATS_GENERAL_GRID_CLASS_NAME,
  CREDIT_STATS_GENERAL_AMOUNT_NEUTRAL,
  CREDIT_STATS_GENERAL_LABEL_CLASS_NAME,
  CREDIT_STATS_GENERAL_META_CLASS_NAME,
  CREDIT_STATS_HERO_SCALE,
  CREDIT_STATS_HERO_SLOT_HEIGHT_PX,
  CREDIT_STATS_LOAN_PLAQUE_GAP_PX,
  CREDIT_STATS_NOW_SECTION_OFFSET_PX,
  CREDIT_STATS_PROGRESS_CAR_OFFSET_Y_PX,
  PAYMENTS_CONTENT_OFFSET_MIN_PX,
  PAYMENTS_HERO_COMPRESS_MAX_PX,
  PAYMENTS_HERO_COMPRESS_MIN_RATIO,
  clampPaymentsHeroCompress,
  resolvePaymentsContentOffsetTop,
  resolvePaymentsHeroScale,
  shouldShowCreditVehicleStats,
} from "./credit-stats-layout";
export { resolveBodyIconIdFromCatalog } from "./body-icon-from-catalog";
export { normalizeCashFunding, createDefaultCashFunding } from "./cash-funding";
export {
  convertInsurancePaymentAmountForBillingPeriod,
  INSURANCE_BILLING_OPTIONS,
  normalizeInsuranceSettings,
  resolveInsuranceAnnualPayment,
  resolveInsuranceBillingPeriod,
  resolveInsuranceMonthlyPayment,
} from "./insurance";
export type { AutoVehicleInsuranceBillingPeriod } from "./insurance";
export {
  addMonthsToIsoDate,
  computeLoanMonthlyPayment,
  computeLoanRemainingBalance,
  countLoanMonthsElapsed,
  defaultLoanPaymentDay,
  resolveLoanAprPercent,
  resolveLoanFirstPaymentDate,
  resolveLoanPaymentDay,
  resolveStoredLoanPaymentDay,
  syncFinancingFromLoanInputs,
  syncLoanInterestFromApr,
  toLoanAprInput,
  toLoanTermMonthsInput,
} from "./loan";
export { resolveVehicleColorHex, shadeHex, POPULAR_BODY_COLORS, resolveVehicleBodyColor } from "./colors";
export type { VehicleBodyColor } from "./colors";
export { isActiveAutoVehicle, isArchivedAutoVehicle } from "./status";
export type { AutoVehicleRemoveMode, AutoVehicleSoldDetails, AutoVehicleStatus } from "./vehicle";
export type { VehicleCatalogEntry, VehiclePaint, VehicleSilhouetteId } from "./types";
export { VehicleSilhouette } from "./silhouettes";

export { carImagesApiEnabled, getLocalVehicleImagePath } from "./image-source";
export { FictionalCarSilhouette } from "./fictional-car";
export {
  buildVehicleCompactLabel,
  formatCompactVehicleMake,
} from "./compact-display";

export function resolveVehicleSilhouetteId(catalogId: string) {
  const entry = getVehicleCatalogEntry(catalogId);
  return entry?.silhouetteId ?? "sedan";
}

export function getVehicleImageQuery(catalogId: string, year?: number) {
  const entry = getVehicleCatalogEntry(catalogId);
  if (!entry) {
    return null;
  }

  return {
    make: entry.make,
    model: entry.imageModel ?? entry.model,
    year,
  };
}

export function buildVehicleDisplayTitle(catalogId: string, year?: number) {
  const entry = getVehicleCatalogEntry(catalogId);
  if (!entry) {
    return year ? `${year}` : "Авто";
  }

  const base = getVehicleCatalogTitle(entry);
  return year ? `${year} ${base}` : base;
}

/** Заголовок карточки: «2019 Audi» + «A5 Coupe» */
export function buildVehicleDisplayHeading(catalogId: string, year?: number) {
  const entry = getVehicleCatalogEntry(catalogId);
  if (!entry) {
    return {
      primary: year ? String(year) : "Авто",
      secondary: "",
    };
  }

  return {
    primary: year ? `${year} ${entry.make}` : entry.make,
    secondary: entry.trim ? `${entry.model} ${entry.trim}` : entry.model,
  };
}
