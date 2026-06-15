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
  /** white — на тёмном фоне мини-карты; brand — фирменный цвет */
  tone?: "white" | "brand";
  className?: string;
};

function isSimpleIconBank(bankId: BankId): bankId is SimpleIconBankId {
  return bankId in SIMPLE_ICONS;
}

export function BankLogo({
  bankId,
  tone = "brand",
  className = "h-4 w-auto",
}: BankLogoProps) {
  const bank = BANKS[bankId];

  if (!isSimpleIconBank(bankId)) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={bank.logoPath}
        alt={bank.name}
        className={className}
      />
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
