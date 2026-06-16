import type { MarketValueEstimate } from "../types";

const VINAUDIT_URL = "https://marketvalue.vinaudit.com/v2/marketvalue";

type VinAuditResponse = {
  success?: boolean;
  mean?: number;
  prices?: {
    average?: number;
    below?: number;
    above?: number;
  };
  certainty?: number;
  mileage?: number;
  error?: string;
  message?: string;
};

/** VinAudit — нужен API-ключ и VIN (trial / платная подписка) */
export async function fetchVinAuditMarketValue(input: {
  vin: string;
  mileageMiles: number;
}): Promise<MarketValueEstimate | null> {
  const apiKey = process.env.VINAUDIT_API_KEY?.trim();
  if (!apiKey) {
    return null;
  }

  const vin = input.vin.trim().toUpperCase();
  if (vin.length !== 17) {
    return null;
  }

  const params = new URLSearchParams({
    key: apiKey,
    vin,
    format: "json",
    type: "retail",
    mileage: String(Math.round(Math.max(0, input.mileageMiles))),
    country: "usa",
  });

  const response = await fetch(`${VINAUDIT_URL}?${params.toString()}`, {
    next: { revalidate: 3600 },
  });

  if (!response.ok) {
    return null;
  }

  const payload = (await response.json()) as VinAuditResponse;
  if (!payload.success) {
    return null;
  }

  const retail = Math.round(payload.prices?.average ?? payload.mean ?? 0);
  if (!Number.isFinite(retail) || retail <= 0) {
    return null;
  }

  const low = Math.round(payload.prices?.below ?? retail * 0.92);
  const high = Math.round(payload.prices?.above ?? retail * 1.08);
  const certaintyRaw = payload.certainty ?? 75;

  return {
    retail,
    low,
    high,
    source: "vinaudit",
    sourceLabel: "VinAudit (розничная оценка)",
    certainty: Math.min(1, Math.max(0, certaintyRaw / 100)),
    mileageUsedMiles: payload.mileage,
  };
}
