import type { DebitAccountKind } from "@/lib/dashboard/debit-accounts";
import type { CreditCardTransactionType } from "@/lib/credit-cards/transactions/types";
import type { AutoVehicleExpenseType } from "@/lib/auto-vehicles/records/types";
import type { IncomeSourceKind } from "@/lib/income-sources/types";
import type { DashboardMetricId } from "@/lib/dashboard/metric-breakdown";
import { messages } from "./messages/index";
import type { AppLang } from "./types";
import type { Translator } from "./translate";
import { translatePresetName, translateShortDueDate } from "./presets";

export function getDebitKindLabel(kind: DebitAccountKind, lang: AppLang) {
  return messages[lang].debit.kind[kind];
}

export function getIncomeKindLabel(kind: IncomeSourceKind, lang: AppLang) {
  return messages[lang].incomeKind[kind];
}

export function getCreditTransactionTypeLabel(type: CreditCardTransactionType, lang: AppLang) {
  return messages[lang].credit.transactionType[type];
}

export function getCreditChartSegmentLabel(type: CreditCardTransactionType, lang: AppLang) {
  return messages[lang].credit.chartSegment[type];
}

export function getAutoExpenseTypeLabel(type: AutoVehicleExpenseType, lang: AppLang) {
  return messages[lang].auto.expenseType[type];
}

export function getDashboardMetricTitle(metricId: DashboardMetricId, lang: AppLang) {
  return messages[lang].metrics[metricId];
}

export function displayEntityName(name: string, lang: AppLang) {
  return translatePresetName(name, lang);
}

export function displayDueDate(date: string, lang: AppLang) {
  return translateShortDueDate(date, lang);
}

export function displayDebitAccount(account: { kind: DebitAccountKind; name: string }, lang: AppLang) {
  if (account.kind === "cash") {
    return translatePresetName("Кошелёк", lang);
  }

  return translatePresetName(account.name, lang);
}

export function useDisplayLabels(lang: AppLang, t: Translator) {
  return {
    name: (value: string) => displayEntityName(value, lang),
    dueDate: (value: string) => displayDueDate(value, lang),
    debitKind: (kind: DebitAccountKind) => getDebitKindLabel(kind, lang),
    incomeKind: (kind: IncomeSourceKind) => getIncomeKindLabel(kind, lang),
    t,
  };
}
