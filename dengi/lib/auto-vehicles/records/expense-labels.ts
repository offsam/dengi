import type { AutoVehicleExpenseType, AutoVehicleRecord } from "./types";
import type { CustomExpenseCategory } from "./custom-expense-categories";

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
  customCategories: CustomExpenseCategory[] = []
) {
  if (record.customExpenseCategoryId) {
    const custom = customCategories.find(
      (category) => category.id === record.customExpenseCategoryId
    );

    return custom?.label ?? "Расход";
  }

  if (record.expenseType) {
    return AUTO_VEHICLE_EXPENSE_LABELS[record.expenseType];
  }

  return "Расход";
}

export function listBuiltInExpenseCategoryOptions() {
  return (Object.entries(AUTO_VEHICLE_EXPENSE_LABELS) as [AutoVehicleExpenseType, string][])
    .filter(([id]) => id !== "other")
    .map(([id, label]) => ({ id, label }));
}
