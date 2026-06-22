import type { AppLang } from "./types";

export const messages = {
  ru: {
    common: {
      back: "Назад",
      order: "Порядок",
      done: "Готово",
      total: "Итого",
      open: "Открыть",
      openItem: "Открыть {name}",
      openBreakdown: "Открыть состав",
      archive: "Архив",
      perMonth: "в месяц",
      perYear: "В год",
      duePrefix: "Срок",
      moveUp: "Выше",
      moveDown: "Ниже",
      moveLeft: "Левее",
      moveRight: "Правее",
      language: "Язык",
    },
    locale: {
      ru: "RU",
      en: "EN",
    },
    home: {
      netWorth: "Чистый капитал",
      metricsAria: "Сводные показатели",
      orderHint:
        "Стрелки ↑↓ — порядок категорий. ←→ — порядок карточек внутри категории.",
    },
    metrics: {
      totalDebt: "Общий долг",
      interestThisMonth: "Проценты за месяц",
      assets: "Активы",
      billsDueSoon: "Счета скоро",
    },
    breakdownGroups: {
      cards: "Кредитные карты",
      autoLoans: "Автокредиты",
      debit: "Дебет / наличные",
      autoAssets: "Авто",
    },
    shelf: {
      viewAria: "Вид полки",
      full: "Полный",
      compact: "Компактный",
      creditCards: "Кредитные карты",
      addCreditCard: "Добавить кредитную карту",
      incomeSources: "Источники доходов",
      addIncomeSource: "Добавить источник дохода",
      incomeNote:
        "Личная заметка: откуда ждёте деньги. Не входит в чистый капитал и другие расчёты на главной.",
      debitCash: "Дебет / наличные",
      addDebitCash: "Добавить счёт или кошелёк",
      housingBills: "Жильё и счета",
      addHousingBill: "Добавить счёт",
      auto: "Авто",
      addAuto: "Добавить авто",
    },
    incomeKind: {
      salary: "Зарплата",
      freelance: "Фриланс",
      rental: "Аренда",
      other: "Другое",
    },
    incomeCard: {
      overviewNote:
        "Только для вашего обзора — эти суммы не добавляются к активам и не меняют чистый капитал.",
      overviewTitle: "Сводка",
      type: "Тип",
    },
    assistant: {
      label: "Помощник",
    },
  },
  en: {
    common: {
      back: "Back",
      order: "Order",
      done: "Done",
      total: "Total",
      open: "Open",
      openItem: "Open {name}",
      openBreakdown: "View breakdown",
      archive: "Archive",
      perMonth: "per month",
      perYear: "Per year",
      duePrefix: "Due",
      moveUp: "Move up",
      moveDown: "Move down",
      moveLeft: "Move left",
      moveRight: "Move right",
      language: "Language",
    },
    locale: {
      ru: "RU",
      en: "EN",
    },
    home: {
      netWorth: "Net worth",
      metricsAria: "Summary metrics",
      orderHint:
        "↑↓ reorder categories. ←→ reorder cards within a category.",
    },
    metrics: {
      totalDebt: "Total debt",
      interestThisMonth: "Interest this month",
      assets: "Assets",
      billsDueSoon: "Bills due soon",
    },
    breakdownGroups: {
      cards: "Credit cards",
      autoLoans: "Auto loans",
      debit: "Debit / cash",
      autoAssets: "Vehicles",
    },
    shelf: {
      viewAria: "Shelf view",
      full: "Full",
      compact: "Compact",
      creditCards: "Credit cards",
      addCreditCard: "Add credit card",
      incomeSources: "Income sources",
      addIncomeSource: "Add income source",
      incomeNote:
        "Personal note: where you expect money from. Not included in net worth or home summary.",
      debitCash: "Debit / cash",
      addDebitCash: "Add account or wallet",
      housingBills: "Housing & bills",
      addHousingBill: "Add bill",
      auto: "Vehicles",
      addAuto: "Add vehicle",
    },
    incomeKind: {
      salary: "Salary",
      freelance: "Freelance",
      rental: "Rental",
      other: "Other",
    },
    incomeCard: {
      overviewNote:
        "For your reference only — these amounts are not added to assets or net worth.",
      overviewTitle: "Overview",
      type: "Type",
    },
    assistant: {
      label: "Assistant",
    },
  },
} as const satisfies Record<AppLang, Record<string, Record<string, string>>>;

export type MessageTree = (typeof messages)[AppLang];
