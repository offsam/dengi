/**
 * Применяет миграцию finance_snapshots и пушит снимок из localStorage (передаётся JSON-файлом).
 * Запуск:
 *   node --env-file=.env.local scripts/push-finance-snapshot.mjs snapshot.json
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const snapshotPath = process.argv[2];
if (!snapshotPath) {
  console.error("Укажите путь к JSON со снимком localStorage (dengi:* ключи).");
  process.exit(1);
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error("Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const payload = JSON.parse(readFileSync(snapshotPath, "utf8"));
const syncKey =
  payload["dengi:sync-key"] ??
  process.env.SYNC_KEY ??
  crypto.randomUUID();

const admin = createClient(url, key, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data, error } = await admin
  .from("finance_snapshots")
  .upsert(
    {
      sync_key: syncKey,
      payload,
      updated_at: new Date().toISOString(),
    },
    { onConflict: "sync_key" }
  )
  .select("sync_key, updated_at")
  .single();

if (error) {
  console.error("Ошибка записи:", error.message);
  process.exit(1);
}

console.log(JSON.stringify({ syncKey: data.sync_key, updatedAt: data.updated_at, keys: Object.keys(payload).length }));
