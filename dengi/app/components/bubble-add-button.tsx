import { APP_BUBBLE_ADD_SHELL } from "@/lib/app-theme";

function BubbleSphereChrome() {
  return (
    <>
      <span
        className="pointer-events-none absolute inset-x-[12%] top-[-22%] h-[82%] rounded-[50%] bg-gradient-to-b from-white via-white/35 to-transparent"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute top-[14%] left-[24%] size-1.5 rounded-full bg-white/90 blur-[0.3px]"
        aria-hidden
      />
      <span
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[38%] bg-gradient-to-t from-black/[0.07] to-transparent"
        aria-hidden
      />
    </>
  );
}

/** Круглая 3D-кнопка «+» в виде пузырика */
export function BubbleAddButton({
  onClick,
  ariaLabel,
  active = false,
  size = "md",
  className = "",
}: {
  onClick?: () => void;
  ariaLabel: string;
  active?: boolean;
  size?: "sm" | "md";
  className?: string;
}) {
  const sizeClass = size === "sm" ? "size-8" : "size-9";
  const iconClass = size === "sm" ? "size-3.5" : "size-4";

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={ariaLabel}
      aria-pressed={active}
      className={`${APP_BUBBLE_ADD_SHELL} ${sizeClass} ${className}`.trim()}
    >
      <BubbleSphereChrome />
      <svg
        aria-hidden
        className={`relative z-[1] ${iconClass} text-zinc-700`}
        viewBox="0 0 16 16"
        fill="none"
        stroke="currentColor"
        strokeWidth={2.2}
      >
        {active ? (
          <path d="M4.25 4.25l7.5 7.5M11.75 4.25l-7.5 7.5" strokeLinecap="round" />
        ) : (
          <path d="M8 3.5v9M3.5 8h9" strokeLinecap="round" />
        )}
      </svg>
    </button>
  );
}
