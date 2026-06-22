"use client";

import { useRef, useState } from "react";
import { BubbleCard } from "@/app/components/bubble-card";
import { useLocale } from "@/app/components/locale-provider";
import { extractContractText } from "@/lib/credit-cards/extract-contract-text";
import { localizeContractTerm } from "@/lib/credit-cards/localize-contract-term";
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
  const { lang, t } = useLocale();

  if (terms.length === 0) {
    return <p className="text-xs text-zinc-500">{t("credit.contract.noTermsFound")}</p>;
  }

  return (
    <div className="space-y-2">
      <p className="text-xs font-medium text-emerald-700">
        {t("credit.contract.extractedCount", { n: terms.length })}
      </p>
      <ul className="max-h-48 space-y-1.5 overflow-y-auto">
        {terms.map((term) => {
          const display = localizeContractTerm(term, lang);

          return (
          <li
            key={term.id}
            className="flex items-baseline justify-between gap-3 rounded-lg bg-white px-2.5 py-1.5 text-xs"
          >
            <span className="text-zinc-600">{display.label}</span>
            <span className="shrink-0 font-semibold tabular-nums text-zinc-900">
              {display.value}
            </span>
          </li>
          );
        })}
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
  const { t } = useLocale();
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setBusy(true);
    setError(null);

    try {
      if (!isAcceptedContractFile(file)) {
        throw new Error(t("credit.contract.invalidFormat"));
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
        uploadError instanceof Error ? uploadError.message : t("credit.contract.uploadError")
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
      setError(t("credit.contract.notInStorage"));
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
        removeError instanceof Error ? removeError.message : t("credit.contract.deleteError")
      );
    } finally {
      setBusy(false);
    }
  }

  return (
    <section className="space-y-2">
      <h2 className="px-1 text-[11px] font-semibold uppercase tracking-wide text-zinc-400">
        {t("credit.contract.sectionTitle")}
      </h2>
      <BubbleCard className="space-y-4 p-4">
        <p className="px-1 text-xs text-zinc-500">{t("credit.contract.hint")}</p>

        {contract ? (
          <div className="space-y-3 rounded-xl border border-zinc-200 bg-zinc-50 px-3 py-3">
            <div>
              <p className="truncate text-sm font-medium text-zinc-900">
                {contract.fileName}
              </p>
              <p className="mt-1 text-xs text-zinc-500">
                {formatFileSize(contract.sizeBytes)} · {formatUploadedAt(contract.uploadedAt)}
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
                {t("common.open")}
              </button>
              {!readOnly ? (
                <>
                  <button
                    type="button"
                    onClick={() => inputRef.current?.click()}
                    disabled={busy}
                    className="rounded-full border border-zinc-200 bg-white px-3 py-1.5 text-xs font-medium text-zinc-700 transition-colors hover:border-zinc-300 hover:text-zinc-900 disabled:opacity-50"
                  >
                    {t("credit.contract.replace")}
                  </button>
                  <button
                    type="button"
                    onClick={() => void handleRemove()}
                    disabled={busy}
                    className="rounded-full border border-rose-200 bg-white px-3 py-1.5 text-xs font-medium text-rose-600 transition-colors hover:border-rose-300 disabled:opacity-50"
                  >
                    {t("common.delete")}
                  </button>
                </>
              ) : null}
            </div>
          </div>
        ) : readOnly ? (
          <p className="rounded-xl border border-dashed border-zinc-200 bg-zinc-50 px-4 py-6 text-center text-xs text-zinc-500">
            {t("credit.contract.empty")}
          </p>
        ) : (
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={busy}
            className="flex w-full flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-zinc-300 bg-zinc-50 px-4 py-8 text-center transition-colors hover:border-zinc-400 hover:bg-zinc-100/80 disabled:opacity-50"
          >
            <span className="text-sm font-medium text-zinc-800">
              {busy ? t("credit.contract.reading") : t("credit.contract.upload")}
            </span>
            <span className="text-xs text-zinc-500">{t("credit.contract.uploadHint")}</span>
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
