import { AutoVehiclesShelf } from "@/app/components/auto-vehicles-shelf";
import { CreditCardsShelf } from "@/app/components/credit-cards-shelf";
import { HomeDashboardSummary } from "@/app/components/home-dashboard-summary";
import { formatMoneyExact } from "@/lib/format-money";
import {
  DASHBOARD_DEBIT_CASH,
  DASHBOARD_HOUSING_BILLS,
} from "@/lib/dashboard/seed";

const dashboard = {
  debitCash: DASHBOARD_DEBIT_CASH,
  housingBills: DASHBOARD_HOUSING_BILLS,
};

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
          Добавить
        </button>
      </div>
      {children}
    </section>
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
        <p className="mt-1 text-xs text-zinc-500">Срок {dueDate}</p>
      ) : null}
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
  const { debitCash, housingBills } = dashboard;

  return (
    <div className="min-h-full bg-zinc-50 text-zinc-900">
      <main className="mx-auto flex w-full max-w-md flex-col gap-8 px-4 py-6">
        <HomeDashboardSummary />

        <CreditCardsShelf />

        <Shelf title="Дебет / наличные" onAddLabel="Добавить счёт или кошелёк">
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1">
            {debitCash.map((account) => (
              <AccountCard key={account.id} {...account} />
            ))}
          </div>
        </Shelf>

        <AutoVehiclesShelf />

        <Shelf title="Жильё и счета" onAddLabel="Добавить счёт">
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
