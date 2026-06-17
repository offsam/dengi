import type { HomeShelfId } from "@/lib/home/layout-order";

export type HomeShelfView = "full" | "minimal";

const STORAGE_PREFIX = "dengi:shelf-view:";
const LEGACY_CREDIT_CARDS_KEY = "dengi:credit-cards-shelf-view";

export function readHomeShelfView(shelfId: HomeShelfId): HomeShelfView {
  if (typeof window === "undefined") {
    return "full";
  }

  try {
    const raw = window.localStorage.getItem(`${STORAGE_PREFIX}${shelfId}`);
    if (raw === "minimal" || raw === "full") {
      return raw;
    }

    if (shelfId === "creditCards") {
      const legacy = window.localStorage.getItem(LEGACY_CREDIT_CARDS_KEY);
      if (legacy === "minimal" || legacy === "full") {
        return legacy;
      }
    }

    return "full";
  } catch {
    return "full";
  }
}

export function writeHomeShelfView(shelfId: HomeShelfId, view: HomeShelfView) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(`${STORAGE_PREFIX}${shelfId}`, view);

  if (shelfId === "creditCards") {
    window.localStorage.setItem(LEGACY_CREDIT_CARDS_KEY, view);
  }
}

export function homeShelfViewEvent(shelfId: HomeShelfId) {
  return `dengi:shelf-view-updated:${shelfId}`;
}
