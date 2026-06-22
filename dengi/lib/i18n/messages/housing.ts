export const housingMessages = {
  ru: {
    tabs: { overview: "Обзор", history: "История", ariaLabel: "Разделы счёта" },
    form: {
      sectionTitle: "Счёт",
      namePlaceholder: "Ипотека",
      dueDate: "Срок оплаты",
      dueDatePlaceholder: "1 июл",
    },
    card: {
      nextPayment: "Ближайший платёж",
      draftHint: "Черновик: напоминания и автоплатёж появятся позже.",
      perYear: "За год",
      approximately: "Примерно",
      draftHistory: "Черновая история для {name}",
    },
    settings: { delete: "Удалить счёт" },
    deleteDialog: {
      title: "Удалить счёт?",
      description: "«{name}» исчезнет с главного экрана.",
    },
    notFound: "Счёт не найден.",
    addDialog: {
      title: "Добавить счёт",
      closeAria: "Закрыть окно добавления счёта",
    },
  },
  en: {
    tabs: { overview: "Overview", history: "History", ariaLabel: "Bill sections" },
    form: {
      sectionTitle: "Bill",
      namePlaceholder: "Mortgage",
      dueDate: "Due date",
      dueDatePlaceholder: "Jul 1",
    },
    card: {
      nextPayment: "Next payment",
      draftHint: "Draft: reminders and autopay coming later.",
      perYear: "Per year",
      approximately: "Approximately",
      draftHistory: "Draft history for {name}",
    },
    settings: { delete: "Delete bill" },
    deleteDialog: {
      title: "Delete bill?",
      description: "“{name}” will disappear from the home screen.",
    },
    notFound: "Bill not found.",
    addDialog: {
      title: "Add bill",
      closeAria: "Close add bill dialog",
    },
  },
} as const;
