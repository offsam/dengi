import { buildVehicleDisplayTitle } from "@/lib/auto-vehicles";
import { FictionalCarSilhouette } from "@/lib/auto-vehicles/fictional-car";
import { CarIconImage } from "@/app/components/car-icon-image";
import { resolveBodyTypeIcon } from "@/lib/car-icons";
import { CREDIT_STATS_HERO_SLOT_HEIGHT_PX } from "@/lib/auto-vehicles/credit-stats-layout";

export type AutoVehicleVisualVariant =
  | "minimal"
  | "compact"
  | "shelf"
  | "float"
  | "detail"
  | "hero"
  | "heroStats";

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
  minimal: {
    wrapper: "flex h-[48px] w-[115px] items-end justify-center",
    silhouette: "h-[42px] w-[108px]",
  },
  compact: {
    wrapper: "-mt-0.5 flex h-[68px] w-[156px] items-end justify-center",
    silhouette: "h-[58px] w-[148px]",
  },
  /** Главный экран — крупная иконка, но внутри ширины карточки (156px) */
  shelf: {
    wrapper:
      "relative -mt-4 mx-auto flex h-[42px] w-[156px] items-end justify-center overflow-x-clip overflow-y-visible",
    silhouette:
      "relative z-[1] h-[128px] w-[148px] max-w-full -translate-y-3 object-contain object-bottom",
  },
  float: {
    wrapper: "relative z-[1] flex h-[84px] w-full items-end justify-center",
    silhouette: "h-[72px] w-full max-w-[252px] drop-shadow-[0_14px_22px_rgba(13,27,45,0.18)]",
  },
  hero: {
    wrapper:
      "relative z-[0] mx-auto flex h-[118px] w-full max-w-[300px] items-end justify-center overflow-visible",
    silhouette:
      "relative z-[0] h-[118px] w-full max-w-[300px] object-contain object-bottom drop-shadow-[0_20px_36px_rgba(13,27,45,0.14)]",
  },
  /** Экран статистики — базовый слот + scale в detail-hero */
  heroStats: {
    wrapper:
      "relative z-[0] mx-auto flex w-full max-w-[420px] items-start justify-center overflow-visible",
    silhouette:
      "relative z-[0] block w-full max-w-[420px] object-contain object-top drop-shadow-[0_20px_36px_rgba(13,27,45,0.14)]",
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
    <div
      className={size.wrapper}
      style={variant === "heroStats" ? { height: CREDIT_STATS_HERO_SLOT_HEIGHT_PX } : undefined}
      aria-label={title}
    >
      <CarIconImage
        fileName={bodyTypeIcon.fileName}
        align={variant === "heroStats" ? "top" : "bottom"}
        className={size.silhouette}
        imageStyle={
          variant === "heroStats" ? { height: CREDIT_STATS_HERO_SLOT_HEIGHT_PX } : undefined
        }
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
