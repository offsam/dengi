"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import {
  CheckIcon,
  CloseIcon,
  inlineEditIconButtonClassName,
  PencilIcon,
} from "@/app/components/inline-edit-icons";
import { UsdAmount } from "@/app/components/usd-amount";
import { BubbleCard } from "@/app/components/bubble-card";
import { useLocale } from "@/app/components/locale-provider";
import { resolveAppLocale } from "@/lib/i18n/locale";
import type { AppLang } from "@/lib/i18n/types";
import { paymentAmountStyle } from "@/lib/auto-vehicles/payment-status-colors";
import type { AutoVehiclePaymentType } from "@/lib/auto-vehicles/records/types";
import type { PaymentTimelineEntry } from "@/lib/auto-vehicles/records/payment-timeline";
import type { AutoVehicleRecord } from "@/lib/auto-vehicles/records/types";
import { PAYMENTS_HERO_COMPRESS_MAX_PX } from "@/lib/auto-vehicles/credit-stats-layout";
import { translatePresetName } from "@/lib/i18n/presets";
import type { Translator } from "@/lib/i18n/translate";

export function paymentEditFormId(recordId: string) {
  return `payment-edit-${recordId}`;
}

/** Отступ пузыря от краёв области прокрутки */
const BUBBLE_PIN_INSET_PX = 6;

function paymentTypeLabel(type: AutoVehiclePaymentType | undefined, t: Translator) {
  if (!type) {
    return t("auto.payments.generic");
  }

  return t(`auto.paymentType.${type}`);
}

function formatDate(iso: string, lang: AppLang) {
  return new Intl.DateTimeFormat(resolveAppLocale(lang), {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(`${iso}T12:00:00.000Z`));
}

function formatDaysUntil(dateIso: string, t: Translator, lang: AppLang) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const target = new Date(`${dateIso}T12:00:00.000Z`);
  const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

  if (days <= 0) {
    return t("auto.paymentTimeline.today");
  }

  if (days === 1) {
    return t("auto.paymentTimeline.tomorrow");
  }

  if (lang === "en") {
    return t("auto.paymentTimeline.inDays", { n: String(days) });
  }

  const mod10 = days % 10;
  const mod100 = days % 100;

  if (mod10 === 1 && mod100 !== 11) {
    return t("auto.paymentTimeline.inDaysOne", { n: String(days) });
  }

  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    return t("auto.paymentTimeline.inDaysFew", { n: String(days) });
  }

  return t("auto.paymentTimeline.inDaysMany", { n: String(days) });
}

function CurrentPaymentBubble({ entry }: { entry: PaymentTimelineEntry }) {
  const { lang, t } = useLocale();
  const daysLabel = formatDaysUntil(entry.date, t, lang);

  return (
    <BubbleCard variant="glass" className="px-3.5 py-2.5">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="mb-1 inline-block rounded-full border border-white/60 bg-white/20 px-2.5 py-0.5 text-[11px] font-semibold text-zinc-600">
            {daysLabel}
          </span>
          <p className="truncate text-[15px] font-semibold leading-snug text-zinc-900">
            {translatePresetName(entry.description, lang)}
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">
            {paymentTypeLabel(entry.paymentType, t)} · {formatDate(entry.date, lang)}
          </p>
        </div>

        <p
          className="shrink-0 self-center text-lg font-bold tabular-nums leading-none"
          style={paymentAmountStyle("current")}
        >
          <UsdAmount amount={entry.amount} exact className="text-inherit" />
        </p>
      </div>
    </BubbleCard>
  );
}

function LoanPaidMessage() {
  const { t } = useLocale();

  return (
    <BubbleCard variant="glass" className="px-3 py-2 text-center">
      <p className="text-xs text-zinc-600">{t("auto.payments.loanPaid")}</p>
    </BubbleCard>
  );
}

function PaymentTimelineRow({
  entry,
  readOnly,
  isEditing,
  editFormId,
  onEdit,
  onCancel,
}: {
  entry: PaymentTimelineEntry;
  readOnly: boolean;
  isEditing: boolean;
  editFormId?: string;
  onEdit: () => void;
  onCancel: () => void;
}) {
  const { lang, t } = useLocale();
  const isPaid = entry.status === "paid";
  const isUpcoming = entry.status === "upcoming";
  const amountStatus = isPaid ? "paid" : isUpcoming ? "upcoming" : "current";

  return (
    <div data-payment-status={entry.status} className="flex items-center justify-between gap-3 px-3 py-2.5 transition-all">
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-medium ${
            isUpcoming ? "text-zinc-500" : "text-zinc-700"
          }`}
        >
          {translatePresetName(entry.description, lang)}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {paymentTypeLabel(entry.paymentType, t)} · {formatDate(entry.date, lang)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-1">
        <p className="text-sm font-semibold tabular-nums">
          <UsdAmount
            amount={entry.amount}
            exact
            className="text-inherit"
            style={paymentAmountStyle(amountStatus)}
          />
        </p>
        {!readOnly && isPaid && entry.record ? (
          isEditing ? (
            <>
              <button
                type="submit"
                form={editFormId}
                className={`${inlineEditIconButtonClassName} text-[#5DAA8C] hover:bg-[#5DAA8C]/10 hover:text-[#48946F]`}
                aria-label={t("common.save")}
              >
                <CheckIcon />
              </button>
              <button
                type="button"
                className={inlineEditIconButtonClassName}
                aria-label={t("common.cancel")}
                onClick={onCancel}
              >
                <CloseIcon />
              </button>
            </>
          ) : (
            <button
              type="button"
              className={inlineEditIconButtonClassName}
              aria-label={t("common.edit")}
              onClick={onEdit}
            >
              <PencilIcon />
            </button>
          )
        ) : null}
      </div>
    </div>
  );
}

function ScrollFade({ position }: { position: "top" | "bottom" }) {
  return (
    <div
      className={`pointer-events-none absolute inset-x-0 z-30 h-10 ${
        position === "top"
          ? "top-0 bg-gradient-to-b from-zinc-50 via-zinc-50/90 to-transparent"
          : "bottom-0 bg-gradient-to-t from-zinc-50 via-zinc-50/90 to-transparent"
      }`}
    />
  );
}

const scrollClassName =
  "absolute inset-0 z-0 overflow-y-auto overscroll-y-contain [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden";

function centerScrollOnAnchor(
  container: HTMLDivElement,
  anchor: HTMLDivElement
) {
  const containerRect = container.getBoundingClientRect();
  const anchorRect = anchor.getBoundingClientRect();
  const nextScrollTop =
    container.scrollTop +
    (anchorRect.top - containerRect.top) -
    container.clientHeight / 2 +
    anchorRect.height / 2;

  container.scrollTop = Math.max(0, nextScrollTop);
}

export function AutoVehiclePaymentTimeline({
  entries,
  readOnly,
  editingId,
  onEdit,
  onCancelEdit,
  editForm,
  expanded = false,
  onHeroCompress,
}: {
  entries: PaymentTimelineEntry[];
  readOnly: boolean;
  editingId: string | null;
  onEdit: (record: AutoVehicleRecord) => void;
  onCancelEdit: () => void;
  editForm: (record: AutoVehicleRecord) => React.ReactNode;
  expanded?: boolean;
  /** 0–1: пузырь упёрся вверх и «толкает» hero-машину */
  onHeroCompress?: (compress: number) => void;
}) {
  const { t } = useLocale();
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAnchorRef = useRef<HTMLDivElement>(null);
  const bubbleOverlayRef = useRef<HTMLDivElement>(null);
  const lastCompressRef = useRef(-1);
  const lastCenterKeyRef = useRef<string | null>(null);
  const lastExpandedRef = useRef(expanded);

  const scrollAnchorKey = useMemo(() => {
    const currentEntry = entries.find((entry) => entry.status === "current");

    return `${entries.length}:${currentEntry?.key ?? "none"}`;
  }, [entries]);

  const { upcoming, current, paid } = useMemo(() => {
    return {
      upcoming: entries.filter((entry) => entry.status === "upcoming"),
      current: entries.find((entry) => entry.status === "current") ?? null,
      paid: entries.filter((entry) => entry.status === "paid"),
    };
  }, [entries]);

  const updateBubblePosition = useCallback(() => {
    const container = containerRef.current;
    const anchor = currentAnchorRef.current;
    const bubble = bubbleOverlayRef.current;

    if (!container || !anchor || !bubble) {
      return;
    }

    const containerRect = container.getBoundingClientRect();
    const anchorRect = anchor.getBoundingClientRect();
    const fullHeight = anchor.offsetHeight;

    if (fullHeight <= 0) {
      return;
    }

    const anchorCenterY =
      anchorRect.top - containerRect.top + anchorRect.height / 2;

    const minTop = BUBBLE_PIN_INSET_PX;
    const idealTop = anchorCenterY - fullHeight / 2;
    let top = idealTop;
    let compress = 0;

    if (idealTop < minTop) {
      top = minTop;
      compress = Math.min(
        1,
        (minTop - idealTop) / PAYMENTS_HERO_COMPRESS_MAX_PX
      );
    }

    const maxTop = Math.max(
      minTop,
      containerRect.height - fullHeight - BUBBLE_PIN_INSET_PX
    );
    top = Math.min(maxTop, Math.max(minTop, top));

    bubble.style.top = `${top}px`;

    const roundedCompress = Math.round(compress * 1000) / 1000;
    if (onHeroCompress && roundedCompress !== lastCompressRef.current) {
      lastCompressRef.current = roundedCompress;
      onHeroCompress(roundedCompress);
    }
  }, [onHeroCompress]);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const anchor = currentAnchorRef.current;

    if (!container || !anchor) {
      return;
    }

    const shouldCenter =
      lastCenterKeyRef.current !== scrollAnchorKey ||
      lastExpandedRef.current !== expanded ||
      lastCenterKeyRef.current === null;

    lastCenterKeyRef.current = scrollAnchorKey;
    lastExpandedRef.current = expanded;

    if (shouldCenter) {
      centerScrollOnAnchor(container, anchor);
    }

    updateBubblePosition();
  }, [scrollAnchorKey, editingId, expanded, updateBubblePosition]);

  useEffect(() => {
    const container = containerRef.current;
    const scroll = scrollRef.current;

    if (!container || !scroll) {
      return;
    }

    let frame = 0;

    const scheduleUpdate = () => {
      window.cancelAnimationFrame(frame);
      frame = window.requestAnimationFrame(updateBubblePosition);
    };

    scroll.addEventListener("scroll", scheduleUpdate, { passive: true });
    window.addEventListener("resize", scheduleUpdate);

    const resizeObserver = new ResizeObserver(scheduleUpdate);
    resizeObserver.observe(container);
    resizeObserver.observe(scroll);

    scheduleUpdate();

    return () => {
      window.cancelAnimationFrame(frame);
      scroll.removeEventListener("scroll", scheduleUpdate);
      window.removeEventListener("resize", scheduleUpdate);
      resizeObserver.disconnect();
      lastCompressRef.current = -1;
      onHeroCompress?.(0);
    };
  }, [onHeroCompress, updateBubblePosition, scrollAnchorKey]);

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
        {t("auto.payments.empty")}
      </p>
    );
  }

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden ${
        expanded
          ? "relative h-0 min-h-0 min-h-[min(26rem,52dvh)] flex-1"
          : "relative h-[min(19rem,36dvh)] shrink-0"
      }`}
    >
      <div ref={scrollRef} className={scrollClassName}>
        <div className="flex flex-col gap-0.5 py-2">
          {upcoming.map((entry) => (
            <PaymentTimelineRow
              key={entry.key}
              entry={entry}
              readOnly={readOnly}
              isEditing={false}
              onEdit={() => {}}
              onCancel={() => {}}
            />
          ))}

          <div ref={currentAnchorRef} className="px-1 py-0.5">
            {current ? (
              <div aria-hidden className="pointer-events-none opacity-0">
                <CurrentPaymentBubble entry={current} />
              </div>
            ) : (
              <div aria-hidden className="pointer-events-none opacity-0">
                <LoanPaidMessage />
              </div>
            )}
          </div>

          {paid.map((entry) => {
            const isEditing = entry.record ? editingId === entry.record.id : false;
            const formId = entry.record ? paymentEditFormId(entry.record.id) : undefined;

            return (
              <div key={entry.key}>
                <PaymentTimelineRow
                  entry={entry}
                  readOnly={readOnly}
                  isEditing={isEditing}
                  editFormId={formId}
                  onEdit={() => {
                    if (entry.record) {
                      onEdit(entry.record);
                    }
                  }}
                  onCancel={onCancelEdit}
                />
                {!readOnly && isEditing && entry.record ? editForm(entry.record) : null}
              </div>
            );
          })}
        </div>
      </div>

      <div
        ref={bubbleOverlayRef}
        className="pointer-events-none absolute inset-x-0 z-40 px-1"
        style={{ top: 0 }}
      >
        {current ? <CurrentPaymentBubble entry={current} /> : <LoanPaidMessage />}
      </div>

      <ScrollFade position="top" />
      <ScrollFade position="bottom" />
    </div>
  );
}
