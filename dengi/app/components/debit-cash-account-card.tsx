import { BubbleCard } from "@/app/components/bubble-card";
import { formatCompactCardName } from "@/lib/credit-cards/compact-name";
import { UsdAmount } from "@/app/components/usd-amount";
import { BankLogo } from "@/lib/bank-logos";
import { formatMoneyExact } from "@/lib/format-money";
import type { DebitCashAccount } from "@/lib/dashboard/debit-accounts";
import {
  debitKindLabel,
  resolveDebitBadgeColor,
  resolveDebitInstitutionLabel,
} from "@/lib/dashboard/debit-accounts";

function AccountBadge({
  label,
  bankColor,
  large = false,
}: {
  label: string;
  bankColor: string;
  large?: boolean;
}) {
  return (
    <div
      className={`flex shrink-0 items-center justify-center rounded-full font-semibold text-white ${bankColor} ${
        large ? "size-12 text-sm" : "size-9 text-xs"
      }`}
      aria-hidden
    >
      {label.slice(0, 1)}
    </div>
  );
}

function DebitCardHeader({
  account,
  large = false,
}: {
  account: DebitCashAccount;
  large?: boolean;
}) {
  const institution = resolveDebitInstitutionLabel(account);
  const showBankLogo =
    account.kind === "bank" && account.bankId && !account.incognito;

  if (showBankLogo) {
    return (
      <div className="flex items-start gap-2.5">
        <BankLogo
          bankId={account.bankId!}
          displayName={account.customBankName}
          tone="brand"
          className={`w-auto shrink-0 ${large ? "h-8 max-w-[72px]" : "h-6 max-w-[56px]"}`}
        />
        <div className="min-w-0">
          <p className={`truncate font-medium text-zinc-500 ${large ? "text-sm" : "text-xs"}`}>
            {institution}
          </p>
          <p className={`truncate font-semibold text-zinc-900 ${large ? "text-lg" : "text-sm"}`}>
            {account.name}
          </p>
        </div>
      </div>
    );
  }

  const badgeLabel = account.incognito ? "···" : institution;

  return (
    <div className="flex items-start gap-2.5">
      <AccountBadge
        label={badgeLabel}
        bankColor={resolveDebitBadgeColor(account)}
        large={large}
      />
      <div className="min-w-0">
        <p className={`truncate font-medium text-zinc-500 ${large ? "text-sm" : "text-xs"}`}>
          {institution}
        </p>
        <p className={`truncate font-semibold text-zinc-900 ${large ? "text-lg" : "text-sm"}`}>
          {account.kind === "cash" ? "Кошелёк" : account.name}
        </p>
      </div>
    </div>
  );
}

export type DebitCashTileDensity = "full" | "minimal";

function DebitMinimalMark({ account }: { account: DebitCashAccount }) {
  const showBankLogo =
    account.kind === "bank" && account.bankId && !account.incognito;

  if (showBankLogo) {
    return (
      <BankLogo
        bankId={account.bankId!}
        displayName={account.customBankName}
        tone="brand"
        className="h-5 max-w-[52px] w-auto"
      />
    );
  }

  const institution = resolveDebitInstitutionLabel(account);
  const badgeLabel = account.incognito ? "···" : institution.slice(0, 1);

  return (
    <AccountBadge
      label={badgeLabel}
      bankColor={resolveDebitBadgeColor(account)}
    />
  );
}

export function DebitCashAccountCard({
  account,
  variant = "compact",
  density = "full",
}: {
  account: DebitCashAccount;
  variant?: "compact" | "detail";
  density?: DebitCashTileDensity;
}) {
  const isDetail = variant === "detail";

  if (density === "minimal" && !isDetail) {
    const label =
      account.kind === "cash"
        ? "Наличные"
        : formatCompactCardName(account.name);

    return (
      <BubbleCard className="w-[115px] shrink-0 p-2">
        <div className="flex flex-col items-center gap-1.5 text-center">
          <DebitMinimalMark account={account} />
          <p className="w-full truncate text-[10.5px] font-semibold leading-tight text-zinc-900" title={label}>
            {label}
          </p>
        </div>
      </BubbleCard>
    );
  }

  return (
    <BubbleCard className={isDetail ? "w-full p-4" : "w-44 shrink-0 p-3"}>
      <DebitCardHeader account={account} large={isDetail} />
      <p
        className={`font-semibold tabular-nums text-zinc-900 ${
          isDetail ? "mt-5 text-3xl" : "mt-4 text-lg"
        }`}
      >
        {formatMoneyExact(account.balance)}
      </p>
    </BubbleCard>
  );
}

/** Черновой обзор счёта */
export function DebitCashOverviewPanel({ account }: { account: DebitCashAccount }) {
  const rows = [
    { label: "Тип", value: debitKindLabel(account) },
    {
      label: account.incognito ? "Отображение" : "Источник",
      value: resolveDebitInstitutionLabel(account),
    },
    { label: "Баланс", value: formatMoneyExact(account.balance) },
    {
      label: "Доля в активах",
      value: "≈ 18%",
      hint: "Черновик — позже посчитаем от общего капитала",
    },
  ];

  return (
    <div className="space-y-3">
      <BubbleCard className="space-y-3 p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Сводка</h2>
        {rows.map((row) => (
          <div key={row.label} className="flex items-start justify-between gap-3">
            <span className="text-sm text-zinc-500">{row.label}</span>
            <div className="text-right">
              <p className="text-sm font-semibold tabular-nums text-zinc-900">{row.value}</p>
              {"hint" in row && row.hint ? (
                <p className="mt-0.5 text-[11px] text-zinc-400">{row.hint}</p>
              ) : null}
            </div>
          </div>
        ))}
      </BubbleCard>

      <BubbleCard className="space-y-2 p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Цели</h2>
        <p className="text-sm text-zinc-600">
          Черновик: здесь появятся целевой баланс и прогресс накоплений.
        </p>
        <div className="flex items-baseline justify-between gap-2 pt-1">
          <span className="text-xs text-zinc-500">Цель</span>
          <UsdAmount amount={Math.max(account.balance * 1.5, 1000)} exact className="text-sm font-semibold text-zinc-900" />
        </div>
      </BubbleCard>
    </div>
  );
}

/** Черновой список операций */
export function DebitCashActivityPanel({ account }: { account: DebitCashAccount }) {
  const placeholder = [
    { title: "Пополнение", date: "12 июн", amount: 420 },
    { title: "Перевод на карту", date: "8 июн", amount: -150 },
    { title: "Зарплата", date: "1 июн", amount: 2_800 },
  ];

  return (
    <BubbleCard className="divide-y divide-zinc-100/80 p-1">
      <p className="px-3 py-2 text-xs text-zinc-500">
        Черновые операции для {account.name}
      </p>
      {placeholder.map((entry) => (
        <div key={entry.title} className="flex items-center justify-between gap-3 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900">{entry.title}</p>
            <p className="text-xs text-zinc-500">{entry.date}</p>
          </div>
          <p
            className={`text-sm font-semibold tabular-nums ${
              entry.amount >= 0 ? "text-emerald-600" : "text-zinc-900"
            }`}
          >
            {entry.amount >= 0 ? "+" : "−"}
            {formatMoneyExact(Math.abs(entry.amount))}
          </p>
        </div>
      ))}
    </BubbleCard>
  );
}
