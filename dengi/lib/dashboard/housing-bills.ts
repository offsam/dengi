export type HousingBill = {
  id: string;
  name: string;
  date: string;
  amount: number;
};

export type HousingBillDraft = Omit<HousingBill, "id">;

export const SEED_HOUSING_BILLS: HousingBill[] = [
  { id: "hb-1", name: "Ипотека", date: "1 июл", amount: 2_150 },
  { id: "hb-2", name: "Электричество", date: "20 июн", amount: 142 },
  { id: "hb-3", name: "Интернет", date: "24 июн", amount: 79 },
  { id: "hb-4", name: "Вода", date: "26 июн", amount: 58 },
  { id: "hb-5", name: "ТСЖ", date: "5 июл", amount: 210 },
];

export function createEmptyHousingBillDraft(): HousingBillDraft {
  return {
    name: "",
    date: "",
    amount: 0,
  };
}

export function draftToPreviewHousingBill(draft: HousingBillDraft): HousingBill {
  return {
    id: "preview",
    name: draft.name.trim() || "Новый счёт",
    date: draft.date.trim() || "—",
    amount: draft.amount,
  };
}
