import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";

export type DebitCashDetailTab = "overview" | "activity" | "settings";

const TABS: { id: DebitCashDetailTab; label: string }[] = [
  { id: "overview", label: "Обзор" },
  { id: "activity", label: "Операции" },
  { id: "settings", label: "Настройки" },
];

export function DebitCashDetailTabs({
  active,
  onChange,
}: {
  active: DebitCashDetailTab;
  onChange: (tab: DebitCashDetailTab) => void;
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
