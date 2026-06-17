"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEED_CREDIT_CARDS } from "@/lib/credit-cards/seed";
import {
  addCreditCard as persistCreditCardAdd,
  deleteCreditCard as persistCreditCardDelete,
  readCreditCards,
  updateCreditCard as persistCreditCardUpdate,
  writeCreditCards,
} from "@/lib/credit-cards/storage";
import type { CreditCard, CreditCardDraft } from "@/lib/credit-cards/types";

const STORAGE_EVENT = "dengi:credit-cards-updated";
const STORAGE_KEY = "dengi:credit-cards";

/** Стабильная ссылка — иначе useSyncExternalStore уходит в бесконечный цикл */
const EMPTY_CARDS: CreditCard[] = [];

let cachedSnapshot: CreditCard[] = EMPTY_CARDS;
let cachedStorageRaw: string | null = null;

function invalidateSnapshotCache() {
  cachedStorageRaw = null;
}

function getSnapshot() {
  if (typeof window === "undefined") {
    return EMPTY_CARDS;
  }

  const raw = window.localStorage.getItem(STORAGE_KEY);
  const storageMarker = raw ?? "__seed__";

  if (storageMarker === cachedStorageRaw) {
    return cachedSnapshot;
  }

  cachedStorageRaw = storageMarker;
  cachedSnapshot = readCreditCards();
  return cachedSnapshot;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getServerSnapshot() {
  return SEED_CREDIT_CARDS;
}

function notifyCreditCardsChanged() {
  invalidateSnapshotCache();
  window.dispatchEvent(new Event(STORAGE_EVENT));
}

export function useCreditCards() {
  const cards = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const saveCards = useCallback((next: CreditCard[]) => {
    writeCreditCards(next);
    notifyCreditCardsChanged();
  }, []);

  const updateCard = useCallback((id: string, patch: Partial<CreditCard>) => {
    const next = persistCreditCardUpdate(id, patch);
    notifyCreditCardsChanged();
    return next.find((card) => card.id === id) ?? null;
  }, []);

  const addCard = useCallback((draft: CreditCardDraft) => {
    const next = persistCreditCardAdd(draft);
    notifyCreditCardsChanged();
    return next.at(-1) ?? null;
  }, []);

  const deleteCard = useCallback((id: string) => {
    const next = persistCreditCardDelete(id);
    notifyCreditCardsChanged();
    return next;
  }, []);

  const getCard = useCallback(
    (id: string) => cards.find((card) => card.id === id) ?? null,
    [cards]
  );

  return {
    cards,
    ready: true,
    saveCards,
    addCard,
    deleteCard,
    updateCard,
    getCard,
  };
}
