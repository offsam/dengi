import { APP_BUBBLE_SHELL } from "@/lib/app-theme";

/** Прозрачная плашка-пузырь */
export function BubbleCard({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`relative isolate min-w-0 overflow-hidden ${APP_BUBBLE_SHELL} ${className}`.trim()}
    >
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
      <div className="relative">{children}</div>
    </div>
  );
}
