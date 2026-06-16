const COLOR_MAP: Record<string, string> = {
  white: "#F4F0EC",
  black: "#6B6E78",
  silver: "#D4DCE4",
  gray: "#BFC5CE",
  grey: "#BFC5CE",
  red: "#E8B4B4",
  blue: "#AEC8E8",
  green: "#B8DCC8",
  yellow: "#F2E4B0",
  orange: "#F0D0B0",
  brown: "#D4C0B0",
  beige: "#E8DFD4",
  gold: "#E8D8A8",
  purple: "#CFC4E8",
  // русские
  белый: "#F4F0EC",
  белая: "#F4F0EC",
  белое: "#F4F0EC",
  чёрный: "#6B6E78",
  черный: "#6B6E78",
  чёрная: "#6B6E78",
  черная: "#6B6E78",
  серебро: "#D4DCE4",
  серебристый: "#D4DCE4",
  серый: "#BFC5CE",
  серая: "#BFC5CE",
  красный: "#E8B4B4",
  красная: "#E8B4B4",
  синий: "#AEC8E8",
  синяя: "#AEC8E8",
  зелёный: "#B8DCC8",
  зеленый: "#B8DCC8",
  жёлтый: "#F2E4B0",
  желтый: "#F2E4B0",
  оранжевый: "#F0D0B0",
  оранжевая: "#F0D0B0",
  фиолетовый: "#CFC4E8",
  фиолетовая: "#CFC4E8",
  коричневый: "#D4C0B0",
  коричневая: "#D4C0B0",
  бежевый: "#E8DFD4",
  бежевая: "#E8DFD4",
  золотой: "#E8D8A8",
  золотая: "#E8D8A8",
};

/** Старые насыщенные hex → ближайший пастельный из палитры */
const LEGACY_HEX_MAP: Record<string, string> = {
  "#f3f4f6": "#F4F0EC",
  "#171717": "#6B6E78",
  "#c4c4c4": "#D4DCE4",
  "#9ca3af": "#BFC5CE",
  "#6b7280": "#BFC5CE",
  "#2563eb": "#AEC8E8",
  "#dc2626": "#E8B4B4",
  "#16a34a": "#B8DCC8",
  "#ea580c": "#F0D0B0",
  "#eab308": "#F2E4B0",
  "#78716c": "#D4C0B0",
  "#d6cfc4": "#E8DFD4",
  "#7c3aed": "#CFC4E8",
  "#ca8a04": "#E8D8A8",
  "#e8eaed": "#D4DCE4",
};

export function resolveVehicleColorHex(input: string, fallback = "#D4DCE4") {
  const key = input.trim().toLowerCase();
  return COLOR_MAP[key] ?? fallback;
}

export function hexToRgb(hex: string) {
  const normalized = hex.replace("#", "");
  const value =
    normalized.length === 3
      ? normalized
          .split("")
          .map((char) => char + char)
          .join("")
      : normalized;

  const int = Number.parseInt(value, 16);
  if (!Number.isFinite(int)) {
    return { r: 200, g: 200, b: 200 };
  }

  return {
    r: (int >> 16) & 255,
    g: (int >> 8) & 255,
    b: int & 255,
  };
}

export function shadeHex(hex: string, amount: number) {
  const { r, g, b } = hexToRgb(hex);
  const mix = (channel: number) =>
    Math.max(0, Math.min(255, Math.round(channel + amount * 255)));

  return `rgb(${mix(r)}, ${mix(g)}, ${mix(b)})`;
}

export type VehicleBodyColor = {
  label: string;
  hex: string;
};

/** Популярные цвета кузова — пастельная палитра */
export const POPULAR_BODY_COLORS: VehicleBodyColor[] = [
  { label: "белый", hex: "#F4F0EC" },
  { label: "чёрный", hex: "#6B6E78" },
  { label: "серебристый", hex: "#D4DCE4" },
  { label: "серый", hex: "#BFC5CE" },
  { label: "синий", hex: "#AEC8E8" },
  { label: "красный", hex: "#E8B4B4" },
  { label: "зелёный", hex: "#B8DCC8" },
  { label: "оранжевый", hex: "#F0D0B0" },
  { label: "жёлтый", hex: "#F2E4B0" },
  { label: "коричневый", hex: "#D4C0B0" },
  { label: "бежевый", hex: "#E8DFD4" },
  { label: "фиолетовый", hex: "#CFC4E8" },
  { label: "золотой", hex: "#E8D8A8" },
];

export function findPopularBodyColorByHex(hex: string) {
  const normalized = hex.trim().toLowerCase();
  const legacy = LEGACY_HEX_MAP[normalized];
  if (legacy) {
    return POPULAR_BODY_COLORS.find((color) => color.hex.toLowerCase() === legacy) ?? null;
  }
  return POPULAR_BODY_COLORS.find((color) => color.hex.toLowerCase() === normalized) ?? null;
}

/** Сохраняем пользовательский цвет, если он не из палитры */
export function resolveVehicleBodyColor(saved: VehicleBodyColor): VehicleBodyColor {
  const byHex = findPopularBodyColorByHex(saved.hex);
  if (byHex) {
    return byHex;
  }

  const presetHex = resolveVehicleColorHex(saved.label, saved.hex);
  const byLabel = findPopularBodyColorByHex(presetHex);
  if (byLabel && byLabel.hex.toLowerCase() === presetHex.toLowerCase()) {
    return byLabel;
  }

  return {
    label: saved.label.trim() || "—",
    hex: saved.hex,
  };
}
