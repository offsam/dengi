import { estimateLocalMarketValue } from "./estimate-local";
import { fetchVinAuditMarketValue } from "./providers/vinaudit";
import type { MarketValueEstimate, MarketValueRequest } from "./types";

export type { MarketValueEstimate, MarketValueRequest, MarketValueSource } from "./types";

/** Сначала VinAudit (если есть VIN + ключ), иначе локальная модель */
export async function resolveMarketValue(
  input: MarketValueRequest
): Promise<MarketValueEstimate> {
  if (input.vin?.trim()) {
    const remote = await fetchVinAuditMarketValue({
      vin: input.vin,
      mileageMiles: input.mileageMiles,
    });

    if (remote) {
      return remote;
    }
  }

  return estimateLocalMarketValue(input);
}
