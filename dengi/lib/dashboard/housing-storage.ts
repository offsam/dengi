import { SEED_HOUSING_BILLS, type HousingBill } from "./housing-bills";

const STORAGE_KEY = "dengi:housing-bills";

export function readHousingBills(): HousingBill[] {
  if (typeof window === "undefined") {
    return SEED_HOUSING_BILLS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return SEED_HOUSING_BILLS;
    }

    const parsed = JSON.parse(raw) as HousingBill[];
    return Array.isArray(parsed) ? parsed : SEED_HOUSING_BILLS;
  } catch {
    return SEED_HOUSING_BILLS;
  }
}

export function writeHousingBills(bills: HousingBill[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(bills));
}

export function addHousingBill(draft: Omit<HousingBill, "id">) {
  const bills = readHousingBills();
  const bill: HousingBill = {
    ...draft,
    id: crypto.randomUUID(),
  };
  const next = [...bills, bill];
  writeHousingBills(next);
  return next;
}

export function updateHousingBill(id: string, patch: Partial<HousingBill>) {
  const bills = readHousingBills();
  const next = bills.map((bill) =>
    bill.id === id ? { ...bill, ...patch, id: bill.id } : bill
  );
  writeHousingBills(next);
  return next;
}

export function deleteHousingBill(id: string) {
  const bills = readHousingBills();
  const next = bills.filter((bill) => bill.id !== id);
  writeHousingBills(next);
  return next;
}
