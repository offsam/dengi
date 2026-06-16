/**
 * Иконки типов кузова — локально public/car-icons/ и Supabase Storage (assets / car Icons).
 */

export {
  BODY_TYPE_ICONS,
  getBodyTypeIconLocalUrl,
  resolveBodyTypeIcon,
  type BodyTypeIcon,
} from "./registry";

export const CAR_ICONS_STORAGE_BUCKET = "assets";
export const CAR_ICONS_STORAGE_FOLDER = "car Icons";
export const CAR_ICON_EXTENSIONS = ["png", "svg", "webp"] as const;

export type CarIconExtension = (typeof CAR_ICON_EXTENSIONS)[number];

export function getCarIconStoragePath(fileName: string) {
  const normalized = fileName.replace(/^\/+/, "");
  return `${CAR_ICONS_STORAGE_FOLDER}/${normalized}`;
}

export function getCarIconPublicUrl(supabaseUrl: string, fileName: string) {
  const objectPath = encodeURI(getCarIconStoragePath(fileName));
  return `${supabaseUrl.replace(/\/+$/, "")}/storage/v1/object/public/${CAR_ICONS_STORAGE_BUCKET}/${objectPath}`;
}

/** URL из Supabase для файла иконки */
export function getCarIconRemoteUrl(fileName: string) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  if (!supabaseUrl) {
    return null;
  }

  return getCarIconPublicUrl(supabaseUrl, fileName);
}

/** Локальный URL → Supabase (fallback) */
export function getBodyTypeIconUrlCandidates(fileName: string) {
  const local = `/car-icons/${encodeURIComponent(fileName)}`;
  const remote = getCarIconRemoteUrl(fileName);
  return remote ? [local, remote] : [local];
}
