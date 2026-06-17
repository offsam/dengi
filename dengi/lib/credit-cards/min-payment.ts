import type { CreditCardContract } from "./types";
import { findTermByKey } from "./parse-contract-terms";

export type MinPaymentRules = {
  /** Минимальная сумма платежа, например $25 */
  floor: number;
  /** Доля от остатка, например 0.01 = 1% */
  balancePercent: number;
};

export const DEFAULT_MIN_PAYMENT_RULES: MinPaymentRules = {
  floor: 25,
  balancePercent: 0.01,
};

function roundMoney(value: number) {
  return Math.round(value * 100) / 100;
}

/** Правила из условий договора (если загружен) */
export function resolveMinPaymentRules(
  contract?: CreditCardContract
): MinPaymentRules {
  const rules = { ...DEFAULT_MIN_PAYMENT_RULES };
  const terms = contract?.terms ?? [];
  const minTerm = findTermByKey(terms, "minimum_payment");

  if (!minTerm) {
    return rules;
  }

  const parsed = Number(minTerm.value.replace(/[^\d.,-]/g, "").replace(",", "."));
  // В договоре часто указан порог $25–$40, а не пример платежа
  if (Number.isFinite(parsed) && parsed >= 10 && parsed <= 40) {
    rules.floor = parsed;
  }

  return rules;
}

/** Минимальный платёж по типовым правилам: max(порог, % от долга + месячные проценты) */
export function calculateMinimumPayment(input: {
  balance: number;
  apr: number;
  contract?: CreditCardContract;
}): number {
  const balance = Math.max(0, input.balance);
  if (balance <= 0) {
    return 0;
  }

  const rules = resolveMinPaymentRules(input.contract);

  if (balance <= rules.floor) {
    return roundMoney(balance);
  }

  const monthlyInterest = balance * (Math.max(0, input.apr) / 100 / 12);
  const calculated = balance * rules.balancePercent + monthlyInterest;

  return roundMoney(Math.max(rules.floor, calculated));
}
