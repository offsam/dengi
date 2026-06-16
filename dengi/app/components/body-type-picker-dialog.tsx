"use client";

import { useEffect, useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { CarIconImage } from "@/app/components/car-icon-image";
import { FormRowEnd } from "@/app/components/usd-amount";
import {
  BODY_TYPE_ICONS,
  resolveBodyTypeIcon,
  type BodyTypeIcon,
} from "@/lib/car-icons";

export function BodyTypePickerDialog({
  open,
  value,
  onClose,
  onSelect,
}: {
  open: boolean;
  value: string;
  onClose: () => void;
  onSelect: (icon: BodyTypeIcon) => void;
}) {
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

  const selected = resolveBodyTypeIcon(value);

  return (
    <div
      className="fixed inset-0 z-[60] flex items-end justify-center"
      role="dialog"
      aria-modal="true"
      aria-labelledby="body-type-picker-title"
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/40"
        aria-label="Закрыть выбор типа кузова"
        onClick={onClose}
      />

      <BubbleCard className="relative flex max-h-[85dvh] w-full max-w-md flex-col overflow-hidden rounded-t-3xl rounded-b-none">
        <div className="shrink-0 border-b border-white/40 px-4 py-4">
          <div className="flex items-center justify-between gap-3">
            <h2
              id="body-type-picker-title"
              className="text-sm font-semibold tracking-tight text-zinc-900"
            >
              Тип кузова
            </h2>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              Отмена
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-3">
            {BODY_TYPE_ICONS.map((icon) => {
              const isSelected = icon.id === selected.id;

              return (
                <button
                  key={icon.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={icon.label}
                  className={`flex flex-col items-center gap-1.5 rounded-xl p-2 transition-colors ${
                    isSelected
                      ? "bg-zinc-900/[0.09] shadow-[inset_0_2px_7px_rgba(55,50,45,0.2),inset_0_-1px_0_rgba(255,255,255,0.7)]"
                      : "hover:bg-white/25"
                  }`}
                  onClick={() => {
                    onSelect(icon);
                    onClose();
                  }}
                >
                  <CarIconImage
                    fileName={icon.fileName}
                    className="h-10 w-full"
                    fallback={
                      <span className="flex h-10 w-full items-center justify-center text-[10px] text-zinc-400">
                        …
                      </span>
                    }
                  />
                  <span className="line-clamp-2 text-center text-[10px] font-medium leading-tight text-zinc-700">
                    {icon.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </BubbleCard>
    </div>
  );
}

type BodyTypePickerRowProps = {
  value: string;
  onChange: (icon: BodyTypeIcon) => void;
  highlighted?: boolean;
  highlightClassName?: string;
};

export function BodyTypePickerRow({
  value,
  onChange,
  highlighted = false,
  highlightClassName = "",
}: BodyTypePickerRowProps) {
  const [open, setOpen] = useState(false);
  const icon = resolveBodyTypeIcon(value);

  return (
    <>
      <FormRowEnd>
        <button
          type="button"
          className={`inline-flex items-center gap-2 whitespace-nowrap text-[15px] leading-none text-zinc-900 ${
            highlighted ? highlightClassName : ""
          }`}
          onClick={() => setOpen(true)}
        >
          <CarIconImage
            fileName={icon.fileName}
            className="h-7 w-12"
            fallback={<span className="inline-block h-7 w-12 rounded bg-zinc-200/60" aria-hidden />}
          />
          <span>{icon.label}</span>
        </button>
      </FormRowEnd>

      <BodyTypePickerDialog
        open={open}
        value={value}
        onClose={() => setOpen(false)}
        onSelect={onChange}
      />
    </>
  );
}
