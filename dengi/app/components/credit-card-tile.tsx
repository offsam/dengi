import { BankLogo, BANKS, getCreditCardBankName } from "@/lib/bank-logos";
import { formatMoney, formatMoneyExact } from "@/lib/format-money";
import type { ContractTerm } from "@/lib/credit-cards/parse-contract-terms";
import type { CreditCard } from "@/lib/credit-cards/types";

export type CreditCardTileVariant = "compact" | "detail";

type TileSize = {
  article: string;
  padding: string;
  logoChase: string;
  logoDefault: string;
  name: string;
  limit: string;
  apr: string;
  balance: string;
  small: string;
  prevLabel: string;
  termLabel: string;
  termHeader: string;
  gap: string;
  termsBox: string;
  termsMaxHeight: string;
};

const TILE_SIZES: Record<CreditCardTileVariant, TileSize> = {
  compact: {
    article: "relative w-[178px] shrink-0 overflow-hidden rounded-lg shadow-md",
    padding: "px-[11px] pb-[11px] pt-[5.5px]",
    logoChase: "h-[16px] max-w-[56px]",
    logoDefault: "h-[14px] max-w-[48px]",
    name: "line-clamp-2 max-w-[64px] text-[11.3px] font-semibold leading-[1.15]",
    limit: "text-[15.7px] font-bold tabular-nums",
    apr: "mt-0.5 text-[11.1px] tabular-nums text-white/80",
    balance: "text-[19.4px] font-bold tabular-nums tracking-tight",
    small: "mt-0.5 text-[11.1px] tabular-nums",
    prevLabel: "text-[9.7px] font-medium uppercase tracking-wide text-white/45",
    termLabel: "min-w-0 truncate text-[7.8px] text-white/55",
    termHeader: "mb-0.5 text-[7px] font-medium uppercase tracking-wide text-white/40",
    gap: "gap-[7px]",
    termsBox: "my-1.5 min-h-0 flex-1 rounded-md bg-black/15 px-1.5 py-1",
    termsMaxHeight: "max-h-[260px]",
  },
  detail: {
    article: "relative w-full overflow-hidden rounded-2xl shadow-lg",
    padding: "px-5 pb-5 pt-4",
    logoChase: "h-[32px] max-w-[112px]",
    logoDefault: "h-[28px] max-w-[96px]",
    name: "line-clamp-2 text-[22px] font-semibold leading-[1.15]",
    limit: "text-[31px] font-bold tabular-nums",
    apr: "mt-1 text-[22px] tabular-nums text-white/80",
    balance: "text-[39px] font-bold tabular-nums tracking-tight",
    small: "mt-1 text-[22px] tabular-nums",
    prevLabel: "text-[19px] font-medium uppercase tracking-wide text-white/45",
    termLabel: "min-w-0 text-[15px] text-white/55",
    termHeader: "mb-1 text-[13px] font-medium uppercase tracking-wide text-white/40",
    gap: "gap-4",
    termsBox: "my-3 rounded-xl bg-black/15 px-3 py-2.5",
    termsMaxHeight: "",
  },
};

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

function termValueClass(category: ContractTerm["category"]) {
  if (category === "rate") {
    return "text-white/95";
  }

  if (category === "fee" || category === "penalty") {
    return "text-rose-300";
  }

  if (category === "payment") {
    return "text-emerald-300";
  }

  return "text-white/80";
}

function ContractTermsList({
  terms,
  variant,
}: {
  terms: ContractTerm[];
  variant: CreditCardTileVariant;
}) {
  const size = TILE_SIZES[variant];
  const valueClass =
    variant === "detail"
      ? "shrink-0 text-[15px] font-semibold tabular-nums"
      : "shrink-0 text-[7.8px] font-semibold tabular-nums";

  return (
    <ul
      className={
        variant === "detail"
          ? "grid grid-cols-1 gap-2"
          : "min-h-0 flex-1 space-y-0.5 overflow-y-auto pr-0.5 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      }
    >
      {terms.map((term) => (
        <li
          key={term.id}
          className={
            variant === "detail"
              ? "flex items-baseline justify-between gap-3 leading-tight"
              : "flex items-baseline justify-between gap-1 leading-tight"
          }
        >
          <span className={size.termLabel}>{term.label}</span>
          <span className={`${valueClass} ${termValueClass(term.category)}`}>
            {term.value}
          </span>
        </li>
      ))}
    </ul>
  );
}

export function CreditCardTile({
  bankId,
  name,
  cardClass,
  balance,
  limit,
  apr,
  dueDate,
  daysUntilDue,
  minPayment,
  previousBalance,
  contract,
  customBankName,
  variant = "compact",
}: CreditCard & { variant?: CreditCardTileVariant }) {
  const delta = balance - previousBalance;
  const increased = delta > 0;
  const interestByDue = estimateInterestByDue(balance, apr, daysUntilDue);
  const skin = cardClass ?? BANKS[bankId].cardClass;
  const bankDisplayName = getCreditCardBankName({ bankId, customBankName });
  const terms = contract?.terms ?? [];
  const hasTerms = terms.length > 0;
  const size = TILE_SIZES[variant];

  const aspectClass =
    variant === "detail"
      ? hasTerms
        ? ""
        : "aspect-[1.586/1]"
      : hasTerms
        ? `flex min-h-[112px] flex-col ${size.termsMaxHeight}`
        : "aspect-[1.586/1]";

  return (
    <article
      className={`bg-gradient-to-br ${size.article} ${size.padding} ${skin} ${aspectClass}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.18),transparent_42%)]" />

      <div
        className={`relative flex min-h-0 flex-col ${hasTerms && variant === "compact" ? "h-full flex-1" : "h-full"}`}
      >
        <div className="flex shrink-0 items-start justify-between gap-2">
          <div className="flex min-w-0 flex-1 items-center gap-2 pr-1">
            <BankLogo
              bankId={bankId}
              displayName={bankDisplayName}
              tone="white"
              className={`w-auto shrink-0 ${
                bankId === "chase" ? size.logoChase : size.logoDefault
              }`}
            />
            <p className={`text-white ${size.name}`}>{name}</p>
          </div>
          <div className="shrink-0 text-right leading-none">
            <p className={`text-white ${size.limit}`}>{formatMoney(limit)}</p>
            <p className={size.apr}>{formatPercent(apr)} годовых</p>
          </div>
        </div>

        {hasTerms ? (
          <div className={size.termsBox}>
            <p className={size.termHeader}>Условия договора</p>
            <ContractTermsList terms={terms} variant={variant} />
          </div>
        ) : null}

        <div
          className={`flex shrink-0 items-end justify-between ${size.gap} ${hasTerms && variant === "compact" ? "" : "mt-auto"}`}
        >
          <div className="min-w-0 leading-tight">
            <p className={`text-white ${size.balance}`}>
              {formatMoneyExact(balance)}
            </p>
            <p className={`truncate font-bold text-rose-400 ${size.small}`}>
              {formatMoneyExact(interestByDue)} проц.
            </p>
            <p className={`font-medium text-white/90 ${size.small}`}>
              Мин. {formatMoneyExact(minPayment)}{" "}
              <span className="font-normal text-white/75">{dueDate}</span>
            </p>
          </div>

          <div className="shrink-0 text-right leading-tight">
            <p className={size.prevLabel}>Пред.</p>
            <p className={`mt-0.5 font-medium text-white/90 ${size.small}`}>
              {formatMoneyExact(previousBalance)}
            </p>
            {delta !== 0 ? (
              <p
                className={`font-semibold tabular-nums ${size.small} ${
                  increased ? "text-rose-400" : "text-green-500"
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
