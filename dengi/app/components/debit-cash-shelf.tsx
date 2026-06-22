"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { DebitCashAddDialog } from "@/app/components/debit-cash-add-dialog";
import { DebitCashAccountCard } from "@/app/components/debit-cash-account-card";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { HorizontalWheelScroll } from "@/app/components/horizontal-wheel-scroll";
import { HorizontalReorderButtons } from "@/app/components/reorder-controls";
import { ShelfMinimalRows, splitShelfItemsIntoTwoRows } from "@/app/components/shelf-minimal-rows";
import { ShelfViewToggle } from "@/app/components/shelf-view-toggle";
import { useLocale } from "@/app/components/locale-provider";
import type { Translator } from "@/lib/i18n/translate";
import { useDebitCashAccounts } from "@/app/hooks/use-debit-cash-accounts";
import { useHomeItemOrder } from "@/app/hooks/use-home-item-order";
import { useHomeShelfView } from "@/app/hooks/use-home-shelf-view";
import { useShelfViewFade } from "@/app/hooks/use-shelf-view-fade";
import type { DebitCashAccount } from "@/lib/dashboard/debit-accounts";
import type { HomeShelfView } from "@/lib/home/shelf-view";

function renderDebitItem(
  account: DebitCashAccount,
  density: "full" | "minimal",
  editOrder: boolean,
  index: number,
  total: number,
  moveItem: (id: string, direction: -1 | 1) => void,
  t: Translator
) {
  const card = <DebitCashAccountCard account={account} density={density} />;

  if (editOrder) {
    return (
      <div key={account.id} className="flex shrink-0 items-center gap-1">
        <HorizontalReorderButtons
          canMoveLeft={index > 0}
          canMoveRight={index < total - 1}
          onMoveLeft={() => moveItem(account.id, -1)}
          onMoveRight={() => moveItem(account.id, 1)}
        />
        <div className="rounded-lg ring-1 ring-zinc-200/80">{card}</div>
      </div>
    );
  }

  return (
    <Link
      key={account.id}
      href={`/debit/${account.id}`}
      className="block shrink-0 snap-start rounded-lg transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      aria-label={t("common.openItem", { name: account.name })}
    >
      {card}
    </Link>
  );
}

export function DebitCashShelf({ editOrder = false }: { editOrder?: boolean }) {
  const { t } = useLocale();
  const { accounts, addAccount } = useDebitCashAccounts();
  const { orderedItems, moveItem } = useHomeItemOrder("debitCash", accounts);
  const { view, setView } = useHomeShelfView("debitCash");
  const { displayView, visible, switchView } = useShelfViewFade(view);
  const [addOpen, setAddOpen] = useState(false);
  const [addSession, setAddSession] = useState(0);
  const density = displayView === "minimal" ? "minimal" : "full";

  const handleViewChange = useCallback(
    (next: HomeShelfView) => {
      switchView(next, setView);
    },
    [setView, switchView]
  );

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
            {t("shelf.debitCash")}
          </h2>
          {!editOrder ? (
            <div className="flex shrink-0 items-center gap-2">
              <ShelfViewToggle view={view} onChange={handleViewChange} />
              <BubbleAddButton
                ariaLabel={t("shelf.addDebitCash")}
                onClick={() => {
                  setAddSession((current) => current + 1);
                  setAddOpen(true);
                }}
              />
            </div>
          ) : null}
        </div>

        <div
          className={`transition-opacity duration-150 ease-out ${
            visible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          {density === "minimal" ? (
            (() => {
              const [topRow, bottomRow] = splitShelfItemsIntoTwoRows(orderedItems);
              const total = orderedItems.length;

              return (
                <ShelfMinimalRows
                  ariaLabel={t("shelf.debitCash")}
                  topRow={topRow.map((account, index) =>
                    renderDebitItem(account, density, editOrder, index, total, moveItem, t)
                  )}
                  bottomRow={
                    bottomRow.length > 0
                      ? bottomRow.map((account, index) =>
                          renderDebitItem(
                            account,
                            density,
                            editOrder,
                            topRow.length + index,
                            total,
                            moveItem,
                            t
                          )
                        )
                      : undefined
                  }
                />
              );
            })()
          ) : (
            <HorizontalWheelScroll
              className="-mx-4 flex snap-x snap-mandatory gap-3 overflow-x-auto scroll-smooth px-4 pb-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              ariaLabel={t("shelf.debitCash")}
            >
              {orderedItems.map((account, index) =>
                renderDebitItem(account, density, editOrder, index, orderedItems.length, moveItem, t)
              )}
            </HorizontalWheelScroll>
          )}
        </div>
      </section>

      <DebitCashAddDialog
        key={addSession}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addAccount}
      />
    </>
  );
}
