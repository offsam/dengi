"use client";

import type { DebitAccountKind } from "@/lib/dashboard/debit-accounts";
import { DEBIT_ACCOUNT_KIND_LABELS } from "@/lib/dashboard/debit-accounts";

const CATEGORY_OPTIONS: {
  kind: DebitAccountKind;
  hint: string;
}[] = [
  { kind: "bank", hint: "Счёт или карта" },
  { kind: "cash", hint: "Только сумма" },
  { kind: "crypto", hint: "Биржа по желанию" },
];

export function DebitCashCategoryPicker({
  onSelect,
}: {
  onSelect: (kind: DebitAccountKind) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2">
      {CATEGORY_OPTIONS.map((option) => (
        <button
          key={option.kind}
          type="button"
          onClick={() => onSelect(option.kind)}
          className="rounded-2xl bg-zinc-100/90 px-2 py-3 text-center transition-colors hover:bg-zinc-200/90"
        >
          <p className="text-xs font-semibold text-zinc-900">
            {DEBIT_ACCOUNT_KIND_LABELS[option.kind]}
          </p>
          <p className="mt-1 text-[10px] leading-snug text-zinc-500">{option.hint}</p>
        </button>
      ))}
    </div>
  );
}
