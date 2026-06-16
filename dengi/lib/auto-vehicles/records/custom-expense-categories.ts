export type CustomExpenseCategory = {
  id: string;
  vehicleId: string;
  label: string;
};

const STORAGE_KEY = "dengi:auto-vehicle-custom-expense-categories";

export function readCustomExpenseCategories(): CustomExpenseCategory[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return [];
    }

    const parsed = JSON.parse(raw) as CustomExpenseCategory[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function writeCustomExpenseCategories(categories: CustomExpenseCategory[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(categories));
}

export function readCustomExpenseCategoriesForVehicle(vehicleId: string) {
  return readCustomExpenseCategories()
    .filter((category) => category.vehicleId === vehicleId)
    .sort((left, right) => left.label.localeCompare(right.label, "ru"));
}

/** Найти или создать пользовательскую категорию по названию */
export function findOrCreateCustomExpenseCategory(vehicleId: string, label: string) {
  const normalized = label.trim();

  if (!normalized) {
    return null;
  }

  const categories = readCustomExpenseCategories();
  const existing = categories.find(
    (category) =>
      category.vehicleId === vehicleId &&
      category.label.localeCompare(normalized, "ru", { sensitivity: "accent" }) === 0
  );

  if (existing) {
    return existing;
  }

  const created: CustomExpenseCategory = {
    id: crypto.randomUUID(),
    vehicleId,
    label: normalized,
  };

  writeCustomExpenseCategories([...categories, created]);
  return created;
}

export function removeCustomExpenseCategoriesForVehicle(vehicleId: string) {
  const next = readCustomExpenseCategories().filter(
    (category) => category.vehicleId !== vehicleId
  );
  writeCustomExpenseCategories(next);
  return next;
}
