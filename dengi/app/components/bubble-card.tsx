import { APP_BUBBLE_SHELL, APP_BUBBLE_SHELL_GLASS } from "@/lib/app-theme";

function BubbleCardHighlights({ variant }: { variant: "default" | "glass" }) {
  if (variant === "glass") {
    return (
      <>
        <div
          className="pointer-events-none absolute inset-x-[10%] top-[-28%] h-[52%] rounded-[50%] bg-gradient-to-b from-white/38 to-transparent"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute top-[7%] left-[11%] h-2.5 w-9 -rotate-[16deg] rounded-full bg-white/45 blur-[0.2px]"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 top-0 h-px bg-white/70"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute inset-x-0 bottom-0 h-[14%] bg-gradient-to-t from-zinc-900/[0.025] to-transparent"
          aria-hidden
        />
      </>
    );
  }

  return (
    <>
      <div
        className="pointer-events-none absolute inset-x-[6%] top-[-38%] h-[88%] rounded-[50%] bg-gradient-to-b from-white via-white/40 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-[22%] top-[-18%] h-[55%] rounded-[50%] bg-gradient-to-b from-white/70 to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute top-[10%] left-[14%] h-2.5 w-8 -rotate-[22deg] rounded-full bg-gradient-to-r from-white/40 via-white to-white/50 blur-[0.3px]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 bottom-0 h-[32%] bg-gradient-to-t from-black/[0.06] to-transparent"
        aria-hidden
      />
    </>
  );
}

/** Прозрачная плашка-пузырь */
export function BubbleCard({
  children,
  className = "",
  variant = "default",
}: {
  children: React.ReactNode;
  className?: string;
  /** glass — прозрачнее, с ярким бликом (плавающие карточки) */
  variant?: "default" | "glass";
}) {
  const shellClass = variant === "glass" ? APP_BUBBLE_SHELL_GLASS : APP_BUBBLE_SHELL;

  return (
    <div className={`relative isolate min-w-0 overflow-hidden ${shellClass} ${className}`.trim()}>
      <BubbleCardHighlights variant={variant} />
      <div className="relative">{children}</div>
    </div>
  );
}
