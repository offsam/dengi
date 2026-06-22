"use client";

import { BankLogo, BANKS, getCreditCardBankName } from "@/lib/bank-logos";
import { useLocale } from "@/app/components/locale-provider";
import { formatMoney, formatMoneyExact } from "@/lib/format-money";
import type { ContractTerm } from "@/lib/credit-cards/parse-contract-terms";
import {
  formatCreditCardDueLabel,
  resolveDaysUntilDueFromDay,
  resolvePaymentDueDay,
} from "@/lib/credit-cards/payment-due-date";
import { calculateMinimumPayment } from "@/lib/credit-cards/min-payment";
import { formatCompactCardName } from "@/lib/credit-cards/compact-name";
import { localizeContractTerm } from "@/lib/credit-cards/localize-contract-term";
import type { CreditCard } from "@/lib/credit-cards/types";

export type CreditCardTileVariant = "compact" | "detail";
/** На главном экране: full — все данные, minimal — только логотип на карте */
export type CreditCardTileDensity = "full" | "minimal";

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
  cycleDeltaAmount: string;
  cycleDeltaArrow: string;
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
    apr: "mt-0.5 text-[12.5px] font-medium tabular-nums text-white/90",
    balance: "text-[19.4px] font-bold tabular-nums tracking-tight",
    small: "mt-0.5 text-[11.1px] tabular-nums",
    cycleDeltaAmount: "text-[11.1px] font-semibold tabular-nums leading-none",
    cycleDeltaArrow: "size-3.5",
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
    cycleDeltaAmount: "text-[18px] font-semibold tabular-nums leading-none",
    cycleDeltaArrow: "size-5",
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

function StatementCycleArrow({
  direction,
  className,
}: {
  direction: "up" | "down";
  className?: string;
}) {
  return (
    <svg
      viewBox="0 0 12 12"
      aria-hidden
      className={className}
      fill="currentColor"
    >
      {direction === "up" ? (
        <path d="M6 2.5 10.5 8H1.5L6 2.5Z" />
      ) : (
        <path d="M6 9.5 1.5 4h9L6 9.5Z" />
      )}
    </svg>
  );
}

/** Изменение долга к прошлому циклу: вверх + сумма сверху — лучше, вниз + сумма снизу — хуже */
function StatementCycleDelta({
  delta,
  size,
}: {
  delta: number;
  size: TileSize;
}) {
  const { t } = useLocale();

  if (delta === 0) {
    return null;
  }

  const improved = delta < 0;
  const amountClass = `${size.cycleDeltaAmount} ${
    improved ? "text-green-500" : "text-rose-400"
  }`;
  const arrowClass = `${size.cycleDeltaArrow} ${
    improved ? "text-green-500" : "text-rose-400"
  }`;

  return (
    <div
      className="flex flex-col items-end gap-0.5 leading-none"
      aria-label={
        improved
          ? t("credit.tile.debtDecreased", { amount: formatMoneyExact(Math.abs(delta)) })
          : t("credit.tile.debtIncreased", { amount: formatMoneyExact(Math.abs(delta)) })
      }
    >
      {improved ? (
        <>
          <p className={amountClass}>{formatMoneyExact(Math.abs(delta))}</p>
          <StatementCycleArrow direction="up" className={arrowClass} />
        </>
      ) : (
        <>
          <StatementCycleArrow direction="down" className={arrowClass} />
          <p className={amountClass}>{formatMoneyExact(Math.abs(delta))}</p>
        </>
      )}
    </div>
  );
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
  const { lang } = useLocale();
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
      {terms.map((term) => {
        const display = localizeContractTerm(term, lang);

        return (
        <li
          key={term.id}
          className={
            variant === "detail"
              ? "flex items-baseline justify-between gap-3 leading-tight"
              : "flex items-baseline justify-between gap-1 leading-tight"
          }
        >
          <span className={size.termLabel}>{display.label}</span>
          <span className={`${valueClass} ${termValueClass(term.category)}`}>
            {display.value}
          </span>
        </li>
        );
      })}
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
  paymentDueDay,
  previousBalance,
  contract,
  customBankName,
  variant = "compact",
  density = "full",
}: CreditCard & {
  variant?: CreditCardTileVariant;
  density?: CreditCardTileDensity;
}) {
  const { lang, t } = useLocale();
  const dueDay = resolvePaymentDueDay({ paymentDueDay, dueDate });
  const displayDueDate = dueDay > 0 ? formatCreditCardDueLabel(dueDay, lang) : dueDate;
  const displayDaysUntilDue =
    dueDay > 0 ? resolveDaysUntilDueFromDay(dueDay) : daysUntilDue;
  const delta = balance - previousBalance;
  const interestByDue = estimateInterestByDue(balance, apr, displayDaysUntilDue);
  const skin = cardClass ?? BANKS[bankId].cardClass;
  const bankDisplayName = getCreditCardBankName({ bankId, customBankName });
  const terms = contract?.terms ?? [];
  const hasTerms = terms.length > 0 && variant === "detail";
  const size = TILE_SIZES[variant];
  const displayMinPayment = calculateMinimumPayment({ balance, apr, contract });

  if (variant === "compact" && density === "minimal") {
    const compactName = formatCompactCardName(name, lang);

    return (
      <article
        className={`relative aspect-[2/1] w-[115px] shrink-0 overflow-hidden rounded-lg bg-gradient-to-br shadow-md ${skin}`}
      >
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.18),transparent_42%)]" />
        <div className="relative flex h-full flex-col items-center justify-center gap-1 px-2 text-center">
          <BankLogo
            bankId={bankId}
            displayName={bankDisplayName}
            tone="white"
            className={`w-auto ${
              bankId === "chase" ? "h-[14px] max-w-[44px]" : "h-[12px] max-w-[36px]"
            }`}
          />
          <p
            className="w-full truncate text-[10.5px] font-semibold leading-tight text-white"
            title={name}
          >
            {compactName}
          </p>
        </div>
      </article>
    );
  }

  const aspectClass =
    variant === "detail"
      ? hasTerms
        ? ""
        : "aspect-[1.586/1]"
      : "aspect-[1.586/1]";

  return (
    <article
      className={`bg-gradient-to-br ${size.article} ${size.padding} ${skin} ${aspectClass}`}
    >
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_12%_0%,rgba(255,255,255,0.18),transparent_42%)]" />

      <div className="relative flex h-full flex-col">
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
            <p className={size.apr}>{formatPercent(apr)}</p>
          </div>
        </div>

        {hasTerms ? (
          <div className={size.termsBox}>
            <p className={size.termHeader}>{t("credit.tile.contractTerms")}</p>
            <ContractTermsList terms={terms} variant={variant} />
          </div>
        ) : null}

        <div className={`mt-auto flex shrink-0 items-end justify-between ${size.gap}`}>
          <div className="min-w-0 leading-tight">
            <p className={`text-white ${size.balance}`}>
              {formatMoneyExact(balance)}
            </p>
            {variant === "detail" ? (
              <p className={`truncate font-bold text-rose-400 ${size.small}`}>
                {formatMoneyExact(interestByDue)} {t("credit.tile.interestUnit")}
              </p>
            ) : null}
            <p className={`font-medium text-white/90 ${size.small}`}>
              {t("credit.tile.minPrefix", { amount: formatMoneyExact(displayMinPayment) })}{" "}
              <span className="font-normal text-white/75">{displayDueDate}</span>
            </p>
          </div>

          <StatementCycleDelta delta={delta} size={size} />
        </div>
      </div>
    </article>
  );
}
