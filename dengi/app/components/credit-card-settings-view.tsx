"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CreditCardDetailTabs,
  type CreditCardDetailTab,
} from "@/app/components/credit-card-detail-tabs";
import { CreditCardReportPanel } from "@/app/components/credit-card-report-panel";
import { CreditCardSettingsPanel } from "@/app/components/credit-card-settings-panel";
import { CreditCardTile } from "@/app/components/credit-card-tile";
import { CreditCardTransactionsPanel } from "@/app/components/credit-card-transactions-panel";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import type { CreditCard } from "@/lib/credit-cards/types";

function CreditCardDetailContent({ card }: { card: CreditCard }) {
  const router = useRouter();
  const { updateCard } = useCreditCards();
  const [tab, setTab] = useState<CreditCardDetailTab>("transactions");
  const [draft, setDraft] = useState(card);
  const [saved, setSaved] = useState(false);

  const displayCard = tab === "settings" ? draft : card;

  function patchDraft(patch: Partial<CreditCard>) {
    setDraft((current) => ({ ...current, ...patch, id: card.id }));
    setSaved(false);
  }

  return (
    <div className={APP_PAGE_CLASS}>
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Назад
          </Link>
          <h1 className="text-sm font-semibold tracking-tight">{card.name}</h1>
          <span className="w-10" aria-hidden />
        </header>

        <div className="-mx-4">
          <CreditCardTile {...displayCard} variant="detail" />
        </div>

        <CreditCardDetailTabs active={tab} onChange={setTab} />

        {tab === "transactions" ? (
          <CreditCardTransactionsPanel cardId={card.id} />
        ) : null}

        {tab === "report" ? (
          <CreditCardReportPanel cardId={card.id} currentBalance={card.balance} />
        ) : null}

        {tab === "settings" ? (
          <div className="space-y-3">
            <CreditCardSettingsPanel
              key={`${card.id}:${card.contract?.termsExtractedAt ?? "none"}`}
              card={card}
              draft={draft}
              onDraftChange={patchDraft}
              onSave={(next) => {
                updateCard(next.id, next);
                setDraft(next);
                setSaved(true);
                router.refresh();
              }}
              onPersist={(patch) => {
                updateCard(card.id, patch);
                setDraft((current) => ({ ...current, ...patch, id: card.id }));
              }}
            />
            <p
              className={`text-xs font-medium ${saved ? "text-emerald-600" : "text-transparent"}`}
              aria-live="polite"
            >
              Настройки сохранены
            </p>
          </div>
        ) : null}
      </main>
    </div>
  );
}

export function CreditCardSettingsView({ cardId }: { cardId: string }) {
  const { getCard } = useCreditCards();
  const card = getCard(cardId);

  if (!card) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          На главную
        </Link>
        <p className="text-sm text-zinc-600">Карта не найдена.</p>
      </div>
    );
  }

  return <CreditCardDetailContent card={card} />;
}
