import { shadeHex } from "./colors";

type FictionalCarProps = {
  bodyColorHex: string;
  wheelColorHex: string;
  className?: string;
};

/** Voltara Prism — вымышленное купе, не привязано к реальному бренду */
export function FictionalCarSilhouette({
  bodyColorHex,
  wheelColorHex,
  className,
}: FictionalCarProps) {
  const bodyDark = shadeHex(bodyColorHex, -0.16);
  const bodyLight = shadeHex(bodyColorHex, 0.12);
  const bodyMid = shadeHex(bodyColorHex, -0.05);
  const rim = shadeHex(wheelColorHex, 0.22);

  return (
    <svg
      viewBox="0 0 220 78"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      aria-hidden
    >
      <ellipse cx="110" cy="70" rx="78" ry="4.5" className="fill-zinc-300/40" />

      {/* Низ кузова */}
      <path
        d="M18 58h184c2.5 0 4-1.5 4-4V42c0-9-6-16-14-19L88 12C80 9 72 8 62 8H38C28 8 20 11 14 16L8 22C4 26 2 32 2 38v16c0 2.5 1.5 4 4 4h12z"
        fill={bodyColorHex}
      />

      {/* Крыша и fastback */}
      <path
        d="M38 8h52c12 0 22 3 30 9l36 22c6 4 10 9 12 15H14c3-6 8-11 14-15L38 8z"
        fill={bodyLight}
      />

      {/* Характерная линия борта */}
      <path
        d="M18 55h184v3c0 2.5-1.5 4-4 4H22c-2.5 0-4-1.5-4-4v-3z"
        fill={bodyDark}
      />
      <path
        d="M52 28h116l8 6H44l8-6z"
        fill={bodyMid}
        opacity="0.55"
      />

      {/* Стекла */}
      <path
        d="M52 14h68l22 14H30l22-14z"
        fill="rgba(15,23,42,0.24)"
      />
      <path d="M30 28h160v12H30V28z" fill="rgba(15,23,42,0.36)" />
      <path d="M52 14l-10 14h18l8-14H52z" fill="rgba(15,23,42,0.18)" />

      {/* Светящаяся полоска — фирменная «Voltara» */}
      <path
        d="M14 38h8l4-6 4 6h8l-6 10H20l-6-10z"
        fill={bodyLight}
        opacity="0.85"
      />

      {/* Колёса */}
      <circle cx="54" cy="58" r="14" fill="#18181b" />
      <circle cx="54" cy="58" r="10" fill={wheelColorHex} />
      <circle cx="54" cy="58" r="5" fill={rim} opacity="0.6" />

      <circle cx="166" cy="58" r="14" fill="#18181b" />
      <circle cx="166" cy="58" r="10" fill={wheelColorHex} />
      <circle cx="166" cy="58" r="5" fill={rim} opacity="0.6" />
    </svg>
  );
}
