import type { BankId } from "./registry";
import { BANKS } from "./registry";

type BankNameSource = {
  bankId: BankId;
  customBankName?: string;
};

export function isOtherBank(bankId: BankId) {
  return bankId === "other";
}

export function getCreditCardBankName(card: BankNameSource) {
  if (isOtherBank(card.bankId) && card.customBankName?.trim()) {
    return card.customBankName.trim();
  }

  return BANKS[card.bankId].name;
}
