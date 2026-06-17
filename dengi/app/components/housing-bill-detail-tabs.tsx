import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";

export type HousingBillDetailTab = "overview" | "history" | "settings";

const TABS: { id: HousingBillDetailTab; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "history", label: "История" },
  { id: "settings", label: "Настройки" },
];

export function HousingBillDetailTabs({
  active,
  onChange,
}: {
  active: HousingBillDetailTab;
  onChange: (tab: HousingBillDetailTab) => void;
}) {
  return (
    <BubbleSegmentedControl
      options={TABS}
      value={active}
      onChange={onChange}
      ariaLabel="Разделы счёта"
    />
  );
}
