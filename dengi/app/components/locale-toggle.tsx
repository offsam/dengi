"use client";

import { useLocale } from "@/app/components/locale-provider";
import type { AppLang } from "@/lib/i18n/types";

const OPTIONS: AppLang[] = ["ru", "en"];

export function LocaleToggle({ className = "" }: { className?: string }) {
  const { lang, setLang, t } = useLocale();

  return (
    <div
      className={`inline-flex rounded-full bg-zinc-100 p-0.5 ${className}`.trim()}
      role="group"
      aria-label={t("common.language")}
    >
      {OPTIONS.map((option) => (
        <button
          key={option}
          type="button"
          onClick={() => setLang(option)}
          aria-pressed={lang === option}
          className={`rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase transition-colors ${
            lang === option
              ? "bg-white text-zinc-900 shadow-sm"
              : "text-zinc-500 hover:text-zinc-800"
          }`}
        >
          {t(`locale.${option}`)}
        </button>
      ))}
    </div>
  );
}
