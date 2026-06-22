"use client";

import { useState } from "react";
import { AutoVehicleDetailHero } from "@/app/components/auto-vehicle-detail-hero";
import { AutoVehicleFormFields } from "@/app/components/auto-vehicle-form-fields";
import { BubbleAddDialog } from "@/app/components/bubble-add-dialog";
import { useLocale } from "@/app/components/locale-provider";
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
  const { t } = useLocale();
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
      title={t("auto.addDialog.title")}
      titleId="add-auto-title"
      closeAriaLabel={t("auto.addDialog.closeAria")}
      submitLabel={t("auto.addDialog.submit")}
      onSubmit={handleSubmit}
      preview={<AutoVehicleDetailHero vehicle={draft} compact />}
    >
      <AutoVehicleFormFields draft={draft} onPatch={patchDraft} showFinancingPicker />
    </BubbleAddDialog>
  );
}
