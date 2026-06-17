"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { HomeShelfView } from "@/lib/home/shelf-view";

const VIEW_FADE_MS = 140;

export function useShelfViewFade(view: HomeShelfView) {
  const [displayView, setDisplayView] = useState(view);
  const [visible, setVisible] = useState(true);
  const fadeTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
      }
    };
  }, []);

  const switchView = useCallback(
    (next: HomeShelfView, onApply: (value: HomeShelfView) => void) => {
      if (next === view) {
        return;
      }

      if (fadeTimerRef.current !== null) {
        window.clearTimeout(fadeTimerRef.current);
      }

      onApply(next);

      const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (reduceMotion) {
        setDisplayView(next);
        setVisible(true);
        return;
      }

      setVisible(false);
      fadeTimerRef.current = window.setTimeout(() => {
        setDisplayView(next);
        requestAnimationFrame(() => {
          setVisible(true);
        });
        fadeTimerRef.current = null;
      }, VIEW_FADE_MS);
    },
    [view]
  );

  return { displayView, visible, switchView };
}
