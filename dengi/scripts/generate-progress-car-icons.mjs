/**
 * Отдельные иконки для progress bar — непрозрачный кузов, оригиналы не трогаем.
 * Запуск: node scripts/generate-progress-car-icons.mjs
 */

import { execSync } from "node:child_process";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = join(__dirname, "..");

execSync(`python3 "${join(__dirname, "generate-progress-car-icons.py")}"`, {
  cwd: root,
  stdio: "inherit",
});

console.log("Готово: lib/car-icons/progress/, public/car-icons/progress/");
