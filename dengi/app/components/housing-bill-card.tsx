import { formatCompactCardName } from "@/lib/credit-cards/compact-name";
import { BubbleCard } from "@/app/components/bubble-card";
import { UsdAmount } from "@/app/components/usd-amount";
import { formatMoneyExact } from "@/lib/format-money";
import type { HousingBill } from "@/lib/dashboard/housing-bills";

export function HousingBillCard({
  name,
  date,
  amount,
  variant = "compact",
  density = "full",
}: Pick<HousingBill, "name" | "date" | "amount"> & {
  variant?: "compact" | "detail";
  density?: "full" | "minimal";
}) {
  const isDetail = variant === "detail";

  if (density === "minimal" && !isDetail) {
    const label = formatCompactCardName(name);

    return (
      <BubbleCard className="w-[115px] shrink-0 p-2.5">
        <p
          className="truncate text-center text-[10.5px] font-semibold leading-tight text-zinc-900"
          title={name}
        >
          {label}
        </p>
      </BubbleCard>
    );
  }

  return (
    <BubbleCard className={isDetail ? "w-full p-4" : "w-44 shrink-0 p-3"}>
      <div className="min-w-0">
        <p className={`truncate font-semibold text-zinc-900 ${isDetail ? "text-lg" : "text-sm"}`}>
          {name}
        </p>
        <p className={`text-zinc-500 ${isDetail ? "mt-1 text-sm" : "mt-1 text-xs"}`}>
          Срок {date}
        </p>
      </div>
      <p
        className={`font-semibold tabular-nums text-zinc-900 ${
          isDetail ? "mt-5 text-3xl" : "mt-4 text-lg"
        }`}
      >
        {formatMoneyExact(amount)}
      </p>
    </BubbleCard>
  );
}

/** Черновой обзор счёта жилья */
export function HousingBillOverviewPanel({ bill }: { bill: HousingBill }) {
  return (
    <div className="space-y-3">
      <BubbleCard className="space-y-3 p-4">
        <h2 className="text-sm font-semibold text-zinc-900">Ближайший платёж</h2>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-zinc-500">Сумма</span>
          <UsdAmount amount={bill.amount} exact className="text-lg font-semibold text-zinc-900" />
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-zinc-500">Дата</span>
          <span className="text-sm font-semibold text-zinc-900">{bill.date}</span>
        </div>
        <p className="text-xs leading-relaxed text-zinc-500">
          Черновик: напоминания и автоплатёж появятся позже.
        </p>
      </BubbleCard>

      <BubbleCard className="space-y-2 p-4">
        <h2 className="text-sm font-semibold text-zinc-900">За год</h2>
        <div className="flex items-baseline justify-between gap-3">
          <span className="text-sm text-zinc-500">Примерно</span>
          <UsdAmount amount={bill.amount * 12} exact className="text-sm font-semibold text-zinc-900" />
        </div>
      </BubbleCard>
    </div>
  );
}

/** Черновая история платежей */
export function HousingBillHistoryPanel({ bill }: { bill: HousingBill }) {
  const placeholder = [
    { date: "1 июн", amount: bill.amount, status: "Оплачено" },
    { date: "1 май", amount: bill.amount, status: "Оплачено" },
    { date: "1 апр", amount: bill.amount - 12, status: "Оплачено" },
  ];

  return (
    <BubbleCard className="divide-y divide-zinc-100/80 p-1">
      <p className="px-3 py-2 text-xs text-zinc-500">Черновая история для {bill.name}</p>
      {placeholder.map((entry) => (
        <div key={entry.date} className="flex items-center justify-between gap-3 px-3 py-3">
          <div>
            <p className="text-sm font-medium text-zinc-900">{entry.date}</p>
            <p className="text-xs text-emerald-600">{entry.status}</p>
          </div>
          <UsdAmount amount={entry.amount} exact className="text-sm font-semibold text-zinc-900" />
        </div>
      ))}
    </BubbleCard>
  );
}
