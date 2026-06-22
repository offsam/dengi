"use client";

import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";
import { useLocale } from "@/app/components/locale-provider";

export type CreditCardDetailTab = "settings" | "transactions" | "report";

export function CreditCardDetailTabs({
  active,
  onChange,
}: {
  active: CreditCardDetailTab;
  onChange: (tab: CreditCardDetailTab) => void;
}) {
  const { t } = useLocale();
  const tabs: { id: CreditCardDetailTab; label: string }[] = [
    { id: "report", label: t("credit.tabs.report") },
    { id: "transactions", label: t("credit.tabs.transactions") },
    { id: "settings", label: t("credit.tabs.settings") },
  ];

  return (
    <BubbleSegmentedControl
      options={tabs}
      value={active}
      onChange={onChange}
      ariaLabel={t("credit.tabs.ariaLabel")}
    />
  );
}
