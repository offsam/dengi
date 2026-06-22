"use client";

import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";
import { useLocale } from "@/app/components/locale-provider";

export type AutoVehicleDetailTab = "payments" | "expenses" | "stats" | "settings";

export function AutoVehicleDetailTabs({
  active,
  onChange,
}: {
  active: AutoVehicleDetailTab;
  onChange: (tab: AutoVehicleDetailTab) => void;
}) {
  const { t } = useLocale();
  const tabs: { id: AutoVehicleDetailTab; label: string }[] = [
    { id: "stats", label: t("auto.tabs.stats") },
    { id: "payments", label: t("auto.tabs.payments") },
    { id: "expenses", label: t("auto.tabs.expenses") },
    { id: "settings", label: t("auto.tabs.settings") },
  ];

  return (
    <BubbleSegmentedControl
      options={tabs}
      value={active}
      onChange={onChange}
      ariaLabel={t("auto.tabs.ariaLabel")}
    />
  );
}
