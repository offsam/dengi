import type { AppLang } from "@/lib/i18n/types";
import { getAutoExpenseTypeLabel } from "@/lib/i18n/labels";
import { translatePresetName } from "@/lib/i18n/presets";
import type { AutoVehicleExpenseType, AutoVehicleRecord } from "./types";
import type { CustomExpenseCategory } from "./custom-expense-categories";

/** @deprecated Используйте getAutoExpenseTypeLabel(type, lang) */
export const AUTO_VEHICLE_EXPENSE_LABELS: Record<AutoVehicleExpenseType, string> = {
  fuel: "Топливо",
  service: "Ремонт",
  upgrade: "Улучшения",
  insurance: "Страховка",
  parking: "Парковка",
  other: "Другое",
};

export const OTHER_EXPENSE_CATEGORY_ID = "other";

export function resolveExpenseCategoryLabel(
  record: Pick<AutoVehicleRecord, "expenseType" | "customExpenseCategoryId">,
  customCategories: CustomExpenseCategory[] = [],
  lang: AppLang = "ru"
) {
  if (record.customExpenseCategoryId) {
    const custom = customCategories.find(
      (category) => category.id === record.customExpenseCategoryId
    );

    return custom?.label ?? translatePresetName("Расход", lang);
  }

  if (record.expenseType) {
    return getAutoExpenseTypeLabel(record.expenseType, lang);
  }

  return translatePresetName("Расход", lang);
}

export function listBuiltInExpenseCategoryOptions(lang: AppLang = "ru") {
  return (Object.keys(AUTO_VEHICLE_EXPENSE_LABELS) as AutoVehicleExpenseType[])
    .filter((id) => id !== "other")
    .map((id) => ({ id, label: getAutoExpenseTypeLabel(id, lang) }));
}
