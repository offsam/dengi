#!/usr/bin/env node
/**
 * Создаёт bucket assets (если нет) и папку «car Icons» в Supabase Storage.
 * Запуск: npm run supabase:init-car-icons
 *
 * Загрузка файлов: Supabase Dashboard → Storage → assets → car Icons
 * или: положите файлы в lib/car-icons/upload/ → npm run supabase:upload-car-icons
 */

import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const bucketId = "assets";
const folderName = "car Icons";
const placeholderPath = `${folderName}/.keep`;

if (!supabaseUrl || !serviceRoleKey) {
  console.error(
    "Нужны NEXT_PUBLIC_SUPABASE_URL и SUPABASE_SERVICE_ROLE_KEY в .env.local"
  );
  process.exit(1);
}

const supabase = createClient(supabaseUrl, serviceRoleKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

const { data: buckets, error: listError } = await supabase.storage.listBuckets();
if (listError) {
  console.error("Не удалось получить список bucket:", listError.message);
  process.exit(1);
}

const bucketExists = buckets.some((bucket) => bucket.id === bucketId);
if (!bucketExists) {
  const { error: createError } = await supabase.storage.createBucket(bucketId, {
    public: true,
    fileSizeLimit: 5 * 1024 * 1024,
    allowedMimeTypes: [
      "image/png",
      "image/jpeg",
      "image/webp",
      "image/svg+xml",
      "image/gif",
    ],
  });

  if (createError) {
    console.error("Не удалось создать bucket:", createError.message);
    process.exit(1);
  }

  console.log(`Bucket "${bucketId}" создан.`);
} else {
  console.log(`Bucket "${bucketId}" уже существует.`);
}

const placeholderBody = Buffer.from(
  '<svg xmlns="http://www.w3.org/2000/svg" width="1" height="1" viewBox="0 0 1 1" aria-hidden="true"></svg>',
  "utf8"
);

const { error: uploadError } = await supabase.storage
  .from(bucketId)
  .upload(placeholderPath, placeholderBody, {
    contentType: "image/svg+xml",
    upsert: true,
  });

if (uploadError) {
  console.error("Не удалось создать папку car Icons:", uploadError.message);
  process.exit(1);
}

const { data: listed, error: folderError } = await supabase.storage
  .from(bucketId)
  .list(folderName, { limit: 10 });

if (folderError) {
  console.error("Папка загружена, но list не сработал:", folderError.message);
  process.exit(1);
}

console.log(`Папка "${folderName}" готова в bucket "${bucketId}".`);
console.log(`Файлов в папке: ${listed?.length ?? 0}`);
console.log(
  `Public URL примера: ${supabaseUrl}/storage/v1/object/public/${bucketId}/${encodeURI(placeholderPath)}`
);
