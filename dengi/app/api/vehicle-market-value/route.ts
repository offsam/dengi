import { NextResponse } from "next/server";
import { getVehicleCatalogEntry } from "@/lib/auto-vehicles/catalog";
import { resolveMarketValue } from "@/lib/auto-vehicles/market-value";

export const runtime = "nodejs";

const OPEN_SOURCES_NOTE =
  "CarGurus, KBB, Edmunds и AutoTrader не дают бесплатный API для сторонних приложений. " +
  "Их «Instant Market Value» доступен только на сайте. Для реальных объявлений нужен платный доступ " +
  "(VinAudit, Car Databases, Cardog) или парсинг — он против ToS и нестабилен.";

function buildDetailNote(source: string, sourceLabel: string) {
  if (source === "vinaudit") {
    return `${sourceLabel} — оценка по VIN и пробегу (US retail).`;
  }

  return (
    `${sourceLabel}. Это расчётная модель по году, пробегу и типу кузова — не выборка с CarGurus. ` +
    OPEN_SOURCES_NOTE
  );
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const catalogId = searchParams.get("catalogId")?.trim();
  const year = Number(searchParams.get("year"));
  const mileageMiles = Number(searchParams.get("mileageMiles"));
  const purchasePrice = Number(searchParams.get("purchasePrice"));
  const vin = searchParams.get("vin")?.trim() ?? undefined;

  if (!catalogId || !getVehicleCatalogEntry(catalogId)) {
    return NextResponse.json({ error: "Нужен catalogId из каталога." }, { status: 400 });
  }

  if (!Number.isFinite(year) || year < 1980 || year > 2035) {
    return NextResponse.json({ error: "Некорректный год." }, { status: 400 });
  }

  if (!Number.isFinite(mileageMiles) || mileageMiles < 0) {
    return NextResponse.json({ error: "Некорректный пробег." }, { status: 400 });
  }

  const entry = getVehicleCatalogEntry(catalogId)!;

  const estimate = await resolveMarketValue({
    catalogId,
    year,
    mileageMiles,
    purchasePrice: Number.isFinite(purchasePrice) ? purchasePrice : 0,
    vin,
  });

  return NextResponse.json({
    ...estimate,
    vehicleLabel: `${year} ${entry.make} ${entry.trim ? `${entry.model} ${entry.trim}` : entry.model}`,
    updatedAt: new Date().toISOString(),
    detailNote: buildDetailNote(estimate.source, estimate.sourceLabel),
    openSourcesNote: OPEN_SOURCES_NOTE,
  });
}
