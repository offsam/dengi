"use client";

import Link from "next/link";
import { useCallback, useState } from "react";
import { IncomeSourceAddDialog } from "@/app/components/income-source-add-dialog";
import { IncomeSourceCard } from "@/app/components/income-source-card";
import { BubbleAddButton } from "@/app/components/bubble-add-button";
import { HorizontalWheelScroll } from "@/app/components/horizontal-wheel-scroll";
import { HorizontalReorderButtons } from "@/app/components/reorder-controls";
import { ShelfMinimalRows, splitShelfItemsIntoTwoRows } from "@/app/components/shelf-minimal-rows";
import { ShelfViewToggle } from "@/app/components/shelf-view-toggle";
import { useHomeItemOrder } from "@/app/hooks/use-home-item-order";
import { useHomeShelfView } from "@/app/hooks/use-home-shelf-view";
import { useIncomeSources } from "@/app/hooks/use-income-sources";
import { useShelfViewFade } from "@/app/hooks/use-shelf-view-fade";
import type { IncomeSource } from "@/lib/income-sources/types";
import type { HomeShelfView } from "@/lib/home/shelf-view";

function renderSourceItem(
  source: IncomeSource,
  density: "full" | "minimal",
  editOrder: boolean,
  index: number,
  total: number,
  moveItem: (id: string, direction: -1 | 1) => void
) {
  const card = <IncomeSourceCard {...source} density={density} />;

  if (editOrder) {
    return (
      <div key={source.id} className="flex shrink-0 items-center gap-1">
        <HorizontalReorderButtons
          canMoveLeft={index > 0}
          canMoveRight={index < total - 1}
          onMoveLeft={() => moveItem(source.id, -1)}
          onMoveRight={() => moveItem(source.id, 1)}
        />
        <div className="rounded-lg ring-1 ring-zinc-200/80">{card}</div>
      </div>
    );
  }

  return (
    <Link
      key={source.id}
      href={`/income/${source.id}`}
      className="block shrink-0 snap-start rounded-lg transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
      aria-label={`Открыть ${source.name}`}
    >
      {card}
    </Link>
  );
}

export function IncomeSourcesShelf({ editOrder = false }: { editOrder?: boolean }) {
  const { sources, addSource } = useIncomeSources();
  const { orderedItems, moveItem } = useHomeItemOrder("incomeSources", sources);
  const { view, setView } = useHomeShelfView("incomeSources");
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
            Источники доходов
          </h2>
          {!editOrder ? (
            <div className="flex shrink-0 items-center gap-2">
              <ShelfViewToggle view={view} onChange={handleViewChange} />
              <BubbleAddButton
                ariaLabel="Добавить источник дохода"
                onClick={() => {
                  setAddSession((current) => current + 1);
                  setAddOpen(true);
                }}
              />
            </div>
          ) : null}
        </div>

        {!editOrder ? (
          <p className="text-xs leading-relaxed text-zinc-500">
            Личная заметка: откуда ждёте деньги. Не входит в чистый капитал и другие расчёты
            на главной.
          </p>
        ) : null}

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
                  ariaLabel="Источники доходов"
                  topRow={topRow.map((source, index) =>
                    renderSourceItem(source, density, editOrder, index, total, moveItem)
                  )}
                  bottomRow={
                    bottomRow.length > 0
                      ? bottomRow.map((source, index) =>
                          renderSourceItem(
                            source,
                            density,
                            editOrder,
                            topRow.length + index,
                            total,
                            moveItem
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
              ariaLabel="Источники доходов"
            >
              {orderedItems.map((source, index) =>
                renderSourceItem(source, density, editOrder, index, orderedItems.length, moveItem)
              )}
            </HorizontalWheelScroll>
          )}
        </div>
      </section>

      <IncomeSourceAddDialog
        key={addSession}
        open={addOpen}
        onClose={() => setAddOpen(false)}
        onAdd={addSource}
      />
    </>
  );
}
