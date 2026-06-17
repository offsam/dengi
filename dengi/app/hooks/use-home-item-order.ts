"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import {
  applyItemOrder,
  HOME_ITEM_ORDER_PREFIX,
  mergeItemOrder,
  moveInArray,
  readHomeItemOrder,
  writeHomeItemOrder,
  type HomeShelfId,
} from "@/lib/home/layout-order";

type ItemOrderCacheEntry = {
  storageRaw: string;
  itemIdsKey: string;
  order: string[];
};

const itemOrderCache: Partial<Record<HomeShelfId, ItemOrderCacheEntry>> = {};

function itemOrderEvent(category: HomeShelfId) {
  return `dengi:home-item-order-updated:${category}`;
}

function invalidateItemOrderCache(category: HomeShelfId) {
  delete itemOrderCache[category];
}

function getItemOrderSnapshot(category: HomeShelfId, itemIds: string[]) {
  const itemIdsKey = itemIds.join("|");
  const storageRaw =
    window.localStorage.getItem(`${HOME_ITEM_ORDER_PREFIX}${category}`) ?? "__empty__";
  const cached = itemOrderCache[category];

  if (
    cached &&
    cached.storageRaw === storageRaw &&
    cached.itemIdsKey === itemIdsKey
  ) {
    return cached.order;
  }

  const order = mergeItemOrder(readHomeItemOrder(category), itemIds);
  itemOrderCache[category] = { storageRaw, itemIdsKey, order };
  return order;
}

function subscribe(category: HomeShelfId, onStoreChange: () => void) {
  const eventName = itemOrderEvent(category);
  const handler = () => onStoreChange();
  window.addEventListener(eventName, handler);
  window.addEventListener("storage", handler);
  return () => {
    window.removeEventListener(eventName, handler);
    window.removeEventListener("storage", handler);
  };
}

function notifyItemOrderChanged(category: HomeShelfId) {
  invalidateItemOrderCache(category);
  window.dispatchEvent(new Event(itemOrderEvent(category)));
}

export function useHomeItemOrder<T extends { id: string }>(
  category: HomeShelfId,
  items: T[]
) {
  const itemIds = useMemo(() => items.map((item) => item.id), [items]);

  const storedOrder = useSyncExternalStore(
    (onStoreChange) => subscribe(category, onStoreChange),
    () => getItemOrderSnapshot(category, itemIds),
    () => itemIds
  );

  const orderedItems = useMemo(
    () => applyItemOrder(items, storedOrder),
    [items, storedOrder]
  );

  const moveItem = useCallback(
    (id: string, direction: -1 | 1) => {
      const currentOrder = applyItemOrder(items, storedOrder).map((item) => item.id);
      const index = currentOrder.indexOf(id);
      const next = moveInArray(currentOrder, index, direction);
      if (!next) {
        return;
      }

      writeHomeItemOrder(category, next);
      notifyItemOrderChanged(category);
    },
    [category, items, storedOrder]
  );

  return { orderedItems, moveItem };
}
