"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  HousingBillCard,
  HousingBillHistoryPanel,
  HousingBillOverviewPanel,
} from "@/app/components/housing-bill-card";
import {
  HousingBillDetailTabs,
  type HousingBillDetailTab,
} from "@/app/components/housing-bill-detail-tabs";
import { HousingBillSettingsPanel } from "@/app/components/housing-bill-settings-panel";
import { SimpleDeleteDialog } from "@/app/components/simple-delete-dialog";
import { useHousingBills } from "@/app/hooks/use-housing-bills";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import type { HousingBill } from "@/lib/dashboard/housing-bills";

function HousingBillDetailContent({ bill }: { bill: HousingBill }) {
  const router = useRouter();
  const { updateBill, deleteBill } = useHousingBills();
  const [tab, setTab] = useState<HousingBillDetailTab>("overview");
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
          <h1 className="truncate text-sm font-semibold tracking-tight">{bill.name}</h1>
          <span className="w-10" aria-hidden />
        </header>

        <HousingBillCard {...bill} variant="detail" />

        <HousingBillDetailTabs active={tab} onChange={setTab} />

        {tab === "overview" ? <HousingBillOverviewPanel bill={bill} /> : null}
        {tab === "history" ? <HousingBillHistoryPanel bill={bill} /> : null}
        {tab === "settings" ? (
          <HousingBillSettingsPanel
            key={`${bill.id}:${bill.name}:${bill.date}:${bill.amount}`}
            bill={bill}
            onSave={(next) => updateBill(next.id, next)}
            onDelete={() => setDeleteOpen(true)}
          />
        ) : null}
      </main>

      <SimpleDeleteDialog
        open={deleteOpen}
        title="Удалить счёт?"
        description={`«${bill.name}» исчезнет с главного экрана.`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          deleteBill(bill.id);
          router.push("/");
        }}
      />
    </div>
  );
}

export function HousingBillSettingsView({ billId }: { billId: string }) {
  const { getBill } = useHousingBills();
  const bill = getBill(billId);

  if (!bill) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          На главную
        </Link>
        <p className="text-sm text-zinc-600">Счёт не найден.</p>
      </div>
    );
  }

  return <HousingBillDetailContent bill={bill} />;
}
