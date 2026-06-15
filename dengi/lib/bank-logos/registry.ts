export type BankId =
  | "chase"
  | "americanexpress"
  | "bankofamerica"
  | "wellsfargo"
  | "citibank";

export type BankMeta = {
  id: BankId;
  name: string;
  /** Градиент Tailwind для мини-карты */
  cardClass: string;
  /** Путь к SVG в public/ (если есть) */
  logoPath?: string;
  /** Источник логотипа */
  source: "simple-icons" | "custom";
};

export const BANKS: Record<BankId, BankMeta> = {
  chase: {
    id: "chase",
    name: "Chase",
    cardClass: "from-[#117ACA] to-[#0a4f86]",
    logoPath: "/logos/banks/chase.svg",
    source: "simple-icons",
  },
  americanexpress: {
    id: "americanexpress",
    name: "American Express",
    cardClass: "from-[#2E77BC] to-[#1b4f82]",
    logoPath: "/logos/banks/americanexpress.svg",
    source: "simple-icons",
  },
  bankofamerica: {
    id: "bankofamerica",
    name: "Bank of America",
    cardClass: "from-[#012169] to-[#001040]",
    logoPath: "/logos/banks/bankofamerica.svg",
    source: "simple-icons",
  },
  wellsfargo: {
    id: "wellsfargo",
    name: "Wells Fargo",
    cardClass: "from-[#D71E28] to-[#9a1219]",
    logoPath: "/logos/banks/wellsfargo.svg",
    source: "simple-icons",
  },
  citibank: {
    id: "citibank",
    name: "Citi",
    cardClass: "from-[#022E72] to-[#001a45]",
    logoPath: "/logos/banks/citibank.svg",
    source: "custom",
  },
};

export const POPULAR_BANK_IDS: BankId[] = [
  "chase",
  "americanexpress",
  "bankofamerica",
  "wellsfargo",
  "citibank",
];
