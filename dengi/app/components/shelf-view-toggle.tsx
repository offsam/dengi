"use client";

import type { HomeShelfView } from "@/lib/home/shelf-view";
import { useLocale } from "@/app/components/locale-provider";

export function ShelfViewToggle({
  view,
  onChange,
}: {
  view: HomeShelfView;
  onChange: (view: HomeShelfView) => void;
}) {
  const { t } = useLocale();

  return (
    <div
      className="inline-flex rounded-full bg-zinc-100 p-0.5"
      role="group"
      aria-label={t("shelf.viewAria")}
    >
      <button
        type="button"
        onClick={() => onChange("full")}
        aria-pressed={view === "full"}
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          view === "full"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-800"
        }`}
      >
        {t("shelf.full")}
      </button>
      <button
        type="button"
        onClick={() => onChange("minimal")}
        aria-pressed={view === "minimal"}
        className={`rounded-full px-2.5 py-1 text-[11px] font-semibold transition-colors ${
          view === "minimal"
            ? "bg-white text-zinc-900 shadow-sm"
            : "text-zinc-500 hover:text-zinc-800"
        }`}
      >
        {t("shelf.compact")}
      </button>
    </div>
  );
}
