"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";
import { createTranslator, type Translator } from "@/lib/i18n/translate";
import { readStoredAppLang, writeStoredAppLang } from "@/lib/i18n/storage";
import type { AppLang } from "@/lib/i18n/types";

type LocaleContextValue = {
  lang: AppLang;
  setLang: (lang: AppLang) => void;
  t: Translator;
};

const LocaleContext = createContext<LocaleContextValue | null>(null);

export function LocaleProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<AppLang>(() => readStoredAppLang());

  const setLang = useCallback((next: AppLang) => {
    writeStoredAppLang(next);
    setLangState(next);
  }, []);

  const t = useMemo(() => createTranslator(lang), [lang]);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const value = useMemo(
    () => ({
      lang,
      setLang,
      t,
    }),
    [lang, setLang, t]
  );

  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useLocale() {
  const context = useContext(LocaleContext);

  if (!context) {
    throw new Error("useLocale must be used within LocaleProvider");
  }

  return context;
}
