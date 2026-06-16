import { SEED_CREDIT_CARDS } from "./seed";
import type { CreditCard } from "./types";

const STORAGE_KEY = "dengi:credit-cards";

export function readCreditCards(): CreditCard[] {
  if (typeof window === "undefined") {
    return SEED_CREDIT_CARDS;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      return SEED_CREDIT_CARDS;
    }

    const parsed = JSON.parse(raw) as CreditCard[];
    return Array.isArray(parsed) && parsed.length > 0 ? parsed : SEED_CREDIT_CARDS;
  } catch {
    return SEED_CREDIT_CARDS;
  }
}

export function writeCreditCards(cards: CreditCard[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cards));
}

export function updateCreditCard(id: string, patch: Partial<CreditCard>) {
  const cards = readCreditCards();
  const next = cards.map((card) =>
    card.id === id ? { ...card, ...patch, id: card.id } : card
  );
  writeCreditCards(next);
  return next;
}

export function addCreditCard(draft: Omit<CreditCard, "id">) {
  const cards = readCreditCards();
  const card: CreditCard = {
    ...draft,
    id: crypto.randomUUID(),
  };
  const next = [...cards, card];
  writeCreditCards(next);
  return next;
}
