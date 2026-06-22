export const incomeMessages = {
  ru: {
    kind: {
      salary: "Зарплата",
      freelance: "Фриланс",
      rental: "Аренда",
      other: "Другое",
    },
    card: {
      overviewNote:
        "Только для вашего обзора — эти суммы не добавляются к активам и не меняют чистый капитал.",
      overviewTitle: "Сводка",
      type: "Тип",
    },
    form: {
      sectionTitle: "Источник дохода",
      customKindLabel: "Название типа",
      customKindPlaceholder: "Например, дивиденды",
      namePlaceholder: "Основная работа",
      monthlyAmount: "Сумма в месяц",
    },
    previewName: "Новый источник",
    addDialog: {
      title: "Добавить источник дохода",
      closeAria: "Закрыть окно добавления источника дохода",
      hint: "Укажите ожидаемую сумму для себя — она не войдёт в активы и расчёты на главной.",
    },
    settings: {
      delete: "Удалить источник",
      note: "Личная заметка — не влияет на чистый капитал и сводку на главной.",
    },
    deleteDialog: {
      title: "Удалить источник дохода?",
      description: "«{name}» исчезнет с главного экрана.",
    },
    notFound: "Источник дохода не найден.",
  },
  en: {
    kind: {
      salary: "Salary",
      freelance: "Freelance",
      rental: "Rental",
      other: "Other",
    },
    card: {
      overviewNote:
        "For your reference only — these amounts are not added to assets or net worth.",
      overviewTitle: "Overview",
      type: "Type",
    },
    form: {
      sectionTitle: "Income source",
      customKindLabel: "Type name",
      customKindPlaceholder: "e.g. dividends",
      namePlaceholder: "Main job",
      monthlyAmount: "Monthly amount",
    },
    previewName: "New source",
    addDialog: {
      title: "Add income source",
      closeAria: "Close add income source dialog",
      hint: "Expected amount for your reference — not included in assets or home summary.",
    },
    settings: {
      delete: "Delete source",
      note: "Personal note — does not affect net worth or home summary.",
    },
    deleteDialog: {
      title: "Delete income source?",
      description: "“{name}” will disappear from the home screen.",
    },
    notFound: "Income source not found.",
  },
} as const;
