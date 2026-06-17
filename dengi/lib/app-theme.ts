/** Общая тема приложения — кремовый фон и стеклянные пузыри */
export const APP_COLORS = {
  background: "#FCFCFA",
  text: "#18181B",
  muted: "#71717A",
  positive: "#5DAA8C",
  danger: "#D47F7F",
  track: "rgba(255,255,255,0.42)",
} as const;

export const APP_PAGE_CLASS = "min-h-full text-zinc-900";

/** Затемнение модалки — кремовое, сквозь него виден главный экран */
export const APP_MODAL_SCRIM = "bg-[#FCFCFA]/50 backdrop-blur-[4px]";

/** Панель модалки — как фон приложения, полупрозрачная */
export const APP_MODAL_PANEL =
  "relative z-10 w-full max-w-md overflow-hidden rounded-2xl border border-zinc-900/[0.06] bg-[#FCFCFA]/82 text-zinc-900 shadow-[0_12px_28px_-10px_rgba(90,80,65,0.12)] backdrop-blur-xl backdrop-saturate-150";

/** Шапка внутри прозрачной модалки */
export const APP_MODAL_HEADER =
  "border-b border-zinc-900/[0.06] bg-[#FCFCFA]/75 px-4 py-4 backdrop-blur-md";

/** Стеклянный пузырь — прозрачный, с мягкой тенью снизу */
export const APP_BUBBLE_SHELL =
  "rounded-2xl border border-white/90 bg-white/18 shadow-[0_12px_28px_-10px_rgba(90,80,65,0.28)] backdrop-blur-2xl backdrop-saturate-150";

/** Плавающий пузырь — почти прозрачное стекло, цифры сзади слегка видны */
export const APP_BUBBLE_SHELL_GLASS =
  "rounded-2xl border border-white/85 bg-white/[0.07] shadow-[0_12px_28px_-10px_rgba(90,80,65,0.24)] backdrop-blur-sm";

/** Круглый стеклянный пузырь для кнопки «+» */
export const APP_BUBBLE_ADD_SHELL =
  "relative isolate flex shrink-0 items-center justify-center overflow-hidden rounded-full border border-white/90 bg-white/18 shadow-[0_8px_20px_-10px_rgba(90,80,65,0.28)] backdrop-blur-xl backdrop-saturate-150 transition-transform active:scale-95";

/** Компактная кнопка-пузырь */
export const APP_BUBBLE_BUTTON =
  "inline-flex items-center justify-center rounded-full border border-white/90 bg-white/18 px-3 py-1 text-xs font-medium text-zinc-600 shadow-[0_8px_20px_-12px_rgba(90,80,65,0.22)] backdrop-blur-xl transition-colors hover:text-zinc-900";

/** Поле ввода в стиле пузыря */
export const APP_BUBBLE_INPUT =
  "w-full rounded-xl border border-white/70 bg-white/30 px-3 py-2.5 text-sm text-zinc-900 outline-none backdrop-blur-sm transition-colors focus:border-white focus:bg-white/40";

/** Вдавленное выделение — как у активной вкладки */
export const APP_BUBBLE_INSET_SELECTED =
  "bg-zinc-900/[0.09] shadow-[inset_0_2px_7px_rgba(55,50,45,0.2),inset_0_-1px_0_rgba(255,255,255,0.7)]";

/** Верхняя тень для вдавленной поверхности */
export const APP_BUBBLE_INSET_TOP_SHADE =
  "bg-gradient-to-b from-black/[0.08] to-transparent";

/** Компактное вдавление для поля ввода */
export const APP_BUBBLE_INSET_CONTROL =
  "rounded-lg bg-zinc-900/[0.06] px-2.5 py-1.5 shadow-[inset_0_1px_5px_rgba(55,50,45,0.14),inset_0_-1px_0_rgba(255,255,255,0.55)]";

export const APP_STAT_AMOUNT_NEUTRAL =
  "text-[17px] font-semibold leading-none tracking-tight tabular-nums text-zinc-900";

export const APP_STAT_AMOUNT_POSITIVE =
  "text-[17px] font-semibold leading-none tracking-tight tabular-nums text-[#5DAA8C]";

export const APP_STAT_AMOUNT_DANGER =
  "text-[17px] font-semibold leading-none tracking-tight tabular-nums text-[#D47F7F]";

export const APP_STAT_AMOUNT_SM_POSITIVE =
  "text-[11px] font-semibold leading-none tracking-tight tabular-nums text-[#5DAA8C]";
