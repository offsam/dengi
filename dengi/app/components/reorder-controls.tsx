"use client";

import { useLocale } from "@/app/components/locale-provider";

const buttonClassName =
  "flex size-7 items-center justify-center rounded-full text-sm font-semibold text-zinc-500 transition-colors hover:bg-zinc-100 hover:text-zinc-900 disabled:pointer-events-none disabled:opacity-30";

export function VerticalReorderButtons({
  onMoveUp,
  onMoveDown,
  canMoveUp,
  canMoveDown,
  className = "",
}: {
  onMoveUp: () => void;
  onMoveDown: () => void;
  canMoveUp: boolean;
  canMoveDown: boolean;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <div className={`flex flex-col gap-0.5 ${className}`.trim()}>
      <button
        type="button"
        className={buttonClassName}
        aria-label={t("common.moveUp")}
        disabled={!canMoveUp}
        onClick={onMoveUp}
      >
        ↑
      </button>
      <button
        type="button"
        className={buttonClassName}
        aria-label={t("common.moveDown")}
        disabled={!canMoveDown}
        onClick={onMoveDown}
      >
        ↓
      </button>
    </div>
  );
}

export function HorizontalReorderButtons({
  onMoveLeft,
  onMoveRight,
  canMoveLeft,
  canMoveRight,
  className = "",
}: {
  onMoveLeft: () => void;
  onMoveRight: () => void;
  canMoveLeft: boolean;
  canMoveRight: boolean;
  className?: string;
}) {
  const { t } = useLocale();

  return (
    <div className={`flex gap-0.5 ${className}`.trim()}>
      <button
        type="button"
        className={buttonClassName}
        aria-label={t("common.moveLeft")}
        disabled={!canMoveLeft}
        onClick={onMoveLeft}
      >
        ←
      </button>
      <button
        type="button"
        className={buttonClassName}
        aria-label={t("common.moveRight")}
        disabled={!canMoveRight}
        onClick={onMoveRight}
      >
        →
      </button>
    </div>
  );
}
