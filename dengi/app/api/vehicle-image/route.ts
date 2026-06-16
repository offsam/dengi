import { NextResponse } from "next/server";
import { carImagesApiEnabled } from "@/lib/auto-vehicles/image-source";

export const runtime = "nodejs";

const CAR_IMAGES_BASE = "https://carimagesapi.com/api/v1/signed-url";

export async function GET(request: Request) {
  if (!carImagesApiEnabled()) {
    return NextResponse.json(
      {
        error:
          "CarImages отключён: на бесплатном тарифе watermark. Используйте фото в public/vehicles/ или Pro + CAR_IMAGES_ENABLED=true.",
      },
      { status: 503 }
    );
  }

  const apiKey = process.env.CAR_IMAGES_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      {
        error:
          "CarImages API не настроен. Получите бесплатный ключ на carimagesapi.com и добавьте CAR_IMAGES_API_KEY в .env.local",
      },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);
  const make = searchParams.get("make")?.trim();
  const model = searchParams.get("model")?.trim();
  const year = searchParams.get("year")?.trim();

  if (!make || !model) {
    return NextResponse.json({ error: "Нужны make и model." }, { status: 400 });
  }

  const query = new URLSearchParams({
    api_key: apiKey,
    make,
    model,
    width: searchParams.get("width") ?? "600",
    format: searchParams.get("format") ?? "webp",
  });

  if (year) {
    query.set("year", year);
  }

  const apiSecret = process.env.CAR_IMAGES_API_SECRET;
  if (apiSecret) {
    query.set("api_secret", apiSecret);
  }

  try {
    const response = await fetch(`${CAR_IMAGES_BASE}?${query.toString()}`, {
      next: { revalidate: 300 },
    });

    if (!response.ok) {
      const details = await response.text();
      return NextResponse.json(
        { error: "CarImages не нашёл фото для этой модели.", details },
        { status: response.status === 429 ? 429 : 502 }
      );
    }

    const payload = (await response.json()) as { url?: string };
    if (!payload.url) {
      return NextResponse.json({ error: "Пустой ответ CarImages." }, { status: 502 });
    }

    return NextResponse.json({ url: payload.url });
  } catch {
    return NextResponse.json({ error: "CarImages недоступен." }, { status: 502 });
  }
}
