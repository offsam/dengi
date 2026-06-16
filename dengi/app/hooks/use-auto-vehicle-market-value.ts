"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { AutoVehicle } from "@/lib/auto-vehicles/vehicle";

type MarketValueState = {
  loading: boolean;
  error: string | null;
  detailNote: string | null;
};

async function requestMarketValue(draft: AutoVehicle) {
  const params = new URLSearchParams({
    catalogId: draft.catalogId,
    year: String(draft.year),
    mileageMiles: String(draft.mileage),
    purchasePrice: String(draft.purchasePrice),
  });

  if (draft.vin?.trim()) {
    params.set("vin", draft.vin.trim());
  }

  const response = await fetch(`/api/vehicle-market-value?${params.toString()}`);
  const payload = (await response.json()) as {
    retail?: number;
    source?: AutoVehicle["marketPriceSource"];
    updatedAt?: string;
    sourceLabel?: string;
    detailNote?: string;
    error?: string;
  };

  return { response, payload };
}

/** Ручное обновление рыночной цены — без авто-пересчёта при каждом поле */
export function useAutoVehicleMarketValue(
  draft: AutoVehicle,
  onResolved: (patch: Pick<AutoVehicle, "marketPrice" | "marketPriceSource" | "marketPriceUpdatedAt">) => void,
  enabled = true
) {
  const [state, setState] = useState<MarketValueState>({
    loading: false,
    error: null,
    detailNote: null,
  });
  const requestIdRef = useRef(0);
  const onResolvedRef = useRef(onResolved);
  const draftRef = useRef(draft);
  const didMountFetchRef = useRef(false);

  useEffect(() => {
    onResolvedRef.current = onResolved;
  }, [onResolved]);

  useEffect(() => {
    draftRef.current = draft;
  }, [draft]);

  const refresh = useCallback(async () => {
    const requestId = ++requestIdRef.current;
    setState((prev) => ({ ...prev, loading: true, error: null }));

    try {
      const { response, payload } = await requestMarketValue(draftRef.current);

      if (requestId !== requestIdRef.current) {
        return;
      }

      if (!response.ok || !payload.retail) {
        setState({
          loading: false,
          error: payload.error ?? "Не удалось рассчитать рыночную цену.",
          detailNote: payload.detailNote ?? null,
        });
        return;
      }

      onResolvedRef.current({
        marketPrice: payload.retail,
        marketPriceSource: payload.source ?? "local",
        marketPriceUpdatedAt: payload.updatedAt ?? new Date().toISOString(),
      });

      setState({
        loading: false,
        error: null,
        detailNote: payload.detailNote ?? null,
      });
    } catch {
      if (requestId !== requestIdRef.current) {
        return;
      }

      setState({
        loading: false,
        error: "Ошибка сети при расчёте цены.",
        detailNote: null,
      });
    }
  }, []);

  useEffect(() => {
    if (!enabled || didMountFetchRef.current) {
      return;
    }

    didMountFetchRef.current = true;
    void refresh();
  }, [enabled, refresh]);

  return { ...state, refresh };
}
