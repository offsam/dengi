import { getVehicleCatalogEntry } from "./catalog";

/** Локальное фото без watermark (public/vehicles/…) */
export function getLocalVehicleImagePath(catalogId: string) {
  const entry = getVehicleCatalogEntry(catalogId);
  if (entry?.localImage) {
    return entry.localImage;
  }

  return `/vehicles/${catalogId}.jpg`;
}

export function carImagesApiEnabled() {
  return process.env.CAR_IMAGES_ENABLED === "true";
}
