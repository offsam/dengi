export type CreditCardShelfView = "full" | "minimal";

const STORAGE_KEY = "dengi:credit-cards-shelf-view";

export function readCreditCardShelfView(): CreditCardShelfView {
  if (typeof window === "undefined") {
    return "full";
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw === "minimal" ? "minimal" : "full";
  } catch {
    return "full";
  }
}

export function writeCreditCardShelfView(view: CreditCardShelfView) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, view);
}
