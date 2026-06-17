"use client";

import { useEffect, useState } from "react";
import { HousingBillFormFields } from "@/app/components/housing-bill-form-fields";
import type { HousingBill } from "@/lib/dashboard/housing-bills";

type PanelMode = "view" | "edit" | "saved";

export function HousingBillSettingsPanel({
  bill,
  onSave,
  onDelete,
}: {
  bill: HousingBill;
  onSave: (next: HousingBill) => void;
  onDelete: () => void;
}) {
  const [mode, setMode] = useState<PanelMode>("view");
  const [draft, setDraft] = useState(bill);

  const editing = mode === "edit";
  const saved = mode === "saved";

  function patchDraft(patch: Partial<HousingBill>) {
    setDraft((current) => ({ ...current, ...patch, id: bill.id }));
  }

  function cancelEditing() {
    setDraft(bill);
    setMode("view");
  }

  function saveEditing() {
    if (!draft.name.trim() || !draft.date.trim()) {
      return;
    }

    onSave({
      ...draft,
      name: draft.name.trim(),
      date: draft.date.trim(),
    });
    setMode("saved");
  }

  useEffect(() => {
    if (mode !== "saved") {
      return;
    }

    const timer = window.setTimeout(() => setMode("view"), 2000);
    return () => window.clearTimeout(timer);
  }, [mode]);

  return (
    <div className="space-y-4">
      <HousingBillFormFields
        draft={editing ? draft : bill}
        onPatch={patchDraft}
        readOnly={!editing}
      />

      {editing ? (
        <div className="flex items-center gap-3 pt-1">
          <button
            type="button"
            className="shrink-0 py-3 text-sm font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            onClick={cancelEditing}
          >
            Отмена
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            onClick={saveEditing}
          >
            Сохранить
          </button>
        </div>
      ) : saved ? (
        <button
          type="button"
          className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white"
          disabled
        >
          Сохранено
        </button>
      ) : (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            className="w-full rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            onClick={() => setMode("edit")}
          >
            Редактировать
          </button>
          <button
            type="button"
            className="w-full py-2 text-sm font-medium text-rose-600 transition-colors hover:text-rose-700"
            onClick={onDelete}
          >
            Удалить счёт
          </button>
        </div>
      )}
    </div>
  );
}
