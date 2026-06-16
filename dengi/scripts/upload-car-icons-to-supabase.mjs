#!/usr/bin/env node
/**
 * Загружает иконки из lib/car-icons/upload/ в Supabase Storage (assets / car Icons).
 * Запуск: node --env-file=.env.local scripts/upload-car-icons-to-supabase.mjs
 */

import { createClient } from "@supabase/supabase-js";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { dirname, extname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const uploadDir = join(__dirname, "../lib/car-icons");

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketId = "assets";
const folderName = "car Icons";

const MIME_BY_EXT = {
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".gif": "image/gif",
};

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local"
  );
  process.exit(1);
}

let entries;
try {
  entries = readdirSync(uploadDir).filter(
    (name) => !name.startsWith(".") && !name.startsWith("ChatGPT")
  );
} catch {
  console.error(`Папка не найдена: ${uploadDir}`);
  console.error("Положите PNG-иконки в lib/car-icons/ и запустите снова.");
  process.exit(1);
}

if (entries.length === 0) {
  console.log(`Папка пуста: ${uploadDir}`);
  console.log("Добавьте файлы (mercedes-sprinter.svg и т.д.) и запустите снова.");
  process.exit(0);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

let uploaded = 0;

for (const fileName of entries) {
  const filePath = join(uploadDir, fileName);
  if (!statSync(filePath).isFile()) {
    continue;
  }

  const ext = extname(fileName).toLowerCase();
  const contentType = MIME_BY_EXT[ext];
  if (!contentType) {
    console.warn(`Пропуск ${fileName} — неподдерживаемый формат`);
    continue;
  }

  const storagePath = `${folderName}/${fileName}`;
  const body = readFileSync(filePath);

  const { error } = await supabase.storage.from(bucketId).upload(storagePath, body, {
    contentType,
    upsert: true,
  });

  if (error) {
    console.error(`Ошибка ${fileName}:`, error.message);
    continue;
  }

  uploaded += 1;
  console.log(`✓ ${storagePath}`);
}

console.log(`\nЗагружено: ${uploaded} из ${entries.length}`);
console.log(`Supabase Dashboard → Storage → ${bucketId} → ${folderName}`);
