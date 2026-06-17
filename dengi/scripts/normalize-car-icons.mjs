/**
 * Обрезка иконок по контуру + удаление белой плитки по краям.
 * Оригинальная прозрачность кузова сохраняется — не для progress bar.
 * Запуск: node scripts/normalize-car-icons.mjs
 */

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));

execSync(`python3 "${join(__dirname, "normalize-car-icons.py")}"`, {
  cwd: join(__dirname, ".."),
  stdio: "inherit",
});

execSync(`node "${join(__dirname, "generate-progress-car-icons.mjs")}"`, {
  cwd: join(__dirname, ".."),
  stdio: "inherit",
});

console.log("Готово: lib/car-icons/, public/car-icons/, progress/");
