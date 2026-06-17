import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase-admin";
import type { FinanceLocalSnapshot } from "@/lib/sync/local-snapshot";

type FinanceSnapshotRow = {
  sync_key: string;
  payload: FinanceLocalSnapshot;
  updated_at: string;
};

function isSnapshot(value: unknown): value is FinanceLocalSnapshot {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    return false;
  }

  return Object.entries(value).every(
    ([key, entry]) => key.startsWith("dengi:") && typeof entry === "string"
  );
}

export async function GET(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Облачная синхронизация не настроена (Supabase service role)." },
      { status: 503 }
    );
  }

  const syncKey = new URL(request.url).searchParams.get("syncKey");
  if (!syncKey) {
    return NextResponse.json({ error: "Нужен syncKey." }, { status: 400 });
  }

  const { data, error } = await admin
    .from("finance_snapshots")
    .select("sync_key, payload, updated_at")
    .eq("sync_key", syncKey)
    .maybeSingle();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!data) {
    return NextResponse.json({ syncKey, payload: {}, updatedAt: null });
  }

  const row = data as FinanceSnapshotRow;

  return NextResponse.json({
    syncKey: row.sync_key,
    payload: row.payload ?? {},
    updatedAt: row.updated_at,
  });
}

export async function POST(request: Request) {
  const admin = getSupabaseAdmin();
  if (!admin) {
    return NextResponse.json(
      { error: "Облачная синхронизация не настроена (Supabase service role)." },
      { status: 503 }
    );
  }

  let body: { syncKey?: string; payload?: unknown };
  try {
    body = (await request.json()) as { syncKey?: string; payload?: unknown };
  } catch {
    return NextResponse.json({ error: "Некорректный JSON." }, { status: 400 });
  }

  if (!isSnapshot(body.payload)) {
    return NextResponse.json({ error: "Некорректный payload." }, { status: 400 });
  }

  const syncKey = body.syncKey ?? crypto.randomUUID();

  const { data, error } = await admin
    .from("finance_snapshots")
    .upsert(
      {
        sync_key: syncKey,
        payload: body.payload,
        updated_at: new Date().toISOString(),
      },
      { onConflict: "sync_key" }
    )
    .select("sync_key, updated_at")
    .single();

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    syncKey: data.sync_key,
    updatedAt: data.updated_at,
  });
}
