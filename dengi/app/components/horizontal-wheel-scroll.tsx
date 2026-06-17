"use client";

import { useEffect, useRef, type ReactNode } from "react";

type HorizontalWheelScrollProps = {
  children: ReactNode;
  className?: string;
  ariaLabel?: string;
};

/** На десктопе: колесо мыши над лентой листает её влево-вправо */
export function HorizontalWheelScroll({
  children,
  className = "",
  ariaLabel,
}: HorizontalWheelScrollProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }

    const scrollContainer = element;

    function onWheel(event: WheelEvent) {
      if (scrollContainer.scrollWidth <= scrollContainer.clientWidth + 1) {
        return;
      }

      const dominantDelta =
        Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;

      if (dominantDelta === 0) {
        return;
      }

      event.preventDefault();
      scrollContainer.scrollLeft += dominantDelta;
    }

    scrollContainer.addEventListener("wheel", onWheel, { passive: false });
    return () => scrollContainer.removeEventListener("wheel", onWheel);
  }, []);

  return (
    <div ref={ref} className={className} aria-label={ariaLabel}>
      {children}
    </div>
  );
}
