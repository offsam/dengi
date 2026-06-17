import type { BankId } from "@/lib/bank-logos";
import type { ContractTerm } from "@/lib/credit-cards/parse-contract-terms";

export type CreditCardContract = {
  id: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  terms?: ContractTerm[];
  termsExtractedAt?: string;
};

export type CreditCard = {
  id: string;
  bankId: BankId;
  /** Название банка вручную, если bankId === "other" */
  customBankName?: string;
  name: string;
  cardClass?: string;
  balance: number;
  limit: number;
  apr: number;
  /** Число месяца, когда нужно платить (1–31) */
  paymentDueDay?: number;
  dueDate: string;
  daysUntilDue: number;
  minPayment: number;
  previousBalance: number;
  contract?: CreditCardContract;
};

export type CreditCardDraft = Omit<CreditCard, "id">;
