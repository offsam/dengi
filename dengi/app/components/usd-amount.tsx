"use client";

import { formatUsdAmount } from "@/lib/format-money";
import { useLocale } from "@/app/components/locale-provider";
import { toAutoVehicleNumber } from "@/lib/auto-vehicles/form-utils";

type UsdAmountTone = "neutral" | "danger" | "positive";

const toneClassName: Record<UsdAmountTone, string> = {
  neutral: "text-zinc-900",
  danger: "text-rose-600",
  positive: "text-emerald-600",
};

type UsdAmountProps = {
  amount: number;
  exact?: boolean;
  tone?: UsdAmountTone;
  className?: string;
  style?: React.CSSProperties;
};

/** Сумма в USD: $ и цифры — один неразрывный блок */
export function UsdAmount({
  amount,
  exact = false,
  tone = "neutral",
  className = "",
  style,
}: UsdAmountProps) {
  const toneClass = className || style ? "" : toneClassName[tone];

  return (
    <span
      style={style}
      className={`inline tabular-nums whitespace-nowrap ${toneClass} ${className}`.trim()}
    >
      {formatUsdAmount(amount, exact)}
    </span>
  );
}

const inputClassName =
  "m-0 min-w-0 border-0 bg-transparent p-0 text-right text-[15px] leading-none text-inherit outline-none ring-0 placeholder:text-zinc-300 focus:ring-0 tabular-nums [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none";

type UsdAmountInputProps = {
  value: number;
  min?: number;
  step?: number;
  onChange: (value: number) => void;
  parse?: (raw: string, fallback: number) => number;
  /** Ширина поля цифр (без $) */
  digitsClassName?: string;
  className?: string;
  disabled?: boolean;
};

/** Ввод суммы: $ и цифры — одна группа, $ всегда первым */
function UsdAmountInput({
  value,
  min = 0,
  step = 1,
  onChange,
  parse = toAutoVehicleNumber,
  digitsClassName = "w-[7.5rem]",
  className = "",
  disabled = false,
}: UsdAmountInputProps) {
  return (
    <span
      className={`inline-flex items-center tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900 ${className}`.trim()}
    >
      <span className="shrink-0 select-none" aria-hidden>
        $
      </span>
      <input
        type="number"
        className={`${inputClassName} ${digitsClassName}`}
        value={Number.isFinite(value) ? value : ""}
        min={min}
        step={step}
        inputMode="decimal"
        disabled={disabled}
        onChange={(event) => onChange(parse(event.target.value, value))}
      />
    </span>
  );
}

UsdAmount.Input = UsdAmountInput;

export { UsdAmountInput };

/** Значение строки настроек — прижато к правому краю */
export function FormRowEnd({ children }: { children: React.ReactNode }) {
  return <div className="flex w-full min-w-0 justify-end">{children}</div>;
}

const suffixClassName = "shrink-0 select-none text-[15px] leading-none text-zinc-400 tabular-nums";

type PercentAmountInputProps = {
  value: string;
  min?: number;
  max?: number;
  step?: number;
  onChange: (value: number) => void;
  parse: (raw: string, fallback: number) => number;
  fallback: number;
};

/** Процент — число и % одной группой справа */
export function PercentAmountInput({
  value,
  min = 0,
  max = 100,
  step = 0.1,
  onChange,
  parse,
  fallback,
}: PercentAmountInputProps) {
  return (
    <span className="inline-flex items-center tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900">
      <input
        type="number"
        className={`${inputClassName} w-[4.5rem]`}
        value={value}
        min={min}
        max={max}
        step={step}
        inputMode="decimal"
        onChange={(event) => onChange(parse(event.target.value, fallback))}
      />
      <span className={suffixClassName} aria-hidden>
        %
      </span>
    </span>
  );
}

/** Срок кредита — число и «мес» одной группой справа */
export function TermMonthsInput({
  value,
  min = 1,
  max = 120,
  onChange,
  parse,
  fallback,
}: {
  value: string;
  min?: number;
  max?: number;
  onChange: (value: number) => void;
  parse: (raw: string, fallback: number) => number;
  fallback: number;
}) {
  const { t } = useLocale();

  return (
    <span className="inline-flex items-center tabular-nums whitespace-nowrap text-[15px] leading-none text-zinc-900">
      <input
        type="number"
        className={`${inputClassName} w-[4.5rem]`}
        value={value}
        min={min}
        max={max}
        step={1}
        inputMode="numeric"
        onChange={(event) => onChange(parse(event.target.value, fallback))}
      />
      <span className={suffixClassName} aria-hidden>
        {t("common.monthsShort")}
      </span>
    </span>
  );
}

/** @deprecated Используй UsdAmount */
export function CurrencyAmountDisplay({
  value,
  exact = false,
  tone = "neutral",
}: {
  value: number;
  exact?: boolean;
  tone?: UsdAmountTone;
}) {
  return <UsdAmount amount={value} exact={exact} tone={tone} />;
}

/** @deprecated Используй UsdAmount.Input */
export const CurrencyAmountInput = UsdAmountInput;

export const formAmountInputClassName = inputClassName;
