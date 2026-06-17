"use client";

import { useState } from "react";
import { BubbleAddDialog } from "@/app/components/bubble-add-dialog";
import { HousingBillCard } from "@/app/components/housing-bill-card";
import { HousingBillFormFields } from "@/app/components/housing-bill-form-fields";
import {
  createEmptyHousingBillDraft,
  draftToPreviewHousingBill,
  type HousingBillDraft,
} from "@/lib/dashboard/housing-bills";

export function HousingBillAddDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (draft: HousingBillDraft) => void;
}) {
  const [draft, setDraft] = useState(createEmptyHousingBillDraft);

  function patchDraft(patch: Partial<HousingBillDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!draft.name.trim() || !draft.date.trim()) {
      return;
    }

    onAdd({
      name: draft.name.trim(),
      date: draft.date.trim(),
      amount: draft.amount,
    });
    onClose();
  }

  const preview = draftToPreviewHousingBill(draft);

  return (
    <BubbleAddDialog
      open={open}
      onClose={onClose}
      title="Добавить счёт"
      titleId="add-housing-title"
      closeAriaLabel="Закрыть окно добавления счёта"
      submitLabel="Добавить"
      onSubmit={handleSubmit}
      preview={<HousingBillCard {...preview} />}
    >
      <HousingBillFormFields draft={preview} onPatch={patchDraft} />
    </BubbleAddDialog>
  );
}
