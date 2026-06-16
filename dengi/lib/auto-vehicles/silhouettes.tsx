import { shadeHex } from "./colors";
import type { VehicleSilhouetteId } from "./types";

type SilhouetteProps = {
  bodyColorHex: string;
  wheelColorHex: string;
  className?: string;
};

function GroundShadow() {
  return (
    <ellipse cx="100" cy="66" rx="72" ry="4" className="fill-zinc-300/45" />
  );
}

/** Купе — низкая крыша, fastback */
function SportCoupeSilhouette({ bodyColorHex, wheelColorHex, className }: SilhouetteProps) {
  const bodyDark = shadeHex(bodyColorHex, -0.14);
  const bodyLight = shadeHex(bodyColorHex, 0.1);
  const rim = shadeHex(wheelColorHex, 0.18);

  return (
    <svg
      viewBox="0 0 200 72"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <GroundShadow />

      <path
        d="M24 52h152c2 0 3-1 3-3V38c0-8-5-14-12-17l-14-6C146 12 138 10 128 10H72c-10 0-18 2-26 6L32 22C25 25 20 31 20 38v11c0 2 1 3 3 3z"
        fill={bodyColorHex}
      />
      <path
        d="M72 10h56c10 0 18 2 26 6l14 6c3 1 5 3 7 5H35c2-2 4-4 7-5l14-6c8-4 16-6 26-6z"
        fill={bodyLight}
      />
      <path
        d="M20 49h160v3c0 2-1 3-3 3H23c-2 0-3-1-3-3v-3z"
        fill={bodyDark}
      />

      <path
        d="M58 18h84l10 8H48l10-8z"
        fill="rgba(15,23,42,0.28)"
      />
      <path d="M48 26h104v10H48V26z" fill="rgba(15,23,42,0.38)" />
      <path d="M58 18l-8 8h16l6-8H58z" fill="rgba(15,23,42,0.22)" />

      <path d="M24 42h8v6h-8v-6z" fill="#fef9c3" opacity="0.85" />
      <path d="M168 42h8v5h-8v-5z" fill="#fecaca" opacity="0.75" />

      <circle cx="58" cy="52" r="13" fill="#18181b" />
      <circle cx="58" cy="52" r="9" fill={wheelColorHex} />
      <circle cx="58" cy="52" r="4.5" fill={rim} opacity="0.55" />

      <circle cx="142" cy="52" r="13" fill="#18181b" />
      <circle cx="142" cy="52" r="9" fill={wheelColorHex} />
      <circle cx="142" cy="52" r="4.5" fill={rim} opacity="0.55" />

      <path
        d="M34 36c6-2 14-3 22-3h88c8 0 16 1 22 3"
        stroke={bodyLight}
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.65"
      />
    </svg>
  );
}

/** Седан — классический трёхобъёмник */
function SedanSilhouette({ bodyColorHex, wheelColorHex, className }: SilhouetteProps) {
  const bodyDark = shadeHex(bodyColorHex, -0.14);
  const bodyLight = shadeHex(bodyColorHex, 0.1);
  const rim = shadeHex(wheelColorHex, 0.18);

  return (
    <svg viewBox="0 0 200 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <GroundShadow />
      <path
        d="M22 52h156c2 0 3-1 3-3V40c0-7-4-13-10-16l-12-5C150 14 140 12 128 12H72c-12 0-22 2-30 7L30 24C24 27 20 33 20 40v9c0 2 1 3 3 3z"
        fill={bodyColorHex}
      />
      <path d="M72 12h56c12 0 22 2 30 7l12 5c2 1 4 3 5 5H35c1-2 3-4 5-5l12-5c8-5 18-7 30-7z" fill={bodyLight} />
      <path d="M20 49h160v3c0 2-1 3-3 3H23c-2 0-3-1-3-3v-3z" fill={bodyDark} />
      <path d="M52 20h96l8 7H44l8-7z" fill="rgba(15,23,42,0.3)" />
      <path d="M44 27h112v11H44V27z" fill="rgba(15,23,42,0.38)" />
      <circle cx="56" cy="52" r="13" fill="#18181b" />
      <circle cx="56" cy="52" r="9" fill={wheelColorHex} />
      <circle cx="56" cy="52" r="4.5" fill={rim} opacity="0.55" />
      <circle cx="144" cy="52" r="13" fill="#18181b" />
      <circle cx="144" cy="52" r="9" fill={wheelColorHex} />
      <circle cx="144" cy="52" r="4.5" fill={rim} opacity="0.55" />
    </svg>
  );
}

/** SUV — высокий кузов */
function SuvSilhouette({ bodyColorHex, wheelColorHex, className }: SilhouetteProps) {
  const bodyDark = shadeHex(bodyColorHex, -0.14);
  const bodyLight = shadeHex(bodyColorHex, 0.1);
  const rim = shadeHex(wheelColorHex, 0.18);

  return (
    <svg viewBox="0 0 200 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <GroundShadow />
      <path
        d="M18 52h164c2 0 3-1 3-3V36c0-6-3-11-8-14l-10-4C158 14 148 12 132 12H68c-16 0-26 2-34 7L24 23C19 26 16 31 16 36v13c0 2 1 3 3 3z"
        fill={bodyColorHex}
      />
      <path d="M68 12h64c16 0 26 2 34 7l10 4c3 1 5 3 6 5H28c1-2 3-4 6-5l10-4c8-5 18-7 34-7z" fill={bodyLight} />
      <path d="M16 49h168v3c0 2-1 3-3 3H19c-2 0-3-1-3-3v-3z" fill={bodyDark} />
      <path d="M46 18h108l6 8H40l6-8z" fill="rgba(15,23,42,0.3)" />
      <path d="M40 26h120v14H40V26z" fill="rgba(15,23,42,0.38)" />
      <circle cx="54" cy="52" r="14" fill="#18181b" />
      <circle cx="54" cy="52" r="10" fill={wheelColorHex} />
      <circle cx="54" cy="52" r="5" fill={rim} opacity="0.55" />
      <circle cx="146" cy="52" r="14" fill="#18181b" />
      <circle cx="146" cy="52" r="10" fill={wheelColorHex} />
      <circle cx="146" cy="52" r="5" fill={rim} opacity="0.55" />
    </svg>
  );
}

/** Пикап */
function TruckSilhouette({ bodyColorHex, wheelColorHex, className }: SilhouetteProps) {
  const bodyDark = shadeHex(bodyColorHex, -0.14);
  const bodyLight = shadeHex(bodyColorHex, 0.1);
  const rim = shadeHex(wheelColorHex, 0.18);

  return (
    <svg viewBox="0 0 200 72" fill="none" xmlns="http://www.w3.org/2000/svg" className={className} aria-hidden>
      <GroundShadow />
      <path d="M18 52h164c2 0 3-1 3-3V38c0-5-2-9-6-12l-8-4C158 18 148 16 118 16H78c-8 0-14 1-18 3v33z" fill={bodyColorHex} />
      <path d="M118 16h30c10 0 20 2 28 8l8 4c2 1 3 3 4 5H78V16h40z" fill={bodyLight} />
      <path d="M78 16v36H18V38c0-5 2-9 6-12 8-5 18-8 28-10H78z" fill={bodyColorHex} />
      <path d="M18 49h164v3c0 2-1 3-3 3H21c-2 0-3-1-3-3v-3z" fill={bodyDark} />
      <path d="M26 24h34l4 7H26v-7z" fill="rgba(15,23,42,0.35)" />
      <circle cx="52" cy="52" r="13" fill="#18181b" />
      <circle cx="52" cy="52" r="9" fill={wheelColorHex} />
      <circle cx="142" cy="52" r="13" fill="#18181b" />
      <circle cx="142" cy="52" r="9" fill={wheelColorHex} />
      <circle cx="142" cy="52" r="4.5" fill={rim} opacity="0.55" />
    </svg>
  );
}

export function VehicleSilhouette({
  silhouetteId,
  bodyColorHex,
  wheelColorHex,
  className = "h-[68px] w-[156px]",
}: SilhouetteProps & { silhouetteId: VehicleSilhouetteId }) {
  const props = { bodyColorHex, wheelColorHex, className };

  switch (silhouetteId) {
    case "sport-coupe":
    case "sports-super":
      return <SportCoupeSilhouette {...props} />;
    case "suv-compact":
    case "suv-mid":
      return <SuvSilhouette {...props} />;
    case "truck":
      return <TruckSilhouette {...props} />;
    case "hatchback":
    case "wagon":
    case "sedan":
    default:
      return <SedanSilhouette {...props} />;
  }
}
