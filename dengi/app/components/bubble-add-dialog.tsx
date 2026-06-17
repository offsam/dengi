"use client";

import type { ReactNode } from "react";
import { APP_MODAL_HEADER } from "@/lib/app-theme";
import {
  TransparentModalPanel,
  TransparentModalRoot,
  TransparentModalScroll,
} from "@/app/components/transparent-modal-shell";

/** Центрированное добавление — прозрачное, как главный экран */
export function BubbleAddDialog({
  open,
  onClose,
  title,
  titleId,
  closeAriaLabel,
  preview,
  submitLabel,
  onSubmit,
  children,
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  titleId: string;
  closeAriaLabel: string;
  preview?: ReactNode;
  submitLabel: string;
  onSubmit: (event: React.FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
}) {
  return (
    <TransparentModalRoot
      open={open}
      onClose={onClose}
      closeAriaLabel={closeAriaLabel}
      titleId={titleId}
    >
      <TransparentModalPanel>
        <TransparentModalScroll>
          <div className={APP_MODAL_HEADER}>
            <div className="flex items-center justify-between gap-3">
              <h2 id={titleId} className="text-sm font-semibold tracking-tight text-zinc-900">
                {title}
              </h2>
              <button
                type="button"
                onClick={onClose}
                className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                Отмена
              </button>
            </div>

            {preview ? <div className="mt-4 flex justify-center">{preview}</div> : null}
          </div>

          <form className="space-y-5 px-4 py-4" onSubmit={onSubmit}>
            {children}

            <button
              type="submit"
              className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
            >
              {submitLabel}
            </button>
          </form>
        </TransparentModalScroll>
      </TransparentModalPanel>
    </TransparentModalRoot>
  );
}
