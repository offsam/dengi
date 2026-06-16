"use client";

import { useCallback, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { UsdAmount } from "@/app/components/usd-amount";
import { formatAppDate } from "@/lib/i18n/locale";
import type { AutoVehiclePaymentType } from "@/lib/auto-vehicles/records/types";
import type { PaymentTimelineEntry } from "@/lib/auto-vehicles/records/payment-timeline";
import type { AutoVehicleRecord } from "@/lib/auto-vehicles/records/types";

const PAYMENT_LABELS: Record<AutoVehiclePaymentType, string> = {
  loan: "Кредит",
  extra: "Досрочно",
  insurance: "Страховка",
};

/** Отступ пузыря от краёв области прокрутки */
const BUBBLE_PIN_INSET_PX = 6;

function formatDate(iso: string) {
  return formatAppDate(`${iso}T12:00:00.000Z`, {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatDaysUntil(dateIso: string) {
  const today = new Date();
  today.setHours(12, 0, 0, 0);
  const target = new Date(`${dateIso}T12:00:00.000Z`);
  const days = Math.ceil((target.getTime() - today.getTime()) / 86_400_000);

  if (days <= 0) {
    return "Сегодня";
  }

  if (days === 1) {
    return "Завтра";
  }

  const mod10 = days % 10;
  const mod100 = days % 100;
  let word = "дней";

  if (mod10 === 1 && mod100 !== 11) {
    word = "день";
  } else if (mod10 >= 2 && mod10 <= 4 && (mod100 < 10 || mod100 >= 20)) {
    word = "дня";
  }

  return `Через ${days} ${word}`;
}

function CurrentPaymentBubble({ entry }: { entry: PaymentTimelineEntry }) {
  const daysLabel = formatDaysUntil(entry.date);

  return (
    <div className="rounded-2xl border border-[#16B0A6]/55 bg-white/55 px-3.5 py-2.5 shadow-md shadow-[#16B0A6]/15 backdrop-blur-md">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <span className="mb-1 inline-block rounded-full bg-[#16B0A6]/20 px-2.5 py-0.5 text-[11px] font-semibold text-[#16B0A6]">
            {daysLabel}
          </span>
          <p className="truncate text-[15px] font-semibold leading-snug text-zinc-900">
            {entry.description}
          </p>
          <p className="mt-0.5 text-xs text-zinc-600">
            {entry.paymentType ? PAYMENT_LABELS[entry.paymentType] : "Платёж"} ·{" "}
            {formatDate(entry.date)}
          </p>
        </div>

        <p className="shrink-0 self-center text-lg font-bold tabular-nums leading-none text-zinc-900">
          <UsdAmount amount={entry.amount} exact />
        </p>
      </div>
    </div>
  );
}

function LoanPaidMessage() {
  return (
    <p className="rounded-2xl border border-zinc-200/60 bg-white/55 px-3 py-2 text-center text-xs text-zinc-600 backdrop-blur-md">
      Кредит погашен
    </p>
  );
}

function PaymentTimelineRow({
  entry,
  readOnly,
  isEditing,
  onEdit,
}: {
  entry: PaymentTimelineEntry;
  readOnly: boolean;
  isEditing: boolean;
  onEdit: () => void;
}) {
  const isPaid = entry.status === "paid";
  const isUpcoming = entry.status === "upcoming";

  return (
    <div
      data-payment-status={entry.status}
      className={`flex items-center justify-between gap-3 px-3 py-2.5 transition-all ${
        isUpcoming ? "opacity-40" : ""
      }`}
    >
      <div className="min-w-0">
        <p
          className={`truncate text-sm font-medium ${
            isUpcoming ? "text-zinc-500" : "text-zinc-700"
          }`}
        >
          {entry.description}
        </p>
        <p className="mt-0.5 text-xs text-zinc-500">
          {entry.paymentType ? PAYMENT_LABELS[entry.paymentType] : "Платёж"} ·{" "}
          {formatDate(entry.date)}
        </p>
      </div>

      <div className="flex shrink-0 items-center gap-2">
        <p className="text-sm font-semibold tabular-nums">
          <UsdAmount
            amount={entry.amount}
            exact
            tone={isPaid ? "positive" : "neutral"}
            className={isUpcoming ? "text-zinc-500" : ""}
          />
        </p>
        {!readOnly && isPaid && entry.record && !isEditing ? (
          <button
            type="button"
            className="text-xs font-medium text-zinc-500 underline-offset-2 hover:text-zinc-900 hover:underline"
            onClick={onEdit}
          >
            Изменить
          </button>
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
  editForm,
  expanded = false,
}: {
  entries: PaymentTimelineEntry[];
  readOnly: boolean;
  editingId: string | null;
  onEdit: (record: AutoVehicleRecord) => void;
  editForm: (record: AutoVehicleRecord) => React.ReactNode;
  expanded?: boolean;
}) {
  const containerRef = useRef<HTMLDivElement>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const currentAnchorRef = useRef<HTMLDivElement>(null);
  const bubbleOverlayRef = useRef<HTMLDivElement>(null);

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
    const bubbleHeight = bubble.offsetHeight;
    const anchorCenterY =
      anchorRect.top - containerRect.top + anchorRect.height / 2;

    const minTop = BUBBLE_PIN_INSET_PX;
    const maxTop = Math.max(
      minTop,
      containerRect.height - bubbleHeight - BUBBLE_PIN_INSET_PX
    );
    const nextTop = Math.min(
      maxTop,
      Math.max(minTop, anchorCenterY - bubbleHeight / 2)
    );

    bubble.style.top = `${nextTop}px`;
  }, []);

  useLayoutEffect(() => {
    const container = scrollRef.current;
    const anchor = currentAnchorRef.current;

    if (!container || !anchor) {
      return;
    }

    centerScrollOnAnchor(container, anchor);
    updateBubblePosition();
  }, [entries, editingId, expanded, updateBubblePosition]);

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
    };
  }, [updateBubblePosition, entries.length]);

  if (entries.length === 0) {
    return (
      <p className="rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-8 text-center text-sm text-zinc-500">
        Платежей пока нет.
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

            return (
              <div key={entry.key}>
                <PaymentTimelineRow
                  entry={entry}
                  readOnly={readOnly}
                  isEditing={isEditing}
                  onEdit={() => {
                    if (entry.record) {
                      onEdit(entry.record);
                    }
                  }}
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
