import {
  siAmericanexpress,
  siBankofamerica,
  siChase,
  siWellsfargo,
} from "simple-icons";

import type { BankId } from "./registry";
import { BANKS } from "./registry";

const SIMPLE_ICONS = {
  chase: siChase,
  americanexpress: siAmericanexpress,
  bankofamerica: siBankofamerica,
  wellsfargo: siWellsfargo,
} as const;

type SimpleIconBankId = keyof typeof SIMPLE_ICONS;

type BankLogoProps = {
  bankId: BankId;
  /** Для bankId === "other" — текст на плитке */
  displayName?: string;
  /** white — на тёмном фоне мини-карты; brand — фирменный цвет */
  tone?: "white" | "brand";
  className?: string;
};

function isSimpleIconBank(bankId: BankId): bankId is SimpleIconBankId {
  return bankId in SIMPLE_ICONS;
}

export function BankLogo({
  bankId,
  displayName,
  tone = "brand",
  className = "h-4 w-auto",
}: BankLogoProps) {
  const bank = BANKS[bankId];

  if (bankId === "other") {
    const label = displayName?.trim() || "Банк";

    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-white/20 px-1.5 text-[10px] font-bold uppercase text-white ${className}`}
        aria-label={label}
      >
        {label.slice(0, 1)}
      </span>
    );
  }

  if (!isSimpleIconBank(bankId)) {
    if (bank.logoPath) {
      return (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={bank.logoPath}
          alt={bank.name}
          className={className}
        />
      );
    }

    return (
      <span
        className={`inline-flex items-center justify-center rounded-full bg-white/20 text-[10px] font-bold uppercase text-white ${className}`}
        aria-label={bank.name}
      >
        {bank.name.slice(0, 1)}
      </span>
    );
  }

  const icon = SIMPLE_ICONS[bankId];
  const fill = tone === "white" ? "#ffffff" : `#${icon.hex}`;

  return (
    <svg
      role="img"
      viewBox="0 0 24 24"
      className={className}
      aria-label={bank.name}
    >
      <path d={icon.path} fill={fill} />
    </svg>
  );
}
