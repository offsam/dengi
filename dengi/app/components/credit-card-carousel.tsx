"use client";

import Link from "next/link";
import { HorizontalWheelScroll } from "@/app/components/horizontal-wheel-scroll";
import { HorizontalReorderButtons } from "@/app/components/reorder-controls";
import { CreditCardTile, type CreditCardTileDensity } from "@/app/components/credit-card-tile";
import type { CreditCard } from "@/lib/credit-cards/types";

const COMPACT_ROW_CLASSNAME =
  "-mx-4 flex gap-1.5 overflow-x-auto scroll-smooth px-4 pb-0.5 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

const FULL_ROW_CLASSNAME =
  "-mx-4 flex snap-x snap-mandatory gap-2 overflow-x-auto scroll-smooth px-4 pb-1 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function splitCardsIntoTwoRows(cards: CreditCard[]) {
  const midpoint = Math.ceil(cards.length / 2);
  return [cards.slice(0, midpoint), cards.slice(midpoint)] as const;
}

function CreditCardItem({
  card,
  density,
  editOrder,
  index,
  total,
  onMoveItem,
}: {
  card: CreditCard;
  density: CreditCardTileDensity;
  editOrder: boolean;
  index: number;
  total: number;
  onMoveItem?: (id: string, direction: -1 | 1) => void;
}) {
  const tile = <CreditCardTile {...card} density={density} />;

  if (!editOrder) {
    return (
      <Link
        href={`/cards/${card.id}`}
        className="block shrink-0 rounded-lg transition-transform active:scale-[0.98] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-zinc-400"
        aria-label={`Открыть ${card.name}`}
      >
        {tile}
      </Link>
    );
  }

  return (
    <div className="flex shrink-0 items-center gap-1">
      <HorizontalReorderButtons
        canMoveLeft={index > 0}
        canMoveRight={index < total - 1}
        onMoveLeft={() => onMoveItem?.(card.id, -1)}
        onMoveRight={() => onMoveItem?.(card.id, 1)}
      />
      <div className="rounded-lg ring-1 ring-zinc-200/80">{tile}</div>
    </div>
  );
}

export function CreditCardCarousel({
  cards,
  density = "full",
  editOrder = false,
  onMoveItem,
}: {
  cards: CreditCard[];
  density?: CreditCardTileDensity;
  editOrder?: boolean;
  onMoveItem?: (id: string, direction: -1 | 1) => void;
}) {
  const total = cards.length;

  if (density === "minimal") {
    const [topRow, bottomRow] = splitCardsIntoTwoRows(cards);

    return (
      <div className="space-y-1.5" aria-label="Кредитные карты">
        <HorizontalWheelScroll className={COMPACT_ROW_CLASSNAME}>
          {topRow.map((card, index) => (
            <CreditCardItem
              key={card.id}
              card={card}
              density={density}
              editOrder={editOrder}
              index={index}
              total={total}
              onMoveItem={onMoveItem}
            />
          ))}
        </HorizontalWheelScroll>
        {bottomRow.length > 0 ? (
          <HorizontalWheelScroll className={COMPACT_ROW_CLASSNAME}>
            {bottomRow.map((card, index) => (
              <CreditCardItem
                key={card.id}
                card={card}
                density={density}
                editOrder={editOrder}
                index={topRow.length + index}
                total={total}
                onMoveItem={onMoveItem}
              />
            ))}
          </HorizontalWheelScroll>
        ) : null}
      </div>
    );
  }

  return (
    <HorizontalWheelScroll
      className={FULL_ROW_CLASSNAME}
      ariaLabel="Кредитные карты"
    >
      {cards.map((card, index) => (
        <CreditCardItem
          key={card.id}
          card={card}
          density={density}
          editOrder={editOrder}
          index={index}
          total={total}
          onMoveItem={onMoveItem}
        />
      ))}
    </HorizontalWheelScroll>
  );
}
