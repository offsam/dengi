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
  variant = "light",
}: {
  options: SegmentedOption<T>[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
  variant?: "light" | "dark" | "bubble";
}) {
  const columns = options.length;
  const isDark = variant === "dark";
  const isBubble = variant === "bubble";

  return (
    <div
      className={
        isBubble
          ? "relative z-[1] grid gap-0.5 p-0.5"
          : isDark
            ? "grid gap-1 rounded-2xl border border-[#2A2A2A] bg-[#1A1A1A] p-1"
            : "grid gap-1 rounded-2xl border border-zinc-200/80 bg-white p-1 shadow-sm"
      }
      style={{ gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))` }}
      role="tablist"
      aria-label={ariaLabel}
    >
      {options.map((option) => {
        const selected = value === option.id;

        if (isBubble) {
          return (
            <button
              key={option.id}
              type="button"
              role="tab"
              aria-selected={selected}
              onClick={() => onChange(option.id)}
              className={`relative min-w-0 overflow-hidden rounded-xl px-1 py-2 text-[11px] leading-tight transition-colors ${
                selected
                  ? "font-semibold text-zinc-800"
                  : "font-medium text-zinc-500 hover:text-zinc-700"
              }`}
            >
              {selected ? (
                <>
                  <span
                    className="pointer-events-none absolute inset-0 rounded-xl bg-zinc-900/[0.09] shadow-[inset_0_2px_7px_rgba(55,50,45,0.2),inset_0_-1px_0_rgba(255,255,255,0.7)]"
                    aria-hidden
                  />
                  <span
                    className="pointer-events-none absolute inset-x-0 top-0 h-[42%] rounded-t-xl bg-gradient-to-b from-black/[0.08] to-transparent"
                    aria-hidden
                  />
                </>
              ) : null}
              <span className="relative z-[1] block truncate">{option.label}</span>
            </button>
          );
        }

        return (
          <button
            key={option.id}
            type="button"
            role="tab"
            aria-selected={selected}
            onClick={() => onChange(option.id)}
            className={`rounded-xl px-1 py-2 text-[11px] font-semibold leading-tight transition-colors ${
              selected
                ? isDark
                  ? "bg-[#00D084] text-[#0F0F0F]"
                  : "bg-zinc-900 text-white"
                : isDark
                  ? "text-[#888888] hover:text-white"
                  : "text-zinc-600 hover:text-zinc-900"
            }`}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
