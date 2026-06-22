"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { CarIconImage } from "@/app/components/car-icon-image";
import { FormRowEnd } from "@/app/components/usd-amount";
import {
  APP_BUBBLE_INSET_SELECTED,
  APP_MODAL_HEADER,
  APP_MODAL_PANEL,
  APP_MODAL_SCRIM,
} from "@/lib/app-theme";
import {
  BODY_TYPE_ICON_COUNT,
  BODY_TYPE_ICONS,
  resolveBodyTypeIcon,
  type BodyTypeIcon,
} from "@/lib/car-icons";
import { useLocale } from "@/app/components/locale-provider";

/** Строка формы — компактная иконка */
const BODY_TYPE_INLINE_ICON = {
  wrapper: "relative h-[30px] w-[30px] shrink-0",
  img: "absolute inset-0 m-auto h-[30px] w-[30px] max-w-none object-contain object-center",
} as const;

/** Сетка пикера — общая линия снизу для всех силуэтов */
const BODY_TYPE_PICKER_ICON = {
  wrapper: "relative mx-auto flex h-[78px] w-full max-w-[78px] items-end justify-center",
  img: "h-[78px] w-[78px] max-w-none object-contain object-bottom",
} as const;

/** Мелкий транспорт — меньше, но на той же нижней линии */
const BODY_TYPE_PICKER_DENSE_IMG: Partial<Record<string, string>> = {
  mini: "h-[52px] w-[52px] max-w-none object-contain object-bottom",
  moto: "h-[52px] w-[52px] max-w-none object-contain object-bottom",
  ebike: "h-[52px] w-[52px] max-w-none object-contain object-bottom",
};

/** Точечная подгонка смещённых PNG */
const BODY_TYPE_PICKER_NUDGE: Partial<Record<string, string>> = {
  Cargo: "-translate-x-[3px]",
};

function BodyTypeIconSlot({
  fileName,
  iconId,
  variant = "picker",
}: {
  fileName: string;
  iconId: string;
  variant?: "inline" | "picker";
}) {
  const isInline = variant === "inline";
  const wrapper = isInline ? BODY_TYPE_INLINE_ICON.wrapper : BODY_TYPE_PICKER_ICON.wrapper;
  const imgClass = isInline
    ? BODY_TYPE_INLINE_ICON.img
    : `${BODY_TYPE_PICKER_DENSE_IMG[iconId] ?? BODY_TYPE_PICKER_ICON.img} ${BODY_TYPE_PICKER_NUDGE[iconId] ?? ""}`.trim();
  const fallbackSize = isInline
    ? "h-[30px] w-[30px]"
    : iconId in BODY_TYPE_PICKER_DENSE_IMG
      ? "h-[52px] w-[52px]"
      : "h-[78px] w-[78px]";

  return (
    <div className={wrapper}>
      <CarIconImage
        fileName={fileName}
        align="bottom"
        className={imgClass}
        fallback={
          <span
            className={`absolute inset-0 m-auto flex ${fallbackSize} items-center justify-center text-[10px] text-zinc-400`}
          >
            …
          </span>
        }
      />
    </div>
  );
}

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
  const { t } = useLocale();

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

  const selected = resolveBodyTypeIcon(value);

  if (!open) {
    return null;
  }

  const dialog = (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="body-type-picker-title"
    >
      <button
        type="button"
        className={`absolute inset-0 ${APP_MODAL_SCRIM}`}
        aria-label={t("auto.bodyTypePicker.closeAria")}
        onClick={onClose}
      />

      <div
        className={`relative z-10 flex max-h-[min(85dvh,calc(100dvh-2rem))] w-full max-w-md flex-col overflow-hidden ${APP_MODAL_PANEL}`}
      >
        <div className={`shrink-0 ${APP_MODAL_HEADER}`}>
          <div className="flex items-center justify-between gap-3">
            <div>
              <h2
                id="body-type-picker-title"
                className="text-sm font-semibold tracking-tight text-zinc-900"
              >
                {t("auto.bodyTypePicker.title")}
              </h2>
              <p className="mt-0.5 text-[11px] text-zinc-500">
                {BODY_TYPE_ICON_COUNT}
              </p>
            </div>
            <button
              type="button"
              onClick={onClose}
              className="rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
            >
              {t("common.cancel")}
            </button>
          </div>
        </div>

        <div className="min-h-0 flex-1 overflow-y-auto px-4 py-4">
          <div className="grid grid-cols-4 gap-3">
            {BODY_TYPE_ICONS.map((icon) => {
              const isSelected = icon.id === selected.id;
              const label = t(`auto.bodyTypes.${icon.id}`);

              return (
                <button
                  key={icon.id}
                  type="button"
                  aria-pressed={isSelected}
                  aria-label={label}
                  className={`flex min-h-[7.5rem] flex-col items-center justify-start gap-1.5 rounded-xl px-1 pt-2 pb-2 transition-colors ${
                    isSelected
                      ? APP_BUBBLE_INSET_SELECTED
                      : "hover:bg-zinc-900/[0.04]"
                  }`}
                  onClick={() => {
                    onSelect(icon);
                    onClose();
                  }}
                >
                  <BodyTypeIconSlot
                    fileName={icon.fileName}
                    iconId={icon.id}
                    variant="picker"
                  />
                  <span className="flex min-h-[2.5rem] items-start justify-center line-clamp-2 text-center text-[16px] font-medium leading-tight text-zinc-700">
                    {label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );

  return typeof document === "undefined" ? dialog : createPortal(dialog, document.body);
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
  const { t } = useLocale();
  const [open, setOpen] = useState(false);
  const icon = resolveBodyTypeIcon(value);
  const label = t(`auto.bodyTypes.${icon.id}`);

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
          <BodyTypeIconSlot fileName={icon.fileName} iconId={icon.id} variant="inline" />
          <span>{label}</span>
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
