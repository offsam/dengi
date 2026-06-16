"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { useAutoVehicles } from "@/app/hooks/use-auto-vehicles";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { buildAppCatalog } from "@/lib/assistant/catalog";
import {
  buildCancelledReply,
  buildDoneReply,
  buildUnknownReply,
  describeAssistantAction,
} from "@/lib/assistant/describe-action";
import { resolveAssistantIntent } from "@/lib/assistant/resolve-intent";
import type {
  AssistantExecutableAction,
  AssistantMessage,
  PendingConfirmation,
} from "@/lib/assistant/types";
import {
  getAssistantLocale,
  isAffirmative,
  isNegative,
} from "@/lib/assistant/types";
import { addCreditCardTransaction } from "@/lib/credit-cards/transactions/storage";

type DockSide = "left" | "right";

const BUBBLE_SIZE = 56;
const EDGE_SNAP = 36;
const TRANSACTIONS_EVENT = "dengi:credit-card-transactions-updated";

function createMessage(role: AssistantMessage["role"], text: string): AssistantMessage {
  return {
    id: crypto.randomUUID(),
    role,
    text,
  };
}

export function FloatingAssistant() {
  const { cards, addCard, updateCard, getCard } = useCreditCards();
  const { vehicles } = useAutoVehicles();
  const catalog = useMemo(() => buildAppCatalog(cards, vehicles), [cards, vehicles]);
  const [open, setOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(false);
  const [dockSide, setDockSide] = useState<DockSide>("right");
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [ready, setReady] = useState(false);
  const [input, setInput] = useState("");
  const [recording, setRecording] = useState(false);
  const [busy, setBusy] = useState(false);
  const [messages, setMessages] = useState<AssistantMessage[]>([
    createMessage(
      "assistant",
      "Примеры: «Потратил 50 на Sapphire», «Положил 200 на Discover», «Добавь карту Chase лимит 10000». Сначала правила (бесплатно), потом GPT-4o mini если не понял."
    ),
  ]);
  const [pending, setPending] = useState<PendingConfirmation | null>(null);

  const dragRef = useRef<{
    pointerId: number;
    startX: number;
    startY: number;
    originX: number;
    originY: number;
    moved: boolean;
  } | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  useEffect(() => {
    function placeDefault() {
      setPosition({
        x: window.innerWidth - BUBBLE_SIZE - 20,
        y: window.innerHeight - BUBBLE_SIZE - 96,
      });
      setReady(true);
    }

    placeDefault();
    window.addEventListener("resize", placeDefault);
    return () => window.removeEventListener("resize", placeDefault);
  }, []);

  const pushAssistant = useCallback((text: string) => {
    setMessages((current) => [...current, createMessage("assistant", text)]);
  }, []);

  const executeAction = useCallback(
    (action: AssistantExecutableAction) => {
      if (action.type === "add_card") {
        addCard(action.draft);
        return;
      }

      if (action.type === "add_credit_card_transaction") {
        const card = getCard(action.cardId);
        if (!card) {
          return;
        }

        addCreditCardTransaction({
          cardId: action.cardId,
          type: action.transactionType,
          amount: action.amount,
          description: action.description,
          occurredAt: new Date().toISOString(),
        });
        window.dispatchEvent(new Event(TRANSACTIONS_EVENT));

        const nextBalance =
          action.transactionType === "purchase"
            ? card.balance + action.amount
            : Math.max(0, card.balance - action.amount);

        updateCard(action.cardId, {
          balance: nextBalance,
          previousBalance: card.balance,
        });
      }
    },
    [addCard, getCard, updateCard]
  );

  const handleUserText = useCallback(
    async (rawText: string) => {
      const text = rawText.trim();
      if (!text) {
        return;
      }

      setMessages((current) => [...current, createMessage("user", text)]);
      const locale = getAssistantLocale();

      if (pending) {
        if (isAffirmative(text)) {
          executeAction(pending.action);
          setPending(null);
          pushAssistant(buildDoneReply(pending.action, locale));
          return;
        }

        if (isNegative(text)) {
          setPending(null);
          pushAssistant(buildCancelledReply(locale));
          return;
        }
      }

      setBusy(true);
      const intent = await resolveAssistantIntent(text, catalog);
      setBusy(false);

      if (intent.type === "unknown") {
        pushAssistant(buildUnknownReply(locale));
        return;
      }

      if (intent.type === "unsupported") {
        pushAssistant(intent.message);
        return;
      }

      const prompt = describeAssistantAction(intent, locale);
      setPending({ action: intent, prompt });
      pushAssistant(prompt);
    },
    [catalog, executeAction, pending, pushAssistant]
  );

  function onPointerDown(event: React.PointerEvent<HTMLButtonElement>) {
    dragRef.current = {
      pointerId: event.pointerId,
      startX: event.clientX,
      startY: event.clientY,
      originX: position.x,
      originY: position.y,
      moved: false,
    };

    event.currentTarget.setPointerCapture(event.pointerId);
  }

  function onPointerMove(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;

    if (Math.abs(deltaX) > 4 || Math.abs(deltaY) > 4) {
      drag.moved = true;
      setCollapsed(false);
    }

    const maxX = window.innerWidth - BUBBLE_SIZE - 8;
    const maxY = window.innerHeight - BUBBLE_SIZE - 8;

    setPosition({
      x: Math.min(maxX, Math.max(8, drag.originX + deltaX)),
      y: Math.min(maxY, Math.max(8, drag.originY + deltaY)),
    });
  }

  function onPointerUp(event: React.PointerEvent<HTMLButtonElement>) {
    const drag = dragRef.current;
    if (!drag || drag.pointerId !== event.pointerId) {
      return;
    }

    event.currentTarget.releasePointerCapture(event.pointerId);

    const deltaX = event.clientX - drag.startX;
    const deltaY = event.clientY - drag.startY;
    const maxX = window.innerWidth - BUBBLE_SIZE - 8;
    const maxY = window.innerHeight - BUBBLE_SIZE - 8;
    const finalX = drag.moved
      ? Math.min(maxX, Math.max(8, drag.originX + deltaX))
      : position.x;
    const finalY = drag.moved
      ? Math.min(maxY, Math.max(8, drag.originY + deltaY))
      : position.y;

    dragRef.current = null;

    if (drag.moved) {
      setOpen(false);
      setPosition({ x: finalX, y: finalY });
      const centerX = finalX + BUBBLE_SIZE / 2;

      if (centerX <= EDGE_SNAP) {
        setDockSide("left");
        setCollapsed(true);
        setOpen(false);
        return;
      }

      if (centerX >= window.innerWidth - EDGE_SNAP) {
        setDockSide("right");
        setCollapsed(true);
        setOpen(false);
      }

      return;
    }

    setOpen((current) => !current);
  }

  async function startRecording() {
    if (recording || busy) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      chunksRef.current = [];
      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };
      recorder.onstop = async () => {
        stream.getTracks().forEach((track) => track.stop());
        const blob = new Blob(chunksRef.current, { type: "audio/webm" });
        await transcribeAudio(blob);
      };
      mediaRecorderRef.current = recorder;
      recorder.start();
      setRecording(true);
    } catch {
      pushAssistant("Нет доступа к микрофону. Можно написать текстом.");
    }
  }

  function stopRecording() {
    const recorder = mediaRecorderRef.current;
    if (!recorder || recorder.state === "inactive") {
      return;
    }

    recorder.stop();
    setRecording(false);
  }

  async function transcribeAudio(blob: Blob) {
    setBusy(true);

    try {
      const formData = new FormData();
      formData.append("audio", blob, "speech.webm");

      const response = await fetch("/api/assistant/transcribe", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as { text?: string; error?: string };

      if (!response.ok) {
        pushAssistant(payload.error ?? "Не удалось распознать голос.");
        return;
      }

      if (!payload.text) {
        pushAssistant("Ничего не расслышал. Попробуйте ещё раз.");
        return;
      }

      await handleUserText(payload.text);
    } catch {
      pushAssistant("Голос не распознан. Попробуйте написать текстом.");
    } finally {
      setBusy(false);
    }
  }

  async function submitText(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!input.trim() || busy) {
      return;
    }

    const text = input;
    setInput("");
    await handleUserText(text);
  }

  if (!ready) {
    return null;
  }

  if (collapsed) {
    return (
      <button
        type="button"
        aria-label="Открыть помощника"
        onClick={() => {
          setCollapsed(false);
          setOpen(true);
        }}
        className="fixed z-50 flex h-14 w-7 items-center justify-center bg-zinc-900/35 text-white backdrop-blur-sm transition-colors hover:bg-zinc-900/55"
        style={{
          top: position.y + BUBBLE_SIZE / 2 - 28,
          ...(dockSide === "right" ? { right: 0 } : { left: 0 }),
        }}
      >
        <span className="text-sm leading-none">{dockSide === "right" ? "‹" : "›"}</span>
      </button>
    );
  }

  return (
    <>
      {open ? (
        <div
          className="fixed z-50 w-[min(100vw-2rem,22rem)]"
          style={{
            left: Math.min(
              window.innerWidth - 16 - Math.min(window.innerWidth - 32, 352),
              Math.max(16, position.x - 280 + BUBBLE_SIZE)
            ),
            top: Math.max(16, position.y - 360),
          }}
        >
          <BubbleCard className="flex max-h-[min(24rem,70dvh)] flex-col overflow-hidden">
          <div className="border-b border-white/40 px-4 py-3">
            <p className="text-sm font-semibold text-zinc-900">Помощник</p>
            <p className="mt-0.5 text-xs text-zinc-500">
              Сначала правила, потом GPT-4o mini
            </p>
          </div>

          <div className="max-h-64 space-y-3 overflow-y-auto px-4 py-3">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`rounded-2xl px-3 py-2 text-sm ${
                  message.role === "assistant"
                    ? "bg-zinc-100 text-zinc-800"
                    : "bg-zinc-900 text-white"
                }`}
              >
                {message.text}
              </div>
            ))}
          </div>

          {pending ? (
            <div className="flex gap-2 border-t border-zinc-100 px-4 py-3">
              <button
                type="button"
                onClick={() => void handleUserText("yes")}
                className="flex-1 rounded-full bg-zinc-900 px-3 py-2 text-xs font-semibold text-white"
              >
                Да
              </button>
              <button
                type="button"
                onClick={() => void handleUserText("no")}
                className="flex-1 rounded-full border border-zinc-200 px-3 py-2 text-xs font-semibold text-zinc-700"
              >
                Нет
              </button>
            </div>
          ) : null}

          <form
            className="flex items-center gap-2 border-t border-zinc-100 px-3 py-3"
            onSubmit={submitText}
          >
            <input
              className="min-w-0 flex-1 rounded-full border border-zinc-200 px-3 py-2 text-sm outline-none focus:border-zinc-400"
              value={input}
              onChange={(event) => setInput(event.target.value)}
              placeholder="Потратил 50 на Sapphire..."
              disabled={busy}
            />
            <button
              type="button"
              onClick={recording ? stopRecording : startRecording}
              disabled={busy}
              className={`rounded-full px-3 py-2 text-xs font-semibold ${
                recording
                  ? "bg-rose-600 text-white"
                  : "border border-zinc-200 text-zinc-700"
              }`}
            >
              {recording ? "Стоп" : "Голос"}
            </button>
            <button
              type="submit"
              disabled={busy || !input.trim()}
              className="rounded-full bg-zinc-900 px-3 py-2 text-xs font-semibold text-white disabled:opacity-50"
            >
              Отправить
            </button>
          </form>
          </BubbleCard>
        </div>
      ) : null}

      <button
        type="button"
        aria-label="Помощник"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        className={`fixed z-50 flex size-14 items-center justify-center rounded-full text-sm font-semibold text-white shadow-lg touch-none ${
          open ? "bg-zinc-700" : "bg-zinc-900"
        }`}
        style={{ left: position.x, top: position.y }}
      >
        AI
      </button>
    </>
  );
}
