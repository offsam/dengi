import { BubbleCard } from "@/app/components/bubble-card";
import { SegmentedControl } from "@/app/components/segmented-control";

/** Переключатель вкладок в общем пузырь-стиле */
export function BubbleSegmentedControl<T extends string>({
  options,
  value,
  onChange,
  ariaLabel,
}: {
  options: { id: T; label: string }[];
  value: T;
  onChange: (next: T) => void;
  ariaLabel: string;
}) {
  return (
    <BubbleCard className="p-1">
      <SegmentedControl
        options={options}
        value={value}
        onChange={onChange}
        ariaLabel={ariaLabel}
        variant="bubble"
      />
    </BubbleCard>
  );
}
