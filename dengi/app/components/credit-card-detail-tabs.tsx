export type CreditCardDetailTab = "settings" | "transactions" | "report";

const TABS: { id: CreditCardDetailTab; label: string }[] = [
  { id: "transactions", label: "Транзакции" },
  { id: "report", label: "Отчёт" },
  { id: "settings", label: "Настройки" },
];

export function CreditCardDetailTabs({
  active,
  onChange,
}: {
  active: CreditCardDetailTab;
  onChange: (tab: CreditCardDetailTab) => void;
}) {
  return (
    <div
      className="grid grid-cols-3 gap-1 rounded-2xl border border-zinc-200/80 bg-white p-1 shadow-sm"
      role="tablist"
      aria-label="Разделы карты"
    >
      {TABS.map((tab) => {
        const selected = active === tab.id;

        return (
          <button
            key={tab.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(tab.id)}
            className={`rounded-xl px-2 py-2 text-xs font-semibold transition-colors ${
              selected
                ? "bg-zinc-900 text-white"
                : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );
}
