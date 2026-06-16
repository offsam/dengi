import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";

export type AutoVehicleDetailTab = "payments" | "expenses" | "stats" | "settings";

const TABS: { id: AutoVehicleDetailTab; label: string }[] = [
  { id: "stats", label: "Статистика" },
  { id: "payments", label: "Платежи" },
  { id: "expenses", label: "Расходы" },
  { id: "settings", label: "Настройки" },
];

export function AutoVehicleDetailTabs({
  active,
  onChange,
}: {
  active: AutoVehicleDetailTab;
  onChange: (tab: AutoVehicleDetailTab) => void;
}) {
  return (
    <BubbleSegmentedControl
      options={TABS}
      value={active}
      onChange={onChange}
      ariaLabel="Разделы автомобиля"
    />
  );
}
