"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { IncomeSourceCard, IncomeSourceOverviewPanel } from "@/app/components/income-source-card";
import { IncomeSourceFormFields } from "@/app/components/income-source-form-fields";
import { SimpleDeleteDialog } from "@/app/components/simple-delete-dialog";
import { useClientMounted } from "@/app/hooks/use-client-mounted";
import { useIncomeSources } from "@/app/hooks/use-income-sources";
import { APP_PAGE_CLASS } from "@/lib/app-theme";
import {
  getIncomeSourceKindLabel,
  resolveIncomeSourceKindPreset,
  type IncomeSource,
  type IncomeSourceKind,
} from "@/lib/income-sources/types";

type PanelMode = "view" | "edit" | "saved";

function buildSourceDraft(
  source: IncomeSource,
  draft: IncomeSource,
  customKindLabel: string
): IncomeSource {
  const preset = resolveIncomeSourceKindPreset(draft.kind);

  return {
    ...draft,
    id: source.id,
    accentColor: preset.accentColor,
    customKindLabel: draft.kind === "other" ? customKindLabel.trim() : undefined,
  };
}

function IncomeSourceSettingsPanel({
  source,
  onSave,
  onDelete,
}: {
  source: IncomeSource;
  onSave: (next: IncomeSource) => void;
  onDelete: () => void;
}) {
  const [mode, setMode] = useState<PanelMode>("view");
  const [draft, setDraft] = useState(source);
  const [customKindLabel, setCustomKindLabel] = useState(source.customKindLabel ?? "");

  const editing = mode === "edit";
  const saved = mode === "saved";
  const preview = buildSourceDraft(source, editing ? draft : source, customKindLabel);

  function patchDraft(patch: Partial<IncomeSource>) {
    setDraft((current) => ({ ...current, ...patch, id: source.id }));
  }

  function handleKindChange(kind: IncomeSourceKind) {
    const preset = resolveIncomeSourceKindPreset(kind);
    patchDraft({ kind, accentColor: preset.accentColor });
  }

  function cancelEditing() {
    setDraft(source);
    setCustomKindLabel(source.customKindLabel ?? "");
    setMode("view");
  }

  function saveEditing() {
    if (draft.kind === "other" && !customKindLabel.trim()) {
      return;
    }

    if (!draft.name.trim()) {
      return;
    }

    onSave(buildSourceDraft(source, draft, customKindLabel));
    setMode("saved");
  }

  useEffect(() => {
    if (mode !== "saved") {
      return;
    }

    const timer = window.setTimeout(() => setMode("view"), 2000);
    return () => window.clearTimeout(timer);
  }, [mode]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-zinc-900">Настройки</h2>
        {editing ? (
          <div className="flex gap-2">
            <button
              type="button"
              onClick={cancelEditing}
              className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
            >
              Отмена
            </button>
            <button
              type="button"
              onClick={saveEditing}
              className="rounded-full bg-zinc-900 px-3 py-1.5 text-xs font-semibold text-white"
            >
              Сохранить
            </button>
          </div>
        ) : (
          <button
            type="button"
            onClick={() => setMode("edit")}
            className="rounded-full px-3 py-1.5 text-xs font-semibold text-zinc-600 hover:bg-zinc-100"
          >
            Изменить
          </button>
        )}
      </div>

      {saved ? (
        <p className="text-xs font-medium text-emerald-600">Сохранено</p>
      ) : null}

      <IncomeSourceFormFields
        draft={preview}
        customKindLabel={customKindLabel}
        onPatch={patchDraft}
        onKindChange={handleKindChange}
        onCustomKindLabelChange={setCustomKindLabel}
        readOnly={!editing}
      />

      {!editing ? (
        <button
          type="button"
          onClick={onDelete}
          className="w-full rounded-2xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-100"
        >
          Удалить источник
        </button>
      ) : null}
    </div>
  );
}

function IncomeSourceDetailContent({ source }: { source: IncomeSource }) {
  const router = useRouter();
  const { updateSource, deleteSource } = useIncomeSources();
  const [deleteOpen, setDeleteOpen] = useState(false);
  const kindLabel = getIncomeSourceKindLabel(source);

  return (
    <div className={APP_PAGE_CLASS}>
      <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
        <header className="flex items-center justify-between gap-3">
          <Link
            href="/"
            className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
          >
            Назад
          </Link>
          <h1 className="truncate text-sm font-semibold tracking-tight">{source.name}</h1>
          <span className="w-10" aria-hidden />
        </header>

        <p className="-mt-2 text-center text-xs font-medium uppercase tracking-wide text-zinc-500">
          {kindLabel}
        </p>
        <p className="text-center text-[11px] leading-relaxed text-zinc-500">
          Личная заметка — не влияет на чистый капитал и сводку на главной.
        </p>

        <IncomeSourceCard {...source} variant="detail" />

        <IncomeSourceOverviewPanel source={source} />

        <IncomeSourceSettingsPanel
          key={`${source.id}:${source.kind}:${source.name}:${source.monthlyAmount}`}
          source={source}
          onSave={(next) => updateSource(source.id, next)}
          onDelete={() => setDeleteOpen(true)}
        />
      </main>

      <SimpleDeleteDialog
        open={deleteOpen}
        title="Удалить источник дохода?"
        description={`«${source.name}» исчезнет с главного экрана.`}
        onClose={() => setDeleteOpen(false)}
        onConfirm={() => {
          setDeleteOpen(false);
          deleteSource(source.id);
          router.replace("/");
        }}
      />
    </div>
  );
}

export function IncomeSourceSettingsView({ sourceId }: { sourceId: string }) {
  const mounted = useClientMounted();
  const { getSource } = useIncomeSources();
  const source = mounted ? getSource(sourceId) : null;

  if (!mounted) {
    return (
      <div className={APP_PAGE_CLASS}>
        <main className="mx-auto flex w-full max-w-md flex-col gap-5 px-4 py-6">
          <div className="h-5 w-14 animate-pulse rounded bg-zinc-200/80" />
          <div className="h-28 animate-pulse rounded-3xl bg-zinc-200/60" />
          <div className="h-10 animate-pulse rounded-full bg-zinc-200/60" />
        </main>
      </div>
    );
  }

  if (!source) {
    return (
      <div className="mx-auto flex w-full max-w-md flex-col gap-4 px-4 py-6">
        <Link
          href="/"
          className="text-sm font-medium text-zinc-600 underline-offset-2 hover:text-zinc-900 hover:underline"
        >
          На главную
        </Link>
        <p className="text-sm text-zinc-600">Источник дохода не найден.</p>
      </div>
    );
  }

  return <IncomeSourceDetailContent source={source} />;
}
