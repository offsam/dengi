import {
  INCOME_SOURCES_SEED,
  type IncomeSource,
  type IncomeSourceDraft,
} from "./types";

const STORAGE_KEY = "dengi:income-sources";

export function readIncomeSources(): IncomeSource[] {
  if (typeof window === "undefined") {
    return INCOME_SOURCES_SEED;
  }

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (raw === null) {
      return INCOME_SOURCES_SEED;
    }

    const parsed = JSON.parse(raw) as IncomeSource[];
    return Array.isArray(parsed) ? parsed : INCOME_SOURCES_SEED;
  } catch {
    return INCOME_SOURCES_SEED;
  }
}

export function writeIncomeSources(sources: IncomeSource[]) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(sources));
}

export function addIncomeSource(draft: IncomeSourceDraft) {
  const sources = readIncomeSources();
  const source: IncomeSource = {
    ...draft,
    id: crypto.randomUUID(),
  };
  const next = [...sources, source];
  writeIncomeSources(next);
  return next;
}

export function updateIncomeSource(id: string, patch: Partial<IncomeSource>) {
  const sources = readIncomeSources();
  const next = sources.map((source) =>
    source.id === id ? { ...source, ...patch, id: source.id } : source
  );
  writeIncomeSources(next);
  return next;
}

export function deleteIncomeSource(id: string) {
  const sources = readIncomeSources();
  const next = sources.filter((source) => source.id !== id);
  writeIncomeSources(next);
  return next;
}
