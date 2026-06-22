"use client";

import { useState } from "react";
import { IncomeSourcesShelf } from "@/app/components/income-sources-shelf";
import { AutoVehiclesShelf } from "@/app/components/auto-vehicles-shelf";
import { CreditCardsShelf } from "@/app/components/credit-cards-shelf";
import { DebitCashShelf } from "@/app/components/debit-cash-shelf";
import { HomeDashboardSummary } from "@/app/components/home-dashboard-summary";
import { HousingBillsShelf } from "@/app/components/housing-bills-shelf";
import { VerticalReorderButtons } from "@/app/components/reorder-controls";
import { useFinanceCloudSync } from "@/app/hooks/use-finance-cloud-sync";
import { useHomeShelfOrder } from "@/app/hooks/use-home-shelf-order";
import { useLocale } from "@/app/components/locale-provider";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import type { HomeShelfId } from "@/lib/home/layout-order";

function HomeOrderToggle({
  editOrder,
  onToggle,
  orderLabel,
  doneLabel,
}: {
  editOrder: boolean;
  onToggle: () => void;
  orderLabel: string;
  doneLabel: string;
}) {
  return (
    <div className="flex justify-end">
      <button
        type="button"
        onClick={onToggle}
        aria-pressed={editOrder}
        className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
          editOrder
            ? "bg-zinc-900 text-white"
            : "bg-zinc-100 text-zinc-600 hover:bg-zinc-200 hover:text-zinc-900"
        }`}
      >
        {editOrder ? doneLabel : orderLabel}
      </button>
    </div>
  );
}

function HomeShelfSection({
  shelfId,
  editOrder,
  index,
  total,
  onMoveShelf,
}: {
  shelfId: HomeShelfId;
  editOrder: boolean;
  index: number;
  total: number;
  onMoveShelf: (direction: -1 | 1) => void;
}) {
  const shelf = {
    creditCards: <CreditCardsShelf editOrder={editOrder} />,
    incomeSources: <IncomeSourcesShelf editOrder={editOrder} />,
    debitCash: <DebitCashShelf editOrder={editOrder} />,
    autoVehicles: <AutoVehiclesShelf editOrder={editOrder} />,
    housingBills: <HousingBillsShelf editOrder={editOrder} />,
  }[shelfId];

  return (
    <div
      className={`relative ${editOrder ? "rounded-2xl ring-1 ring-zinc-200/80" : ""} ${
        editOrder ? "pl-10 pr-2 py-2" : ""
      }`}
    >
      {editOrder ? (
        <VerticalReorderButtons
          className="absolute left-1 top-3"
          canMoveUp={index > 0}
          canMoveDown={index < total - 1}
          onMoveUp={() => onMoveShelf(-1)}
          onMoveDown={() => onMoveShelf(1)}
        />
      ) : null}
      {shelf}
    </div>
  );
}

export function HomeDashboard() {
  const [editOrder, setEditOrder] = useState(false);
  const { orderedShelfIds, moveShelf } = useHomeShelfOrder();
  const { t } = useLocale();
  useFinanceCloudSync();

  return (
    <div className={APP_PAGE_CLASS}>
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-6">
        <HomeDashboardSummary />

        <HomeOrderToggle
          editOrder={editOrder}
          onToggle={() => setEditOrder((value) => !value)}
          orderLabel={t("common.order")}
          doneLabel={t("common.done")}
        />

        {editOrder ? (
          <p className="-mt-4 text-xs leading-relaxed text-zinc-500">{t("home.orderHint")}</p>
        ) : null}

        {orderedShelfIds.map((shelfId, index) => (
          <HomeShelfSection
            key={shelfId}
            shelfId={shelfId}
            editOrder={editOrder}
            index={index}
            total={orderedShelfIds.length}
            onMoveShelf={(direction) => moveShelf(shelfId, direction)}
          />
        ))}
      </main>
    </div>
  );
}
