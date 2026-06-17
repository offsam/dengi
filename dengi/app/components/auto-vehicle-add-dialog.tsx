"use client";

import { useState } from "react";
import { AutoVehicleDetailHero } from "@/app/components/auto-vehicle-detail-hero";
import { AutoVehicleFormFields } from "@/app/components/auto-vehicle-form-fields";
import { BubbleAddDialog } from "@/app/components/bubble-add-dialog";
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

  function patchDraft(patch: Partial<AutoVehicle>) {
    setDraft((current) => ({ ...current, ...patch, id: current.id }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    onAdd(toAutoVehicleDraft(draft));
    onClose();
  }

  return (
    <BubbleAddDialog
      open={open}
      onClose={onClose}
      title="Добавить автомобиль"
      titleId="add-auto-title"
      closeAriaLabel="Закрыть окно добавления автомобиля"
      submitLabel="Добавить автомобиль"
      onSubmit={handleSubmit}
      preview={<AutoVehicleDetailHero vehicle={draft} compact />}
    >
      <AutoVehicleFormFields draft={draft} onPatch={patchDraft} showFinancingPicker />
    </BubbleAddDialog>
  );
}
