export const assistantMessages = {
  ru: {
    welcome:
      "Примеры: «Потратил 50 на Sapphire», «Положил 200 на Discover», «Добавь карту Chase лимит 10000». Сначала правила (бесплатно), потом GPT-4o mini если не понял.",
    label: "Помощник",
    openAria: "Открыть помощника",
    modelHint: "Сначала правила, потом GPT-4o mini",
    inputPlaceholder: "Потратил 50 на Sapphire...",
    send: "Отправить",
    stopRecording: "Стоп",
    startRecording: "Голос",
    micDenied: "Нет доступа к микрофону. Можно написать текстом.",
    speechError: "Не удалось распознать голос.",
    speechEmpty: "Ничего не расслышал. Попробуйте ещё раз.",
    speechFailed: "Голос не распознан. Попробуйте написать текстом.",
  },
  en: {
    welcome:
      'Examples: "Spent 50 on Sapphire", "Deposited 200 to Discover", "Add Chase card limit 10000". Rules first (free), then GPT-4o mini if unclear.',
    label: "Assistant",
    openAria: "Open assistant",
    modelHint: "Rules first, then GPT-4o mini",
    inputPlaceholder: "Spent 50 on Sapphire...",
    send: "Send",
    stopRecording: "Stop",
    startRecording: "Voice",
    micDenied: "Microphone access denied. You can type instead.",
    speechError: "Could not recognize speech.",
    speechEmpty: "Didn't catch that. Try again.",
    speechFailed: "Voice not recognized. Try typing instead.",
  },
} as const;
