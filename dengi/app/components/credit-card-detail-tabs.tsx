import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";

export type CreditCardDetailTab = "settings" | "transactions" | "report";

const TABS: { id: CreditCardDetailTab; label: string }[] = [
  { id: "report", label: "Отчёт" },
  { id: "transactions", label: "Транзакции" },
  { id: "settings", label: "Настройки" },
];

export function CreditCardDetailTabs({
  active,
  onChange,
}: {
  active: CreditCardDetailTab;
  onChange: (tab: CreditCardDetailTab) => void;
}) {
  return (
    <BubbleSegmentedControl
      options={TABS}
      value={active}
      onChange={onChange}
      ariaLabel="Разделы карты"
    />
  );
}
