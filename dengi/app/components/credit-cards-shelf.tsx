"use client";

import { useCallback, useState } from "react";
import { CreditCardAddDialog } from "@/app/components/credit-card-add-dialog";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { CreditCardCarousel } from "@/app/components/credit-card-carousel";
import { useLocale } from "@/app/components/locale-provider";
import { ShelfViewToggle } from "@/app/components/shelf-view-toggle";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { useHomeItemOrder } from "@/app/hooks/use-home-item-order";
import { useHomeShelfView } from "@/app/hooks/use-home-shelf-view";
import { useShelfViewFade } from "@/app/hooks/use-shelf-view-fade";
import type { HomeShelfView } from "@/lib/home/shelf-view";

export function CreditCardsShelf({ editOrder = false }: { editOrder?: boolean }) {
  const { t } = useLocale();
  const { cards, addCard } = useCreditCards();
  const { orderedItems, moveItem } = useHomeItemOrder("creditCards", cards);
  const { view, setView } = useHomeShelfView("creditCards");
  const { displayView, visible, switchView } = useShelfViewFade(view);
  const [addOpen, setAddOpen] = useState(false);
  const [addSession, setAddSession] = useState(0);

  const handleViewChange = useCallback(
    (next: HomeShelfView) => {
      switchView(next, setView);
    },
    [setView, switchView]
  );

  return (
    <>
      <section className="space-y-3">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
            {t("shelf.creditCards")}
          </h2>

          <div className="flex shrink-0 items-center gap-2">
            {!editOrder ? (
              <ShelfViewToggle view={view} onChange={handleViewChange} />
            ) : null}
            {!editOrder ? (
              <BubbleAddButton
                ariaLabel={t("shelf.addCreditCard")}
                onClick={() => {
                  setAddSession((current) => current + 1);
                  setAddOpen(true);
                }}
              />
            ) : null}
          </div>
        </div>

        <div
          className={`transition-opacity duration-150 ease-out ${
            visible ? "opacity-100" : "pointer-events-none opacity-0"
          }`}
        >
          <CreditCardCarousel
            cards={orderedItems}
            density={displayView === "minimal" ? "minimal" : "full"}
            editOrder={editOrder}
            onMoveItem={moveItem}
          />
        </div>
      </section>

      <CreditCardAddDialog
        key={addSession}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addCard}
      />
    </>
  );
}
