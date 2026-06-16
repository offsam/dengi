import { buildVehicleDisplayTitle } from "@/lib/auto-vehicles";
import { FictionalCarSilhouette } from "@/lib/auto-vehicles/fictional-car";
import { CarIconImage } from "@/app/components/car-icon-image";
import { resolveBodyTypeIcon } from "@/lib/car-icons";

export type AutoVehicleVisualVariant = "compact" | "shelf" | "float" | "detail" | "hero" | "heroStats";

type AutoVehicleVisualProps = {
  catalogId: string;
  bodyIconId?: string;
  year?: number;
  bodyColorHex: string;
  wheelColorHex: string;
  variant?: AutoVehicleVisualVariant;
};

const VISUAL_SIZES: Record<
  AutoVehicleVisualVariant,
  { wrapper: string; silhouette: string }
> = {
  compact: {
    wrapper: "-mt-0.5 flex h-[68px] w-[156px] items-end justify-center",
    silhouette: "h-[58px] w-[148px]",
  },
  /** Главный экран — крупная иконка на прозрачном фоне, карточка остаётся compact по ширине */
  shelf: {
    wrapper:
      "relative -mt-0.5 flex h-[68px] w-[156px] items-end justify-center overflow-visible",
    silhouette:
      "relative z-[1] h-[208px] w-[208px] max-w-none translate-y-[30px] object-contain object-bottom",
  },
  float: {
    wrapper: "relative z-[1] flex h-[84px] w-full items-end justify-center",
    silhouette: "h-[72px] w-full max-w-[252px] drop-shadow-[0_14px_22px_rgba(13,27,45,0.18)]",
  },
  hero: {
    wrapper: "relative z-[0] flex w-full items-end justify-center overflow-visible",
    silhouette:
      "relative z-[0] block h-auto w-full max-w-none object-bottom drop-shadow-[0_20px_36px_rgba(13,27,45,0.14)]",
  },
  /** Экран статистики — чуть меньше и смещена влево */
  heroStats: {
    wrapper: "relative z-[0] flex w-full items-end justify-center overflow-visible",
    silhouette:
      "relative z-[0] block h-auto w-[calc(100%-20px)] max-w-none -translate-x-[40px] object-bottom drop-shadow-[0_20px_36px_rgba(13,27,45,0.14)]",
  },
  detail: {
    wrapper: "relative z-[1] flex h-[112px] w-full items-end justify-center",
    silhouette: "h-[96px] w-full max-w-[320px]",
  },
};

/** Иконка типа кузова или силуэт по умолчанию */
export function AutoVehicleVisual({
  catalogId,
  bodyIconId,
  year,
  bodyColorHex,
  wheelColorHex,
  variant = "compact",
}: AutoVehicleVisualProps) {
  const title = buildVehicleDisplayTitle(catalogId, year);
  const size = VISUAL_SIZES[variant];
  const bodyTypeIcon = resolveBodyTypeIcon(bodyIconId);

  return (
    <div className={size.wrapper} aria-label={title}>
      <CarIconImage
        fileName={bodyTypeIcon.fileName}
        className={size.silhouette}
        fallback={
          <FictionalCarSilhouette
            bodyColorHex={bodyColorHex}
            wheelColorHex={wheelColorHex}
            className={size.silhouette}
          />
        }
      />
    </div>
  );
}
