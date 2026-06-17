"use client";

import type { HomeShelfView } from "@/lib/home/shelf-view";

export function ShelfViewToggle({
  view,
  onChange,
}: {
  view: HomeShelfView;
  onChange: (view: HomeShelfView) => void;
}) {
  return (
    <div
      className="inline-flex rounded-full bg-zinc-100 p-0.5"
      role="group"
      aria-label="Вид полки"
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
        Полный
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
        Компактный
      </button>
    </div>
  );
}
