import { APP_BUBBLE_INSET_SELECTED, APP_BUBBLE_INSET_TOP_SHADE } from "@/lib/app-theme";

/** Вдавленная подложка — как у выбранной вкладки */
export function BubbleInsetOverlay({
  rounded = "2xl",
}: {
  rounded?: "lg" | "xl" | "2xl";
}) {
  const roundClass =
    rounded === "lg" ? "rounded-lg" : rounded === "xl" ? "rounded-xl" : "rounded-2xl";
  const roundTopClass =
    rounded === "lg" ? "rounded-t-lg" : rounded === "xl" ? "rounded-t-xl" : "rounded-t-2xl";

  return (
    <>
      <span
        className={`pointer-events-none absolute inset-0 z-0 ${roundClass} ${APP_BUBBLE_INSET_SELECTED}`}
        aria-hidden
      />
      <span
        className={`pointer-events-none absolute inset-x-0 top-0 z-0 h-[40%] ${roundTopClass} ${APP_BUBBLE_INSET_TOP_SHADE}`}
        aria-hidden
      />
    </>
  );
}
