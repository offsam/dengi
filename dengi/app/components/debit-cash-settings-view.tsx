"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  DebitCashAccountCard,
  DebitCashActivityPanel,
  DebitCashOverviewPanel,
} from "@/app/components/debit-cash-account-card";
import {
  DebitCashDetailTabs,
  type DebitCashDetailTab,
} from "@/app/components/debit-cash-detail-tabs";
import { DebitCashSettingsPanel } from "@/app/components/debit-cash-settings-panel";
import { SimpleDeleteDialog } from "@/app/components/simple-delete-dialog";
import { useLocale } from "@/app/components/locale-provider";
import { useClientMounted } from "@/app/hooks/use-client-mounted";
import { useDebitCashAccounts } from "@/app/hooks/use-debit-cash-accounts";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import type { DebitCashAccount } from "@/lib/dashboard/debit-accounts";

function DebitCashDetailContent({ account }: { account: DebitCashAccount }) {
  const { t } = useLocale();
  const router = useRouter();
  const { updateAccount, deleteAccount } = useDebitCashAccounts();
  const [tab, setTab] = useState<DebitCashDetailTab>("overview");
  const [deleteOpen, setDeleteOpen] = useState(false);

  return (
    <div className={APP_PAGE_CLASS}>
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            {t("common.back")}
          </Link>
          <h1 className="truncate text-sm font-semibold tracking-tight">{account.name}</h1>
          <span className="w-10" aria-hidden />
        </header>

        <DebitCashAccountCard account={account} variant="detail" />

        <DebitCashDetailTabs active={tab} onChange={setTab} />

        {tab === "overview" ? <DebitCashOverviewPanel account={account} /> : null}
        {tab === "activity" ? <DebitCashActivityPanel account={account} /> : null}
        {tab === "settings" ? (
          <DebitCashSettingsPanel
            key={`${account.id}:${account.bank}:${account.name}:${account.balance}`}
            account={account}
            onSave={(next) => updateAccount(next.id, next)}
            onDelete={() => setDeleteOpen(true)}
          />
        ) : null}
      </main>

      <SimpleDeleteDialog
        open={deleteOpen}
        title={t("debit.deleteDialog.title")}
        description={t("debit.deleteDialog.description", { name: account.name })}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          deleteAccount(account.id);
          router.replace("/");
        }}
      />
    </div>
  );
}

export function DebitCashSettingsView({ accountId }: { accountId: string }) {
  const { t } = useLocale();
  const mounted = useClientMounted();
  const { getAccount } = useDebitCashAccounts();
  const account = mounted ? getAccount(accountId) : null;

  if (!mounted) {
    return (
      <div className={APP_PAGE_CLASS}>
        <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
          <div className="h-5 w-14 animate-pulse rounded bg-zinc-200/80" />
          <div className="h-28 animate-pulse rounded-3xl bg-zinc-200/60" />
          <div className="h-10 animate-pulse rounded-full bg-zinc-200/60" />
        </main>
      </div>
    );
  }

  if (!account) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          {t("common.goHome")}
        </Link>
        <p className="text-sm text-zinc-600">{t("debit.notFound")}</p>
      </div>
    );
  }

  return <DebitCashDetailContent account={account} />;
}
