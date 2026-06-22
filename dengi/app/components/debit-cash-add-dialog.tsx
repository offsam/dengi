"use client";

import { useState } from "react";
import { DebitBankFormFields } from "@/app/components/debit-bank-form-fields";
import { DebitCashAccountCard } from "@/app/components/debit-cash-account-card";
import { DebitCashCategoryPicker } from "@/app/components/debit-cash-category-picker";
import { DebitCashSimpleFormFields } from "@/app/components/debit-cash-simple-form-fields";
import { DebitCryptoFormFields } from "@/app/components/debit-crypto-form-fields";
import { useLocale } from "@/app/components/locale-provider";
import {
  TransparentModalPanel,
  TransparentModalRoot,
  TransparentModalScroll,
} from "@/app/components/transparent-modal-shell";
import { APP_MODAL_HEADER } from "@/lib/app-theme";
import { isOtherBank } from "@/lib/bank-logos";
import {
  buildDebitAccountDraftForPersist,
  createEmptyDebitBankDraft,
  createEmptyDebitCashDraft,
  createEmptyDebitCryptoDraft,
  toDebitCashAccountDraft,
  type DebitAccountKind,
  type DebitCashAccount,
  type DebitCashAccountDraft,
} from "@/lib/dashboard/debit-accounts";

type AddStep = "pick" | DebitAccountKind;

function createDraftForKind(kind: DebitAccountKind): DebitCashAccountDraft {
  switch (kind) {
    case "cash":
      return createEmptyDebitCashDraft();
    case "crypto":
      return createEmptyDebitCryptoDraft();
    default:
      return createEmptyDebitBankDraft();
  }
}

function draftToPreview(draft: DebitCashAccountDraft): DebitCashAccount {
  return buildDebitAccountDraftForPersist({
    ...draft,
    id: "preview",
  });
}

function validateDraftKey(draft: DebitCashAccountDraft): string | null {
  const normalized = buildDebitAccountDraftForPersist(draft);

  if (draft.kind === "cash") {
    return normalized.balance >= 0 ? null : "debit.validation.enterAmount";
  }

  if (draft.kind === "crypto") {
    if (!normalized.name.trim()) {
      return "debit.validation.enterName";
    }

    return null;
  }

  if (draft.incognito) {
    return normalized.name.trim() ? null : "debit.validation.enterAccountName";
  }

  if (!draft.bankId) {
    return "debit.validation.selectBankOrIncognito";
  }

  if (isOtherBank(draft.bankId) && !draft.customBankName?.trim()) {
    return "debit.validation.enterBankName";
  }

  if (!normalized.name.trim()) {
    return "debit.validation.enterAccountName";
  }

  return null;
}

export function DebitCashAddDialog({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (draft: DebitCashAccountDraft) => void;
}) {
  const { t } = useLocale();
  const [step, setStep] = useState<AddStep>("pick");
  const [draft, setDraft] = useState<DebitCashAccountDraft>(createEmptyDebitBankDraft());
  const [error, setError] = useState<string | null>(null);

  function resetAndClose() {
    setStep("pick");
    setDraft(createEmptyDebitBankDraft());
    setError(null);
    onClose();
  }

  function pickCategory(kind: DebitAccountKind) {
    setDraft(createDraftForKind(kind));
    setError(null);
    setStep(kind);
  }

  function patchDraft(patch: Partial<DebitCashAccountDraft>) {
    setDraft((current) => ({ ...current, ...patch }));
    setError(null);
  }

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const issueKey = validateDraftKey(draft);
    if (issueKey) {
      setError(t(issueKey));
      return;
    }

    onAdd(toDebitCashAccountDraft(buildDebitAccountDraftForPersist(draft)));
    resetAndClose();
  }

  const preview = step === "pick" ? null : draftToPreview(draft);
  const title =
    step === "pick"
      ? t("debit.addDialog.titleDebit")
      : step === "bank"
        ? t("debit.addDialog.titleBank")
        : t(`debit.kind.${step}`);

  return (
    <TransparentModalRoot
      open={open}
      onClose={resetAndClose}
      closeAriaLabel={t("debit.addDialog.closeAria")}
      titleId="add-debit-title"
    >
      <TransparentModalPanel>
        <TransparentModalScroll>
          <div className={APP_MODAL_HEADER}>
            <div className="flex items-center justify-between gap-3">
              <div className="flex min-w-0 items-center gap-2">
                {step !== "pick" ? (
                  <button
                    type="button"
                    onClick={() => {
                      setStep("pick");
                      setError(null);
                    }}
                    className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
                  >
                    {t("common.back")}
                  </button>
                ) : null}
                <h2 id="add-debit-title" className="truncate text-sm font-semibold tracking-tight text-zinc-900">
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={resetAndClose}
                className="shrink-0 rounded-full px-2 py-1 text-xs font-medium text-zinc-500 transition-colors hover:text-zinc-900"
              >
                {t("common.cancel")}
              </button>
            </div>

            {step === "pick" ? (
              <p className="mt-3 text-xs leading-relaxed text-zinc-500">
                {t("debit.addDialog.selectTypeHint")}
              </p>
            ) : null}

            {preview ? (
              <div className="mt-4 flex justify-center">
                <DebitCashAccountCard account={preview} />
              </div>
            ) : null}
          </div>

          {step === "pick" ? (
            <div className="space-y-4 px-4 py-4">
              <DebitCashCategoryPicker onSelect={pickCategory} />
            </div>
          ) : (
            <form className="space-y-5 px-4 py-4" onSubmit={handleSubmit}>
              {step === "bank" ? (
                <DebitBankFormFields
                  draft={{ ...draft, id: "preview" }}
                  onPatch={patchDraft}
                  addFlow
                />
              ) : null}

              {step === "cash" ? (
                <DebitCashSimpleFormFields
                  draft={{ ...draft, id: "preview" }}
                  onPatch={patchDraft}
                />
              ) : null}

              {step === "crypto" ? (
                <DebitCryptoFormFields
                  draft={{ ...draft, id: "preview" }}
                  onPatch={patchDraft}
                  addFlow
                />
              ) : null}

              {error ? (
                <p className="text-sm font-medium text-rose-600" role="alert">
                  {error}
                </p>
              ) : null}

              <button
                type="submit"
                className="w-full rounded-full bg-zinc-900 px-5 py-3 text-sm font-semibold text-white transition-colors hover:bg-zinc-800"
              >
                {t("common.add")}
              </button>
            </form>
          )}
        </TransparentModalScroll>
      </TransparentModalPanel>
    </TransparentModalRoot>
  );
}
