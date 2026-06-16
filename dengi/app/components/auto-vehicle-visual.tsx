import { buildVehicleDisplayTitle } from "@/lib/auto-vehicles";
import { FictionalCarSilhouette } from "@/lib/auto-vehicles/fictional-car";

export type AutoVehicleVisualVariant = "compact" | "float" | "detail";

type AutoVehicleVisualProps = {
  catalogId: string;
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
  float: {
    wrapper: "relative z-[1] flex h-[84px] w-full items-end justify-center",
    silhouette: "h-[72px] w-full max-w-[252px] drop-shadow-[0_14px_22px_rgba(13,27,45,0.18)]",
  },
  detail: {
    wrapper: "relative z-[1] flex h-[112px] w-full items-end justify-center",
    silhouette: "h-[96px] w-full max-w-[320px]",
  },
};

/** Вымышленное купе Voltara — SVG с перекраской кузова и дисков */
export function AutoVehicleVisual({
  catalogId,
  year,
  bodyColorHex,
  wheelColorHex,
  variant = "compact",
}: AutoVehicleVisualProps) {
  const title = buildVehicleDisplayTitle(catalogId, year);
  const size = VISUAL_SIZES[variant];

  return (
    <div className={size.wrapper} aria-label={title}>
      <FictionalCarSilhouette
        bodyColorHex={bodyColorHex}
        wheelColorHex={wheelColorHex}
        className={size.silhouette}
      />
    </div>
  );
}
