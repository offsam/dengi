"use client";

import type { DebitAccountKind } from "@/lib/dashboard/debit-accounts";
import { useLocale } from "@/app/components/locale-provider";

const CATEGORY_KINDS: DebitAccountKind[] = ["bank", "cash", "crypto"];

export function DebitCashCategoryPicker({
  onSelect,
}: {
  onSelect: (kind: DebitAccountKind) => void;
}) {
  const { t } = useLocale();

  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORY_KINDS.map((kind) => (
        <button
          key={kind}
          type="button"
          onClick={() => onSelect(kind)}
          className="rounded-2xl bg-zinc-100/90 px-2 py-3 text-center transition-colors hover:bg-zinc-200/90"
        >
          <p className="text-xs font-semibold text-zinc-900">{t(`debit.kind.${kind}`)}</p>
          <p className="mt-1 text-[10px] leading-snug text-zinc-500">
            {t(`debit.categoryPicker.${kind}Hint`)}
          </p>
        </button>
      ))}
    </div>
  );
}
