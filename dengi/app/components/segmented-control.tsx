type SegmentedOption<T extends string> = {
  id: T;
  label: string;
};

/** Переключатель сегментов — тот же вид, что вкладки на экране авто */
export function SegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  const columns = options.length;

  return (
    <div
      className="grid gap-1 rounded-2xl border border-zinc-200/80 bg-white p-1 shadow-sm"
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = value === option.id;

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-xl px-1 py-2 text-[11px] font-semibold leading-tight transition-colors ${
              selected ? "bg-zinc-900 text-white" : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
