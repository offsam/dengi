const COLOR_MAP: Record<string, string> = {
  white: "#f3f4f6",
  black: "#171717",
  silver: "#c4c4c4",
  gray: "#9ca3af",
  grey: "#9ca3af",
  red: "#dc2626",
  blue: "#2563eb",
  green: "#16a34a",
  yellow: "#eab308",
  orange: "#ea580c",
  brown: "#92400e",
  beige: "#d6cfc4",
  gold: "#ca8a04",
  purple: "#7c3aed",
  // русские
  белый: "#f3f4f6",
  белая: "#f3f4f6",
  белое: "#f3f4f6",
  чёрный: "#171717",
  черный: "#171717",
  чёрная: "#171717",
  черная: "#171717",
  серебро: "#c4c4c4",
  серебристый: "#c4c4c4",
  серый: "#9ca3af",
  серая: "#9ca3af",
  красный: "#dc2626",
  красная: "#dc2626",
  синий: "#2563eb",
  синяя: "#2563eb",
  зелёный: "#16a34a",
  зеленый: "#16a34a",
  жёлтый: "#eab308",
  желтый: "#eab308",
  оранжевый: "#ea580c",
  оранжевая: "#ea580c",
  фиолетовый: "#7c3aed",
  фиолетовая: "#7c3aed",
  коричневый: "#78716c",
  коричневая: "#78716c",
  бежевый: "#d6cfc4",
  бежевая: "#d6cfc4",
  золотой: "#ca8a04",
  золотая: "#ca8a04",
};

export function resolveVehicleColorHex(input: string, fallback = "#d4d4d8") {
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

/** Популярные цвета кузова (US-рынок) */
export const POPULAR_BODY_COLORS: VehicleBodyColor[] = [
  { label: "белый", hex: "#f3f4f6" },
  { label: "чёрный", hex: "#171717" },
  { label: "серебристый", hex: "#c4c4c4" },
  { label: "серый", hex: "#6b7280" },
  { label: "синий", hex: "#2563eb" },
  { label: "красный", hex: "#dc2626" },
  { label: "зелёный", hex: "#16a34a" },
  { label: "оранжевый", hex: "#ea580c" },
  { label: "жёлтый", hex: "#eab308" },
  { label: "коричневый", hex: "#78716c" },
  { label: "бежевый", hex: "#d6cfc4" },
  { label: "фиолетовый", hex: "#7c3aed" },
  { label: "золотой", hex: "#ca8a04" },
];

export function findPopularBodyColorByHex(hex: string) {
  const normalized = hex.trim().toLowerCase();
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
