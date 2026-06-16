"use client";

import { useState } from "react";
import { CreditCardAddDialog } from "@/app/components/credit-card-add-dialog";
import { CreditCardCarousel } from "@/app/components/credit-card-carousel";
import { useCreditCards } from "@/app/hooks/use-credit-cards";

function Shelf({
  title,
  onAddLabel,
  onAdd,
  children,
}: {
  title: string;
  onAddLabel: string;
  onAdd: () => void;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        <button
          type="button"
          onClick={onAdd}
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
          aria-label={onAddLabel}
        >
          Добавить
        </button>
      </div>
      {children}
    </section>
  );
}

export function CreditCardsShelf() {
  const { cards, addCard } = useCreditCards();
  const [addOpen, setAddOpen] = useState(false);
  const [addSession, setAddSession] = useState(0);

  return (
    <>
      <Shelf
        title="Кредитные карты"
        onAddLabel="Добавить кредитную карту"
        onAdd={() => {
          setAddSession((current) => current + 1);
          setAddOpen(true);
        }}
      >
        <CreditCardCarousel cards={cards} />
      </Shelf>

      <CreditCardAddDialog
        key={addSession}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addCard}
      />
    </>
  );
}
