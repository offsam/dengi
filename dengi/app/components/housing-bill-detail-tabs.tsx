"use client";

import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";
import { useLocale } from "@/app/components/locale-provider";

export type HousingBillDetailTab = "overview" | "history" | "settings";

export function HousingBillDetailTabs({
  active,
  onChange,
}: {
  active: HousingBillDetailTab;
  onChange: (tab: HousingBillDetailTab) => void;
}) {
  const { t } = useLocale();
  const tabs: { id: HousingBillDetailTab; label: string }[] = [
    { id: "overview", label: t("housing.tabs.overview") },
    { id: "history", label: t("housing.tabs.history") },
    { id: "settings", label: t("credit.tabs.settings") },
  ];

  return (
    <BubbleSegmentedControl
      options={tabs}
      value={active}
      onChange={onChange}
      ariaLabel={t("housing.tabs.ariaLabel")}
    />
  );
}
