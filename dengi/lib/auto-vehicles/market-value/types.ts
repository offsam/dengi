export type MarketValueSource = "local" | "vinaudit";

export type MarketValueEstimate = {
  retail: number;
  low: number;
  high: number;
  source: MarketValueSource;
  sourceLabel: string;
  /** 0–1 */
  certainty: number;
  mileageUsedMiles?: number;
};

export type MarketValueRequest = {
  catalogId: string;
  year: number;
  mileageMiles: number;
  purchasePrice: number;
  vin?: string;
};
