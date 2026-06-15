import { BankLogo, BANKS, type BankId } from "@/lib/bank-logos";

const dashboard = {
  netWorth: 124_500,
  metrics: {
    totalDebt: 48_200,
    interestThisMonth: 312,
    assets: 172_700,
    billsDueSoon: 1_840,
  },
  creditCards: [
    {
      id: "cc-1",
      bankId: "chase" as BankId,
      name: "Sapphire Preferred",
      cardClass: "from-[#1a2f4f] via-[#0f4c8a] to-[#061525]",
      balance: 4_200,
      limit: 10_000,
      apr: 24.99,
      dueDate: "Jun 22",
      daysUntilDue: 7,
      previousBalance: 3_800,
    },
    {
      id: "cc-2",
      bankId: "americanexpress" as BankId,
      name: "Blue Cash",
      cardClass: "from-[#0077c8] via-[#006fcf] to-[#004f99]",
      balance: 890,
      limit: 5_000,
      apr: 19.24,
      dueDate: "Jun 18",
      daysUntilDue: 3,
      previousBalance: 1_120,
    },
    {
      id: "cc-3",
      bankId: "citibank" as BankId,
      name: "Double Cash",
      cardClass: "from-[#8b1010] via-[#d32011] to-[#5a0a0a]",
      balance: 1_650,
      limit: 8_000,
      apr: 22.49,
      dueDate: "Jun 28",
      daysUntilDue: 13,
      previousBalance: 1_410,
    },
  ],
  debitCash: [
    {
      id: "dc-1",
      bank: "Chase",
      bankColor: "bg-blue-600",
      name: "Total Checking",
      balance: 8_420,
    },
    {
      id: "dc-2",
      bank: "Ally",
      bankColor: "bg-purple-600",
      name: "Savings",
      balance: 22_100,
    },
    {
      id: "dc-3",
      bank: "Cash",
      bankColor: "bg-emerald-600",
      name: "Wallet",
      balance: 340,
    },
  ],
  autoLoans: [
    {
      id: "al-1",
      vehicle: "2022 Toyota RAV4",
      remaining: 18_400,
      monthly: 412,
    },
    {
      id: "al-2",
      vehicle: "2019 Honda Civic",
      remaining: 6_250,
      monthly: 285,
    },
  ],
  housingBills: [
    { id: "hb-1", name: "Mortgage", date: "Jul 1", amount: 2_150 },
    { id: "hb-2", name: "Electric", date: "Jun 20", amount: 142 },
    { id: "hb-3", name: "Internet", date: "Jun 24", amount: 79 },
    { id: "hb-4", name: "Water", date: "Jun 26", amount: 58 },
    { id: "hb-5", name: "HOA", date: "Jul 5", amount: 210 },
  ],
};

function formatMoney(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatMoneyExact(amount: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}

function AccountBadge({
  bank,
  bankColor,
}: {
  bank: string;
  bankColor: string;
}) {
  return (
    <div
      className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-white ${bankColor}`}
      aria-hidden
    >
      {bank.slice(0, 1)}
    </div>
  );
}

function MetricCard({
  label,
  value,
  tone = "neutral",
}: {
  label: string;
  value: string;
  tone?: "neutral" | "danger" | "positive";
}) {
  const valueTone =
    tone === "danger"
      ? "text-rose-600"
      : tone === "positive"
        ? "text-emerald-600"
        : "text-zinc-900";

  return (
    <div className="rounded-2xl border border-zinc-200/80 bg-white px-3 py-3 shadow-sm">
      <p className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
        {label}
      </p>
      <p className={`mt-1 text-lg font-semibold tabular-nums ${valueTone}`}>
        {value}
      </p>
    </div>
  );
}

function Shelf({
  title,
  onAddLabel,
  children,
}: {
  title: string;
  onAddLabel: string;
  children: React.ReactNode;
}) {
  return (
    <section className="space-y-3">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-sm font-semibold tracking-tight text-zinc-900">
          {title}
        </h2>
        <button
          type="button"
          className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-xs font-medium text-zinc-600 transition-colors hover:border-zinc-300 hover:text-zinc-900"
          aria-label={onAddLabel}
        >
          Add
        </button>
      </div>
      {children}
    </section>
  );
}

function formatPercent(value: number) {
  return `${value.toFixed(2)}%`;
}

function estimateInterestByDue(
  balance: number,
  apr: number,
  daysUntilDue: number
) {
  const dailyRate = apr / 100 / 365;
  return balance * dailyRate * daysUntilDue;
}

function CreditCardTile({
  bankId,
  name,
  cardClass,
  balance,
  limit,
  apr,
  dueDate,
  daysUntilDue,
  previousBalance,
}: {
  bankId: BankId;
  name: string;
  cardClass?: string;
  balance: number;
  limit: number;
  apr: number;
  dueDate: string;
  daysUntilDue: number;
  previousBalance: number;
}) {
  const delta = balance - previousBalance;
  const increased = delta > 0;
  const interestByDue = estimateInterestByDue(balance, apr, daysUntilDue);
  const skin = cardClass ?? BANKS[bankId].cardClass;

  return (
    <article
      className={`relative aspect-[1.586/1] w-[147px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br p-[9px] shadow-md ${skin}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.18),transparent_42%)]" />

      <div className="relative flex h-full flex-col justify-between gap-0.5">
        <div className="flex items-start justify-between gap-1">
          <div className="flex min-w-0 items-center gap-1">
            <BankLogo
              bankId={bankId}
              tone="white"
              className="h-[10.5px] w-auto max-w-[36px] shrink-0"
            />
            <p className="truncate text-[10.5px] font-semibold leading-tight text-white">
              {name}
            </p>
          </div>
          <div className="shrink-0 text-right leading-none">
            <p className="text-[8.4px] tabular-nums text-white/50">
              Limit {formatMoney(limit)}
            </p>
            <p className="mt-0.5 text-[8.4px] tabular-nums text-white/80">
              {formatPercent(apr)} APR
            </p>
          </div>
        </div>

        <div className="flex items-end justify-between gap-1.5">
          <div className="min-w-0 leading-tight">
            <p className="text-[14.7px] font-bold tabular-nums tracking-tight text-white">
              {formatMoneyExact(balance)}
            </p>
            <p className="mt-0.5 truncate text-[8.4px] tabular-nums text-rose-100">
              {formatMoneyExact(interestByDue)} int.
            </p>
            <p className="text-[8.4px] font-medium text-white/75">
              Due {dueDate}
            </p>
          </div>

          <div className="shrink-0 text-right leading-tight">
            <p className="text-[7.4px] font-medium uppercase tracking-wide text-white/45">
              Prev
            </p>
            <p className="mt-0.5 text-[8.4px] font-medium tabular-nums text-white/90">
              {formatMoneyExact(previousBalance)}
            </p>
            {delta !== 0 ? (
              <p
                className={`mt-0.5 text-[8.4px] font-semibold tabular-nums ${
                  increased ? "text-rose-100" : "text-emerald-100"
                }`}
              >
                {increased ? "+" : "−"}
                {formatMoneyExact(Math.abs(delta))}
              </p>
            ) : null}
          </div>
        </div>
      </div>
    </article>
  );
}

function AccountCard({
  bank,
  bankColor,
  name,
  balance,
  dueDate,
}: {
  bank: string;
  bankColor: string;
  name: string;
  balance: number;
  dueDate?: string;
}) {
  return (
    <article className="w-44 shrink-0 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm">
      <div className="flex items-start gap-2.5">
        <AccountBadge bank={bank} bankColor={bankColor} />
        <div className="min-w-0">
          <p className="truncate text-xs font-medium text-zinc-500">{bank}</p>
          <p className="truncate text-sm font-semibold text-zinc-900">{name}</p>
        </div>
      </div>
      <p className="mt-4 text-lg font-semibold tabular-nums text-zinc-900">
        {formatMoneyExact(balance)}
      </p>
      {dueDate ? (
        <p className="mt-1 text-xs text-zinc-500">Due {dueDate}</p>
      ) : null}
    </article>
  );
}

function AutoLoanCard({
  vehicle,
  remaining,
  monthly,
}: {
  vehicle: string;
  remaining: number;
  monthly: number;
}) {
  return (
    <article className="w-52 shrink-0 rounded-2xl border border-zinc-200/80 bg-white p-3 shadow-sm">
      <p className="truncate text-sm font-semibold text-zinc-900">{vehicle}</p>
      <div className="mt-4 space-y-1">
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-zinc-500">Remaining</span>
          <span className="text-sm font-semibold tabular-nums text-zinc-900">
            {formatMoneyExact(remaining)}
          </span>
        </div>
        <div className="flex items-baseline justify-between gap-2">
          <span className="text-xs text-zinc-500">Monthly</span>
          <span className="text-sm font-medium tabular-nums text-zinc-700">
            {formatMoneyExact(monthly)}
          </span>
        </div>
      </div>
    </article>
  );
}

function BillRow({
  name,
  date,
  amount,
}: {
  name: string;
  date: string;
  amount: number;
}) {
  return (
    <div className="flex items-center justify-between gap-3 border-b border-zinc-100 py-3 last:border-b-0">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-zinc-900">{name}</p>
        <p className="text-xs text-zinc-500">{date}</p>
      </div>
      <p className="shrink-0 text-sm font-semibold tabular-nums text-zinc-900">
        {formatMoneyExact(amount)}
      </p>
    </div>
  );
}

export default function Home() {
  const { netWorth, metrics, creditCards, debitCash, autoLoans, housingBills } =
    dashboard;

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-3xl flex-col gap-8 px-4 py-6 sm:px-6">
        <header className="flex items-end justify-between gap-4">
          <h1 className="text-2xl font-semibold tracking-tight">dengi</h1>
          <div className="text-right">
            <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">
              Net worth
            </p>
            <p className="text-2xl font-semibold tabular-nums text-zinc-900">
              {formatMoney(netWorth)}
            </p>
          </div>
        </header>

        <section
          aria-label="Summary metrics"
          className="grid grid-cols-2 gap-3 sm:grid-cols-4"
        >
          <MetricCard
            label="Total debt"
            value={formatMoney(metrics.totalDebt)}
            tone="danger"
          />
          <MetricCard
            label="Interest this month"
            value={formatMoneyExact(metrics.interestThisMonth)}
            tone="danger"
          />
          <MetricCard
            label="Assets"
            value={formatMoney(metrics.assets)}
            tone="positive"
          />
          <MetricCard
            label="Bills due soon"
            value={formatMoneyExact(metrics.billsDueSoon)}
          />
        </section>

        <Shelf title="Credit cards" onAddLabel="Add credit card">
          <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {creditCards.map((card) => (
              <CreditCardTile key={card.id} {...card} />
            ))}
          </div>
        </Shelf>

        <Shelf title="Debit / cash" onAddLabel="Add debit or cash account">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {debitCash.map((account) => (
              <AccountCard key={account.id} {...account} />
            ))}
          </div>
        </Shelf>

        <Shelf title="Auto loans" onAddLabel="Add auto loan">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0">
            {autoLoans.map((loan) => (
              <AutoLoanCard key={loan.id} {...loan} />
            ))}
          </div>
        </Shelf>

        <Shelf title="Housing & bills" onAddLabel="Add bill">
          <div className="rounded-2xl border border-zinc-200/80 bg-white px-4 shadow-sm">
            {housingBills.map((bill) => (
              <BillRow key={bill.id} {...bill} />
            ))}
          </div>
        </Shelf>
      </main>
    </div>
  );
}
