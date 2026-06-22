"use client";

import { BubbleSegmentedControl } from "@/app/components/bubble-segmented-control";
import { useLocale } from "@/app/components/locale-provider";

export type DebitCashDetailTab = "overview" | "activity" | "settings";

export function DebitCashDetailTabs({
  active,
  onChange,
}: {
  active: DebitCashDetailTab;
  onChange: (tab: DebitCashDetailTab) => void;
}) {
  const { t } = useLocale();
  const tabs: { id: DebitCashDetailTab; label: string }[] = [
    { id: "overview", label: t("debit.tabs.overview") },
    { id: "activity", label: t("debit.tabs.activity") },
    { id: "settings", label: t("credit.tabs.settings") },
  ];

  return (
    <BubbleSegmentedControl
      options={tabs}
      value={active}
      onChange={onChange}
      ariaLabel={t("debit.tabs.ariaLabel")}
    />
  );
}
