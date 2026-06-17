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
import { CreditCardTransactionsChart } from "@/app/components/credit-card-transactions-chart";
import { CreditCardTransactionsPanel } from "@/app/components/credit-card-transactions-panel";
import { SimpleDeleteDialog } from "@/app/components/simple-delete-dialog";
import { useCreditCards } from "@/app/hooks/use-credit-cards";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import type { CreditCard } from "@/lib/credit-cards/types";

function CreditCardDetailContent({ card }: { card: CreditCard }) {
  const router = useRouter();
  const { updateCard, deleteCard } = useCreditCards();
  const [tab, setTab] = useState<CreditCardDetailTab>("report");
  const [deleteOpen, setDeleteOpen] = useState(false);

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
          <CreditCardTile {...card} variant="detail" />
        </div>

        {tab === "transactions" ? (
          <CreditCardTransactionsChart cardId={card.id} />
        ) : null}

        <CreditCardDetailTabs active={tab} onChange={setTab} />

        {tab === "transactions" ? (
          <CreditCardTransactionsPanel cardId={card.id} />
        ) : null}

        {tab === "report" ? (
          <CreditCardReportPanel cardId={card.id} currentBalance={card.balance} />
        ) : null}

        {tab === "settings" ? (
          <CreditCardSettingsPanel
            key={`${card.id}:${card.contract?.termsExtractedAt ?? "none"}`}
            card={card}
            onSave={(next) => {
              updateCard(next.id, next);
              router.refresh();
            }}
            onPersist={(patch) => {
              updateCard(card.id, patch);
            }}
            onDelete={() => setDeleteOpen(true)}
          />
        ) : null}
      </main>

      <SimpleDeleteDialog
        open={deleteOpen}
        title="Удалить карту?"
        description={`«${card.name}» исчезнет с главного экрана. Транзакции по карте тоже будут недоступны.`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          deleteCard(card.id);
          setDeleteOpen(false);
          router.push("/");
        }}
      />
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
