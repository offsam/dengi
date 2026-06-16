import { APP_LOCALE } from "@/lib/i18n/locale";

const DB_NAME = "dengi";
const DB_VERSION = 1;
const STORE_NAME = "credit-card-contracts";
export const MAX_CONTRACT_BYTES = 10 * 1024 * 1024;

export const ACCEPTED_CONTRACT_TYPES = [
  "application/pdf",
  "image/jpeg",
  "image/png",
  "image/webp",
  "text/plain",
] as const;

type ContractRecord = {
  id: string;
  cardId: string;
  fileName: string;
  mimeType: string;
  sizeBytes: number;
  uploadedAt: string;
  blob: Blob;
};

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error ?? new Error("IndexedDB open failed"));
  });
}

function runTransaction<T>(
  mode: IDBTransactionMode,
  run: (store: IDBObjectStore) => IDBRequest<T>
): Promise<T> {
  return openDb().then(
    (db) =>
      new Promise<T>((resolve, reject) => {
        const transaction = db.transaction(STORE_NAME, mode);
        const store = transaction.objectStore(STORE_NAME);
        const request = run(store);

        request.onsuccess = () => resolve(request.result);
        request.onerror = () =>
          reject(request.error ?? new Error("IndexedDB request failed"));

        transaction.oncomplete = () => db.close();
        transaction.onerror = () =>
          reject(transaction.error ?? new Error("IndexedDB transaction failed"));
      })
  );
}

export function isAcceptedContractFile(file: File) {
  if (ACCEPTED_CONTRACT_TYPES.includes(file.type as (typeof ACCEPTED_CONTRACT_TYPES)[number])) {
    return true;
  }

  const lowerName = file.name.toLowerCase();
  return (
    lowerName.endsWith(".pdf") ||
    lowerName.endsWith(".jpg") ||
    lowerName.endsWith(".jpeg") ||
    lowerName.endsWith(".png") ||
    lowerName.endsWith(".webp") ||
    lowerName.endsWith(".txt")
  );
}

export async function saveCreditCardContract(cardId: string, file: File) {
  if (!isAcceptedContractFile(file)) {
    throw new Error("Неподдерживаемый тип файла. Используйте PDF, изображение или TXT.");
  }

  if (file.size > MAX_CONTRACT_BYTES) {
    throw new Error("Файл слишком большой. Максимум 10 МБ.");
  }

  const record: ContractRecord = {
    id: crypto.randomUUID(),
    cardId,
    fileName: file.name,
    mimeType: file.type || "application/octet-stream",
    sizeBytes: file.size,
    uploadedAt: new Date().toISOString(),
    blob: file,
  };

  await runTransaction("readwrite", (store) => store.put(record));

  return {
    id: record.id,
    fileName: record.fileName,
    mimeType: record.mimeType,
    sizeBytes: record.sizeBytes,
    uploadedAt: record.uploadedAt,
  };
}

export async function readCreditCardContractBlob(contractId: string) {
  const record = await runTransaction<ContractRecord | undefined>("readonly", (store) =>
    store.get(contractId)
  );
  return record?.blob ?? null;
}

export async function deleteCreditCardContract(contractId: string) {
  await runTransaction("readwrite", (store) => store.delete(contractId));
}

export function formatFileSize(bytes: number) {
  if (bytes < 1024) {
    return `${bytes} B`;
  }

  if (bytes < 1024 * 1024) {
    return `${(bytes / 1024).toFixed(1)} KB`;
  }

  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function formatUploadedAt(iso: string) {
  return new Intl.DateTimeFormat(APP_LOCALE, {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(iso));
}
