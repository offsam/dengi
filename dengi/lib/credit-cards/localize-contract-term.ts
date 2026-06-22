import type { ContractTerm } from "@/lib/credit-cards/parse-contract-terms";
import { createTranslator } from "@/lib/i18n/translate";
import type { AppLang } from "@/lib/i18n/types";

const TERM_MESSAGE_KEY: Record<string, string> = {
  purchase_apr: "purchaseApr",
  balance_transfer_apr: "balanceTransferApr",
  cash_advance_apr: "cashAdvanceApr",
  penalty_apr: "penaltyApr",
  standard_apr: "standardApr",
  late_payment_fee: "latePaymentFee",
  annual_fee: "annualFee",
  over_limit_fee: "overLimitFee",
  returned_payment_fee: "returnedPaymentFee",
  foreign_transaction_fee: "foreignTransactionFee",
  minimum_payment: "minPayment",
  credit_limit: "creditLimit",
  grace_period: "gracePeriod",
};

function resolveTermMessageKey(termId: string) {
  return TERM_MESSAGE_KEY[termId.replace(/-\d+$/, "")] ?? null;
}

/** Подписи и значения условий договора — с учётом языка интерфейса */
export function localizeContractTerm(term: ContractTerm, lang: AppLang) {
  const t = createTranslator(lang);
  const messageKey = resolveTermMessageKey(term.id);
  const label = messageKey
    ? t(`credit.contractTerms.${messageKey}` as "credit.contractTerms.purchaseApr")
    : term.label;

  let value = term.value;

  if (value === "Отменена" || value === "Waived") {
    value = t("credit.contractTerms.waived");
  } else {
    const daysMatch = value.match(/^(\d+)\s+дн\.$/);
    if (daysMatch) {
      value = t("credit.contractTerms.daysSuffix", { n: daysMatch[1] });
    }
  }

  return { label, value };
}
