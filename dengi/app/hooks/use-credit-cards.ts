"use client";

import { useCallback, useSyncExternalStore } from "react";
import { SEED_CREDIT_CARDS } from "@/lib/credit-cards/seed";
import {
  addCreditCard as persistCreditCardAdd,
  readCreditCards,
  updateCreditCard as persistCreditCardUpdate,
  writeCreditCards,
} from "@/lib/credit-cards/storage";
import type { CreditCard, CreditCardDraft } from "@/lib/credit-cards/types";

const STORAGE_EVENT = "dengi:credit-cards-updated";

function subscribe(onStoreChange: () => void) {
  window.addEventListener(STORAGE_EVENT, onStoreChange);
  window.addEventListener("storage", onStoreChange);
  return () => {
    window.removeEventListener(STORAGE_EVENT, onStoreChange);
    window.removeEventListener("storage", onStoreChange);
  };
}

function getSnapshot() {
  return readCreditCards();
}

function getServerSnapshot() {
  return SEED_CREDIT_CARDS;
}

function notifyCreditCardsChanged() {
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

  const getCard = useCallback(
    (id: string) => cards.find((card) => card.id === id) ?? null,
    [cards]
  );

  return {
    cards,
    ready: true,
    saveCards,
    addCard,
    updateCard,
    getCard,
  };
}
