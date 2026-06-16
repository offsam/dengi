"use client";

import { useEffect, useState } from "react";
import { AutoVehicleDetailHero } from "@/app/components/auto-vehicle-detail-hero";
import { AutoVehicleFormFields } from "@/app/components/auto-vehicle-form-fields";
import { BubbleCard } from "@/app/components/bubble-card";
import {
  createEmptyAutoVehicleDraft,
  toAutoVehicleDraft,
} from "@/lib/auto-vehicles";
import type { AutoVehicle, AutoVehicleDraft } from "@/lib/auto-vehicles/vehicle";

export function AutoVehicleAddDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (draft: AutoVehicleDraft) => void;
}) {
  const [draft, setDraft] = useState<AutoVehicle>(() => ({
    ...createEmptyAutoVehicleDraft(),
    id: "preview",
  }));

  useEffect(() => {
    if (!open) {
      return;
    }

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
      }
    }

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  function patchDraft(patch: Partial<AutoVehicle>) {
    setDraft((current) => ({ ...current, ...patch, id: current.id }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd(toAutoVehicleDraft(draft));
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-auto-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть окно добавления автомобиля"
        onClick={onClose}
      />

      <BubbleCard className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl rounded-b-none">
        <div className="shrink-0 border-b border-white/40 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="add-auto-title"
              className="text-sm font-semibold tracking-tight text-zinc-900"
            >
              Добавить автомобиль
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Отмена
            </button>
          </div>

          <div className="mt-4 flex justify-center">
            <AutoVehicleDetailHero vehicle={draft} compact />
          </div>
        </div>

        <form
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4"
          onSubmit={handleSubmit}
        >
          <AutoVehicleFormFields draft={draft} onPatch={patchDraft} showFinancingPicker />

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Добавить автомобиль
          </button>
        </form>
      </BubbleCard>
    </div>
  );
}
