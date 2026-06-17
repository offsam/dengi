"use client";

import { useEffect, useState } from "react";
import { CreditCardContractUpload } from "@/app/components/credit-card-contract-upload";
import { CreditCardFormFields } from "@/app/components/credit-card-form-fields";
import {
  creditCardValidationMessage,
  normalizeCreditCardForPersist,
  validateCreditCardDraft,
} from "@/lib/credit-cards/normalize";
import type { CreditCard } from "@/lib/credit-cards/types";

type PanelMode = "view" | "edit" | "saved";

export function CreditCardSettingsPanel({
  card,
  onSave,
  onPersist,
  onDelete,
}: {
  card: CreditCard;
  onSave: (next: CreditCard) => void;
  onPersist: (patch: Partial<CreditCard>) => void;
  onDelete: () => void;
}) {
  const [mode, setMode] = useState<PanelMode>("view");
  const [draft, setDraft] = useState(card);
  const [error, setError] = useState<string | null>(null);

  const editing = mode === "edit";
  const saved = mode === "saved";
  const preview = editing ? draft : card;

  function patchDraft(patch: Partial<CreditCard>) {
    setDraft((current) => ({ ...current, ...patch, id: card.id }));
    setError(null);
  }

  function cancelEditing() {
    setDraft(card);
    setError(null);
    setMode("view");
  }

  function saveEditing() {
    const issue = validateCreditCardDraft(draft);
    if (issue) {
      setError(creditCardValidationMessage(issue));
      return;
    }

    onSave({
      ...normalizeCreditCardForPersist(draft),
      id: card.id,
    });
    setError(null);
    setMode("saved");
  }

  function startEditing() {
    setDraft(card);
    setError(null);
    setMode("edit");
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
      <CreditCardFormFields
        key={mode}
        draft={preview}
        onPatch={patchDraft}
        readOnly={!editing}
      />

      <CreditCardContractUpload
        cardId={card.id}
        card={preview}
        contract={preview.contract}
        readOnly={!editing}
        onImport={({ contract: nextContract, cardPatch }) => {
          const patch = { ...cardPatch, contract: nextContract };
          patchDraft(patch);
          onPersist(patch);
        }}
        onContractRemove={() => {
          patchDraft({ contract: undefined });
          onPersist({ contract: undefined });
        }}
      />

      {error ? (
        <p className="text-sm font-medium text-rose-600" role="alert">
          {error}
        </p>
      ) : null}

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
          className="w-full rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition-all duration-300"
          disabled
          aria-live="polite"
        >
          Сохранено
        </button>
      ) : (
        <div className="space-y-2 pt-1">
          <button
            type="button"
            className="w-full rounded-full border border-zinc-200 bg-white px-5 py-3 text-sm font-semibold text-zinc-900 transition-colors hover:border-zinc-300 hover:bg-zinc-50"
            onClick={startEditing}
          >
            Редактировать
          </button>
          <button
            type="button"
            className="w-full py-2 text-sm font-medium text-rose-600 transition-colors hover:text-rose-700"
            onClick={onDelete}
          >
            Удалить карту
          </button>
        </div>
      )}
    </div>
  );
}
