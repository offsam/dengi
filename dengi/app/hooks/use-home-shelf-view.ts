"use client";

import { useCallback, useSyncExternalStore } from "react";
import type { HomeShelfId } from "@/lib/home/layout-order";
import {
  homeShelfViewEvent,
  readHomeShelfView,
  writeHomeShelfView,
  type HomeShelfView,
} from "@/lib/home/shelf-view";

const shelfViewCache: Partial<Record<HomeShelfId, { raw: string; view: HomeShelfView }>> = {};

function invalidateShelfViewCache(shelfId: HomeShelfId) {
  delete shelfViewCache[shelfId];
}

function getSnapshot(shelfId: HomeShelfId) {
  const raw = window.localStorage.getItem(`dengi:shelf-view:${shelfId}`) ?? "__default__";
  const cached = shelfViewCache[shelfId];

  if (cached && cached.raw === raw) {
    return cached.view;
  }

  const view = readHomeShelfView(shelfId);
  shelfViewCache[shelfId] = { raw, view };
  return view;
}

function subscribe(shelfId: HomeShelfId, onStoreChange: () => void) {
  const eventName = homeShelfViewEvent(shelfId);
  const handler = () => onStoreChange();
  window.addEventListener(eventName, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(eventName, handler);
    window.removeEventListener("storage", handler);
  };
}

function getServerSnapshot(): HomeShelfView {
  return "full";
}

export function useHomeShelfView(shelfId: HomeShelfId) {
  const view = useSyncExternalStore(
    (onStoreChange) => subscribe(shelfId, onStoreChange),
    () => getSnapshot(shelfId),
    getServerSnapshot
  );

  const setView = useCallback(
    (next: HomeShelfView) => {
      writeHomeShelfView(shelfId, next);
      invalidateShelfViewCache(shelfId);
      window.dispatchEvent(new Event(homeShelfViewEvent(shelfId)));
    },
    [shelfId]
  );

  return { view, setView };
}
