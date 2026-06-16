import localFont from "next/font/local";

/** Switzer (Fontshare) — основной шрифт приложения */
export const switzer = localFont({
  src: [
    {
      path: "./switzer/Switzer-Regular.woff2",
      weight: "400",
      style: "normal",
    },
    {
      path: "./switzer/Switzer-Medium.woff2",
      weight: "500",
      style: "normal",
    },
    {
      path: "./switzer/Switzer-Semibold.woff2",
      weight: "600",
      style: "normal",
    },
    {
      path: "./switzer/Switzer-Bold.woff2",
      weight: "700",
      style: "normal",
    },
  ],
  variable: "--font-switzer",
  display: "swap",
  fallback: ["system-ui", "sans-serif"],
});
