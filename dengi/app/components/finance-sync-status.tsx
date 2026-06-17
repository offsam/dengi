"use client";

import { useFinanceCloudSync } from "@/app/hooks/use-finance-cloud-sync";

function statusLabel(status: ReturnType<typeof useFinanceCloudSync>["status"]) {
  switch (status) {
    case "syncing":
      return "Синхронизация…";
    case "synced":
      return "Сохранено в облаке";
    case "error":
      return "Ошибка синхронизации";
    case "offline":
      return "Только локально";
    default:
      return "Локальное сохранение";
  }
}

export function FinanceSyncStatus() {
  const { status, syncKey, errorMessage, syncNow, lastSyncedAt } = useFinanceCloudSync();

  return (
    <div className="rounded-2xl bg-zinc-100/80 px-3.5 py-3 text-xs leading-relaxed text-zinc-600">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="font-semibold text-zinc-800">{statusLabel(status)}</p>
          <p>
            Данные хранятся в браузере и копируются в Supabase. GitHub хранит только
            код приложения, не ваши карты и машины.
          </p>
          {lastSyncedAt ? (
            <p className="text-zinc-500">
              Облако: {new Date(lastSyncedAt).toLocaleString("ru-RU")}
            </p>
          ) : null}
          {errorMessage ? <p className="text-rose-600">{errorMessage}</p> : null}
          {syncKey ? (
            <p className="truncate font-mono text-[10px] text-zinc-500" title={syncKey}>
              Ключ синхронизации: {syncKey}
            </p>
          ) : null}
          {syncKey ? (
            <p className="text-[10px] leading-relaxed text-zinc-500">
              На prod или другом браузере: откройте главную с{" "}
              <span className="font-mono">?syncKey={syncKey.slice(0, 8)}…</span>
            </p>
          ) : null}
        </div>

        <button
          type="button"
          onClick={syncNow}
          className="shrink-0 rounded-full bg-white px-2.5 py-1.5 text-[11px] font-semibold text-zinc-700 shadow-sm transition-colors hover:bg-zinc-50"
        >
          Синхр.
        </button>
      </div>
    </div>
  );
}
