"use client";

import { useEffect, useState } from "react";
import { CreditCardFormFields } from "@/app/components/credit-card-form-fields";
import { CreditCardTile } from "@/app/components/credit-card-tile";
import { isOtherBank } from "@/lib/bank-logos";
import {
  createEmptyCreditCardDraft,
  draftToPreviewCard,
} from "@/lib/credit-cards/defaults";
import type { CreditCard, CreditCardDraft } from "@/lib/credit-cards/types";

function draftToFormCard(draft: CreditCardDraft): CreditCard {
  return { ...draft, id: "preview" };
}

export function CreditCardAddDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (draft: CreditCardDraft) => void;
}) {
  const [draft, setDraft] = useState(createEmptyCreditCardDraft);

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

  function patchDraft(patch: Partial<CreditCardDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const customBankName = isOtherBank(draft.bankId)
      ? draft.customBankName?.trim()
      : undefined;

    if (isOtherBank(draft.bankId) && !customBankName) {
      return;
    }

    onAdd({
      ...draft,
      name: draft.name.trim(),
      dueDate: draft.dueDate.trim(),
      customBankName,
    });
    onClose();
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="add-card-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть окно добавления карты"
        onClick={onClose}
      />

      <div className="relative flex max-h-[92dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl bg-zinc-50 shadow-xl">
        <div className="shrink-0 border-b border-zinc-200/80 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="add-card-title"
              className="text-sm font-semibold tracking-tight text-zinc-900"
            >
              Добавить карту
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
            <CreditCardTile {...draftToPreviewCard(draft)} />
          </div>
        </div>

        <form
          className="min-h-0 flex-1 space-y-5 overflow-y-auto px-4 py-4"
          onSubmit={handleSubmit}
        >
          <CreditCardFormFields
            draft={draftToFormCard(draft)}
            onPatch={patchDraft}
          />

          <button
            type="submit"
            className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
          >
            Добавить карту
          </button>
        </form>
      </div>
    </div>
  );
}
