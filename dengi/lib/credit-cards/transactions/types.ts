export type CreditCardTransactionType =
  | "purchase"
  | "payment"
  | "interest"
  | "fee";

export type CreditCardTransaction = {
  id: string;
  cardId: string;
  type: CreditCardTransactionType;
  amount: number;
  description: string;
  occurredAt: string;
};
