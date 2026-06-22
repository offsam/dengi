import { APP_LANG_STORAGE_KEY, DEFAULT_APP_LANG, type AppLang } from "./types";

function isAppLang(value: string | null | undefined): value is AppLang {
  return value === "ru" || value === "en";
}

export function readStoredAppLang(): AppLang {
  if (typeof window === "undefined") {
    return DEFAULT_APP_LANG;
  }

  const stored = window.localStorage.getItem(APP_LANG_STORAGE_KEY);
  return isAppLang(stored) ? stored : DEFAULT_APP_LANG;
}

export function writeStoredAppLang(lang: AppLang) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(APP_LANG_STORAGE_KEY, lang);
}
