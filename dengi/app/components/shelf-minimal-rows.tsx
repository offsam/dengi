"use client";

import { HorizontalWheelScroll } from "@/app/components/horizontal-wheel-scroll";

export const SHELF_MINIMAL_ROW_CLASSNAME =
  "-mx-4 flex gap-1.5 overflow-x-auto scroll-smooth px-4 pb-0.5 touch-pan-x [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

export function splitShelfItemsIntoTwoRows<T>(items: T[]) {
  const midpoint = Math.ceil(items.length / 2);
  return [items.slice(0, midpoint), items.slice(midpoint)] as const;
}

export function ShelfMinimalRows({
  ariaLabel,
  topRow,
  bottomRow,
}: {
  ariaLabel: string;
  topRow: React.ReactNode;
  bottomRow?: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5" aria-label={ariaLabel}>
      <HorizontalWheelScroll className={SHELF_MINIMAL_ROW_CLASSNAME}>
        {topRow}
      </HorizontalWheelScroll>
      {bottomRow ? (
        <HorizontalWheelScroll className={SHELF_MINIMAL_ROW_CLASSNAME}>
          {bottomRow}
        </HorizontalWheelScroll>
      ) : null}
    </div>
  );
}
