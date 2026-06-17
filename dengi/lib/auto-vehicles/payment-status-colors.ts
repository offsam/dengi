import { APP_COLORS } from "@/lib/app-theme";

/** Цвет цифр платежа — как на графике */
export const PAYMENT_AMOUNT_TEXT_COLOR = {
  paid: APP_COLORS.positive,
  current: "#A58018",
  upcoming: "#B29438",
} as const;

export type PaymentAmountStatus = keyof typeof PAYMENT_AMOUNT_TEXT_COLOR;

export function paymentAmountStyle(status: PaymentAmountStatus) {
  return { color: PAYMENT_AMOUNT_TEXT_COLOR[status] };
}
