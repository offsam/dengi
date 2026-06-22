"use client";

import { useEffect, useState } from "react";
import { AutoVehicleFormFields } from "@/app/components/auto-vehicle-form-fields";
import { useLocale } from "@/app/components/locale-provider";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

type PanelMode = "view" | "edit" | "saved";

export function AutoVehicleSettingsPanel({
  vehicle,
  onSave,
  onDelete,
}: {
  vehicle: AutoVehicle;
  onSave: (next: AutoVehicle) => void;
  onDelete: () => void;
}) {
  const { t } = useLocale();
  const [mode, setMode] = useState<PanelMode>("view");
  const [draft, setDraft] = useState(vehicle);

  const editing = mode === "edit";
  const saved = mode === "saved";

  function patchDraft(patch: Partial<AutoVehicle>) {
    setDraft((current) => ({ ...current, ...patch, id: vehicle.id }));
  }

  function cancelEditing() {
    setDraft(vehicle);
    setMode("view");
  }

  function saveEditing() {
    onSave({ ...draft, id: vehicle.id });
    setMode("saved");
  }

  useEffect(() => {
    if (mode !== "saved") {
      return;
    }

    const timer = window.setTimeout(() => {
      setMode("view");
    }, 2000);

    return () => {
      window.clearTimeout(timer);
    };
  }, [mode]);

  return (
    <div className="space-y-4">
      <AutoVehicleFormFields
        key={mode}
        draft={editing ? draft : vehicle}
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
            {t("common.cancel")}
          </button>
          <button
            type="button"
            className="flex-1 rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            onClick={saveEditing}
          >
            {t("common.save")}
          </button>
        </div>
      ) : saved ? (
        <button
          type="button"
          className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300"
          disabled
          aria-live="polite"
        >
          {t("common.saved")}
        </button>
      ) : (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            className="w-full rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            onClick={() => {
              setDraft(vehicle);
              setMode("edit");
            }}
          >
            {t("common.edit")}
          </button>

          <button
            type="button"
            className="w-full py-2 text-sm font-medium text-rose-600 transition-colors hover:text-rose-700"
            onClick={onDelete}
          >
            {t("auto.settings.delete")}
          </button>
        </div>
      )}
    </div>
  );
}
