import type { CreditCard } from "./types";

export const SEED_CREDIT_CARDS: CreditCard[] = [
  {
    id: "cc-1",
    bankId: "chase",
    name: "Sapphire Preferred",
    cardClass: "from-[#1a2f4f] via-[#0f4c8a] to-[#061525]",
    balance: 4_200,
    limit: 10_000,
    apr: 24.99,
    paymentDueDay: 22,
    dueDate: "22-е число",
    daysUntilDue: 7,
    minPayment: 126,
    previousBalance: 3_800,
  },
];
