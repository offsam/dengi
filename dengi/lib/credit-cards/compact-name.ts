import { messages } from "@/lib/i18n/messages/index";
import { translatePresetName } from "@/lib/i18n/presets";
import type { AppLang } from "@/lib/i18n/types";

/** Короткая подпись на компактной плитке: одна строка или главное слово */
export function formatCompactCardName(name: string, lang: AppLang = "ru") {
  const trimmed = name.trim();
  if (!trimmed) {
    return messages[lang].common.compactCardFallback;
  }

  const display = translatePresetName(trimmed, lang);

  if (display.length <= 16) {
    return display;
  }

  const words = display.split(/\s+/).filter(Boolean);
  const primary = words[0] ?? display;

  if (primary.length >= 3) {
    return primary;
  }

  return `${display.slice(0, 15)}…`;
}
