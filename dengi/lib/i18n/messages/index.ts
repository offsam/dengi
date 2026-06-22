import { commonMessages } from "./common";
import { creditMessages } from "./credit";
import { debitMessages } from "./debit";
import { housingMessages } from "./housing";
import { autoMessages } from "./auto";
import { incomeMessages } from "./income";
import { homeMessages } from "./home";
import { assistantMessages } from "./assistant";
import { presetMessages } from "./presets";
import type { AppLang } from "../types";

function mergeLang(lang: AppLang) {
  return {
    common: commonMessages[lang],
    preset: presetMessages[lang],
    locale: lang === "ru" ? { ru: "RU", en: "EN" } : { ru: "RU", en: "EN" },
    home: homeMessages[lang],
    metrics: homeMessages[lang].metrics,
    breakdownGroups: homeMessages[lang].breakdownGroups,
    shelf: homeMessages[lang].shelf,
    incomeKind: incomeMessages[lang].kind,
    incomeCard: incomeMessages[lang].card,
    income: incomeMessages[lang],
    debit: debitMessages[lang],
    housing: housingMessages[lang],
    credit: creditMessages[lang],
    auto: autoMessages[lang],
    assistant: assistantMessages[lang],
    dashboard: homeMessages[lang].dashboard,
  };
}

export const messages = {
  ru: mergeLang("ru"),
  en: mergeLang("en"),
} as const;

export type MessageTree = (typeof messages)[AppLang];
