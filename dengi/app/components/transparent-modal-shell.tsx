"use client";

import { useEffect, type ReactNode } from "react";
import { APP_MODAL_PANEL, APP_MODAL_SCRIM } from "@/lib/app-theme";

function useModalBodyLock(open: boolean) {
  useEffect(() => {
    if (!open) {
      return;
    }

    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);
}

/** Прозрачная модалка в стиле главного экрана */
export function TransparentModalRoot({
  open,
  onClose,
  closeAriaLabel,
  titleId,
  zClassName = "z-50",
  onKeyDown,
  children,
}: {
  open: boolean;
  onClose: () => void;
  closeAriaLabel: string;
  titleId: string;
  zClassName?: string;
  onKeyDown?: (event: KeyboardEvent) => void;
  children: ReactNode;
}) {
  useModalBodyLock(open);

  useEffect(() => {
    if (!open) {
      return;
    }

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      onKeyDown?.(event);
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [open, onClose, onKeyDown]);

  if (!open) {
    return null;
  }

  return (
    <div
      className={`fixed inset-0 ${zClassName} flex items-center justify-center p-4`}
      role="dialog"
      aria-modal="true"
      aria-labelledby={titleId}
    >
      <button
        type="button"
        className={`absolute inset-0 ${APP_MODAL_SCRIM}`}
        aria-label={closeAriaLabel}
        onClick={onClose}
      />
      {children}
    </div>
  );
}

export function TransparentModalPanel({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`${APP_MODAL_PANEL} ${className}`.trim()}>{children}</div>;
}

export function TransparentModalScroll({
  children,
  className = "",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`max-h-[min(85dvh,calc(100dvh-2rem))] overflow-y-auto overscroll-y-contain [-webkit-overflow-scrolling:touch] ${className}`.trim()}
    >
      {children}
    </div>
  );
}
