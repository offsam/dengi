#!/usr/bin/env node
/**
 * Сжимает PNG иконки типов кузова для веба.
 * Цель: чётко на ~30% ширины экрана (≈117 CSS px при 390px viewport, 3× Retina ≈ 351 px).
 * Макс. сторона 512 px — ~50 KB на файл вместо ~2 MB.
 *
 * Запуск: npm run optimize:car-icons
 */

import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, readFileSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const iconsDir = join(__dirname, "../lib/car-icons");
const publicDir = join(__dirname, "../public/car-icons");
const registryPath = join(iconsDir, "registry.ts");

/** 512 px × 3× Retina на ~170 CSS px; с запасом для 30% экрана */
const MAX_DIMENSION = 512;

function readRegistryFileNames() {
  const source = readFileSync(registryPath, "utf8");
  const names = [...source.matchAll(/fileName:\s*"([^"]+\.png)"/g)].map((match) => match[1]);

  if (names.length === 0) {
    throw new Error("Не найдены fileName в lib/car-icons/registry.ts");
  }

  return names;
}

function resizeWithSips(sourcePath) {
  execFileSync("sips", ["-Z", String(MAX_DIMENSION), sourcePath], { stdio: "pipe" });
}

/** Убирает прозрачные поля — машина занимает всю ширину PNG */
function trimTransparentPadding(sourcePath) {
  execFileSync(
    "python3",
    [
      "-c",
      `from PIL import Image
path = ${JSON.stringify(sourcePath)}
im = Image.open(path)
bbox = im.getbbox()
if bbox:
    im.crop(bbox).save(path)`,
    ],
    { stdio: "pipe" }
  );
}

function formatKb(bytes) {
  return `${Math.round(bytes / 1024)} KB`;
}

const fileNames = readRegistryFileNames();
mkdirSync(publicDir, { recursive: true });

let totalAfter = 0;

console.log(`Оптимизация ${fileNames.length} иконок (max ${MAX_DIMENSION}px)…\n`);

for (const fileName of fileNames) {
  const sourcePath = join(iconsDir, fileName);
  const publicPath = join(publicDir, fileName);

  resizeWithSips(sourcePath);
  trimTransparentPadding(sourcePath);
  copyFileSync(sourcePath, publicPath);

  const libSize = statSync(sourcePath).size;
  totalAfter += libSize;

  console.log(`  ${fileName} → ${formatKb(libSize)}`);
}

console.log(`\nГотово: ${fileNames.length} файлов, суммарно ${formatKb(totalAfter)}`);
console.log(`Папки: lib/car-icons/, public/car-icons/`);
