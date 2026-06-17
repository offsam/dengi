import type { AutoVehicle } from "./vehicle";

/**
 * Эталон экрана «Статистика» для кредитного / лизингового авто.
 * Все новые машины с financingType !== cash должны выглядеть так же.
 */
export const CREDIT_STATS_CONTENT_OFFSET_TOP_PX = 142;
export const CREDIT_STATS_HERO_SCALE = 0.8;
export const CREDIT_STATS_HERO_SLOT_HEIGHT_PX = 158;
export const CREDIT_STATS_NOW_SECTION_OFFSET_PX = -23;
export const CREDIT_STATS_LOAN_PLAQUE_GAP_PX = 10;
/** Сетка «Общее»: покупка −10%, платёж −5%, ставка +10%, страховка +5% (×2) */
export const CREDIT_STATS_GENERAL_GRID_CLASS_NAME =
  "grid grid-cols-[0.932fr_0.903fr_0.545fr_0.794fr] gap-1.5";

/** Типографика плашек «Общее» — +10% к базовым 10px / 17px */
export const CREDIT_STATS_GENERAL_LABEL_CLASS_NAME =
  "text-[11px] leading-tight text-zinc-500";
export const CREDIT_STATS_GENERAL_META_CLASS_NAME =
  "max-w-full truncate text-[11px] font-medium leading-tight text-zinc-500";
export const CREDIT_STATS_GENERAL_AMOUNT_NEUTRAL =
  "text-[18.7px] font-semibold leading-none tracking-tight tabular-nums text-zinc-900";
export const CREDIT_STATS_PROGRESS_CAR_OFFSET_Y_PX = -15;

/** Платежи: при упоре пузыря вверх — сжимается hero-машина (не пузырь) */
export const PAYMENTS_HERO_COMPRESS_MAX_PX = 96;
/** Мин. масштаб машины относительно CREDIT_STATS_HERO_SCALE (0.38 → ~30% экрана) */
export const PAYMENTS_HERO_COMPRESS_MIN_RATIO = 0.38;
export const PAYMENTS_CONTENT_OFFSET_MIN_PX = 54;

export function clampPaymentsHeroCompress(value: number) {
  return Math.max(0, Math.min(1, value));
}

export function resolvePaymentsHeroScale(compress: number) {
  const amount = clampPaymentsHeroCompress(compress);
  const minScale = CREDIT_STATS_HERO_SCALE * PAYMENTS_HERO_COMPRESS_MIN_RATIO;

  return CREDIT_STATS_HERO_SCALE - amount * (CREDIT_STATS_HERO_SCALE - minScale);
}

export function resolvePaymentsContentOffsetTop(compress: number) {
  const amount = clampPaymentsHeroCompress(compress);

  return Math.round(
    CREDIT_STATS_CONTENT_OFFSET_TOP_PX -
      amount * (CREDIT_STATS_CONTENT_OFFSET_TOP_PX - PAYMENTS_CONTENT_OFFSET_MIN_PX)
  );
}

export function shouldShowCreditVehicleStats(
  vehicle: Pick<AutoVehicle, "financingType" | "status">
) {
  return vehicle.financingType !== "cash" && vehicle.status !== "sold";
}
