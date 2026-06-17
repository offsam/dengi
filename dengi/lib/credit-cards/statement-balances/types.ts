/** Ручное закрытие выписки за конкретный месяц */
export type CreditCardStatementBalance = {
  cardId: string;
  /** Формат: «2026-2» (год-месяц, month 0-based) */
  monthId: string;
  debt: number;
  updatedAt: string;
};
