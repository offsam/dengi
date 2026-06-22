"use client";

import { useEffect } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { useLocale } from "@/app/components/locale-provider";

/** Простое подтверждение удаления */
export function SimpleDeleteDialog({
  open,
  title,
  description,
  confirmLabel,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  onClose: () => void;
  onConfirm: () => void;
}) {
  const { t } = useLocale();
  const resolvedConfirmLabel = confirmLabel ?? t("common.delete");

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

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-dialog-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label={t("common.closeAria")}
        onClick={onClose}
      />

      <BubbleCard className="relative z-10 w-full max-w-sm space-y-4 rounded-3xl p-4">
        <div className="space-y-2">
          <h2 id="delete-dialog-title" className="text-sm font-semibold text-zinc-900">
            {title}
          </h2>
          <p className="text-sm leading-relaxed text-zinc-600">{description}</p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            className="w-full rounded-full bg-rose-600 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-rose-700"
            onClick={onConfirm}
          >
            {resolvedConfirmLabel}
          </button>
          <button
            type="button"
            className="w-full rounded-full px-5 py-3 text-sm font-medium text-zinc-600 transition-colors hover:text-zinc-900"
            onClick={onClose}
          >
            {t("common.cancel")}
          </button>
        </div>
      </BubbleCard>
    </div>
  );
}
