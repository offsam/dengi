"use client";

import { useRef, useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { extractContractText } from "@/lib/credit-cards/extract-contract-text";
import {
  applyParsedTermsToCard,
  parseContractTerms,
  type ContractTerm,
} from "@/lib/credit-cards/parse-contract-terms";
import {
  deleteCreditCardContract,
  formatFileSize,
  formatUploadedAt,
  isAcceptedContractFile,
  readCreditCardContractBlob,
  saveCreditCardContract,
} from "@/lib/credit-cards/contract-storage";
import type { CreditCard, CreditCardContract } from "@/lib/credit-cards/types";

const acceptAttr = ".pdf,.jpg,.jpeg,.png,.webp,.txt,application/pdf,image/*,text/plain";

function TermsPreview({ terms }: { terms: ContractTerm[] }) {
  if (terms.length === 0) {
    return (
      <p className="text-xs text-zinc-500">
        Файл сохранён, но стандартные условия не найдены. Попробуйте текстовый PDF
        или TXT-экспорт предложения от банка.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-emerald-700">
        Из предложения извлечено условий: {terms.length}
      </p>
      <ul className="max-h-48 space-y-1.5 overflow-y-auto">
        {terms.map((term) => (
          <li
            key={term.id}
            className="flex items-baseline justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 text-xs"
          >
            <span className="text-zinc-600">{term.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-zinc-900">
              {term.value}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function CreditCardContractUpload({
  cardId,
  card,
  contract,
  readOnly = false,
  onImport,
  onContractRemove,
}: {
  cardId: string;
  card: CreditCard;
  contract?: CreditCardContract;
  readOnly?: boolean;
  onImport: (payload: {
    contract: CreditCardContract;
    cardPatch: Partial<CreditCard>;
  }) => void;
  onContractRemove: () => void;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);

    try {
      if (!isAcceptedContractFile(file)) {
        throw new Error("Используйте PDF, JPG, PNG, WEBP или TXT.");
      }

      if (contract) {
        await deleteCreditCardContract(contract.id);
      }

      const saved = await saveCreditCardContract(cardId, file);
      const text = await extractContractText(file, saved.mimeType, saved.fileName);
      const terms = parseContractTerms(text);
      const nextContract: CreditCardContract = {
        ...saved,
        terms,
        termsExtractedAt: new Date().toISOString(),
      };

      onImport({
        contract: nextContract,
        cardPatch: terms.length > 0 ? applyParsedTermsToCard(card, terms) : {},
      });
    } catch (uploadError) {
      setError(
        uploadError instanceof Error ? uploadError.message : "Не удалось загрузить файл."
      );
    } finally {
      setBusy(false);
      if (inputRef.current) {
        inputRef.current.value = "";
      }
    }
  }

  async function handleOpen() {
    if (!contract) {
      return;
    }

    setError(null);
    const blob = await readCreditCardContractBlob(contract.id);
    if (!blob) {
      setError("Файл предложения не найден в локальном хранилище.");
      return;
    }

    const url = URL.createObjectURL(blob);
    window.open(url, "_blank", "noopener,noreferrer");
    window.setTimeout(() => URL.revokeObjectURL(url), 60_000);
  }

  async function handleRemove() {
    if (!contract) {
      return;
    }

    setBusy(true);
    setError(null);

    try {
      await deleteCreditCardContract(contract.id);
      onContractRemove();
    } catch (removeError) {
      setError(
        removeError instanceof Error ? removeError.message : "Не удалось удалить файл."
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        Условия карты
      </h2>
      <BubbleCard className="space-y-4 p-4">
        <p className="px-1 text-xs text-zinc-500">
          Загрузите предложение от банка. Ставки, комиссии и штрафы появятся на
          плитке карты.
        </p>

      {contract ? (
        <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
          <div>
            <p className="truncate text-sm font-medium text-zinc-900">
              {contract.fileName}
            </p>
            <p className="mt-1 text-xs text-zinc-500">
              {formatFileSize(contract.sizeBytes)} · Загружен{" "}
              {formatUploadedAt(contract.uploadedAt)}
            </p>
          </div>

          {contract.terms ? <TermsPreview terms={contract.terms} /> : null}

          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => void handleOpen()}
              disabled={busy}
              className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-50"
            >
              Открыть
            </button>
            {!readOnly ? (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  disabled={busy}
                  className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-50"
                >
                  Заменить
                </button>
                <button
                  type="button"
                  onClick={() => void handleRemove()}
                  disabled={busy}
                  className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:border-rose-300 disabled:opacity-50"
                >
                  Удалить
                </button>
              </>
            ) : null}
          </div>
        </div>
      ) : readOnly ? (
        <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500">
          Предложение не загружено
        </p>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={busy}
          className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-100/80 disabled:opacity-50"
        >
          <span className="text-sm font-medium text-zinc-800">
            {busy ? "Читаю предложение..." : "Загрузить предложение от банка"}
          </span>
          <span className="text-xs text-zinc-500">
            Лучше всего PDF или TXT · до 10 МБ
          </span>
        </button>
      )}

      <input
        ref={inputRef}
        type="file"
        accept={acceptAttr}
        className="hidden"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            void handleFile(file);
          }
        }}
      />

      {error ? <p className="px-1 text-xs font-medium text-rose-600">{error}</p> : null}
      </BubbleCard>
    </section>
  );
}
