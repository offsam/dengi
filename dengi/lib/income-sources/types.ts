import type { AppLang } from "@/lib/i18n/types";
import { messages } from "@/lib/i18n/messages";
import { readIncomeSources } from "./storage";

export type IncomeSourceKind = "salary" | "freelance" | "rental" | "other";

/** Личная заметка об ожидаемом доходе — не участвует в чистом капитале и сводке */
export type IncomeSource = {
  id: string;
  kind: IncomeSourceKind;
  /** Подпись типа, если выбрано «Другое» */
  customKindLabel?: string;
  name: string;
  monthlyAmount: number;
  accentColor: string;
};

export type IncomeSourceDraft = Omit<IncomeSource, "id">;

export const INCOME_SOURCE_KIND_PRESETS = [
  { kind: "salary" as const, label: "Зарплата", accentColor: "bg-teal-600" },
  { kind: "freelance" as const, label: "Фриланс", accentColor: "bg-violet-600" },
  { kind: "rental" as const, label: "Аренда", accentColor: "bg-amber-600" },
  { kind: "other" as const, label: "Другое", accentColor: "bg-zinc-600" },
] as const;

export const INCOME_SOURCES_SEED: IncomeSource[] = [
  {
    id: "inc-1",
    kind: "salary",
    name: "Основная работа",
    monthlyAmount: 5_200,
    accentColor: "bg-teal-600",
  },
];

export function resolveIncomeSourceKindPreset(kind: IncomeSourceKind) {
  return (
    INCOME_SOURCE_KIND_PRESETS.find((preset) => preset.kind === kind) ??
    INCOME_SOURCE_KIND_PRESETS[3]
  );
}

export function getIncomeSourceKindLabel(
  source: Pick<IncomeSource, "kind" | "customKindLabel">,
  lang: AppLang = "ru"
) {
  if (source.kind === "other" && source.customKindLabel?.trim()) {
    return source.customKindLabel.trim();
  }

  return messages[lang].incomeKind[source.kind];
}

export function createEmptyIncomeSourceDraft(): IncomeSourceDraft {
  const preset = INCOME_SOURCE_KIND_PRESETS[0];

  return {
    kind: preset.kind,
    name: "",
    monthlyAmount: 0,
    accentColor: preset.accentColor,
  };
}

export function getIncomeSource(id: string | undefined) {
  if (!id) {
    return null;
  }

  return readIncomeSources().find((source) => source.id === id) ?? null;
}
