"use client";

import { useState } from "react";
import { BubbleAddDialog } from "@/app/components/bubble-add-dialog";
import { IncomeSourceCard } from "@/app/components/income-source-card";
import { IncomeSourceFormFields } from "@/app/components/income-source-form-fields";
import {
  createEmptyIncomeSourceDraft,
  resolveIncomeSourceKindPreset,
  type IncomeSource,
  type IncomeSourceDraft,
  type IncomeSourceKind,
} from "@/lib/income-sources/types";

function buildPreview(
  draft: IncomeSourceDraft,
  customKindLabel: string
): IncomeSource {
  const preset = resolveIncomeSourceKindPreset(draft.kind);

  return {
    id: "preview",
    kind: draft.kind,
    customKindLabel: draft.kind === "other" ? customKindLabel.trim() : undefined,
    name: draft.name.trim() || "Новый источник",
    monthlyAmount: draft.monthlyAmount,
    accentColor: preset.accentColor,
  };
}

export function IncomeSourceAddDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (draft: IncomeSourceDraft) => void;
}) {
  const [draft, setDraft] = useState(createEmptyIncomeSourceDraft);
  const [customKindLabel, setCustomKindLabel] = useState("");

  function patchDraft(patch: Partial<IncomeSourceDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleKindChange(kind: IncomeSourceKind) {
    const preset = resolveIncomeSourceKindPreset(kind);
    patchDraft({ kind, accentColor: preset.accentColor });
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const preview = buildPreview(draft, customKindLabel);
    if (!preview.name.trim()) {
      return;
    }

    if (draft.kind === "other" && !customKindLabel.trim()) {
      return;
    }

    onAdd({
      kind: preview.kind,
      customKindLabel: preview.customKindLabel,
      name: preview.name,
      monthlyAmount: preview.monthlyAmount,
      accentColor: preview.accentColor,
    });
    onClose();
  }

  const preview = buildPreview(draft, customKindLabel);

  return (
    <BubbleAddDialog
      open={open}
      onClose={onClose}
      title="Добавить источник дохода"
      titleId="add-income-source-title"
      closeAriaLabel="Закрыть окно добавления источника дохода"
      submitLabel="Добавить"
      onSubmit={handleSubmit}
      preview={<IncomeSourceCard {...preview} />}
    >
      <IncomeSourceFormFields
        draft={preview}
        customKindLabel={customKindLabel}
        onPatch={patchDraft}
        onKindChange={handleKindChange}
        onCustomKindLabelChange={setCustomKindLabel}
      />
      <p className="text-xs leading-relaxed text-zinc-500">
        Укажите ожидаемую сумму для себя — она не войдёт в активы и расчёты на главной.
      </p>
    </BubbleAddDialog>
  );
}
