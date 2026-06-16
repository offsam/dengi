export type VehicleSilhouetteId =
  | "sport-coupe"
  | "sedan"
  | "hatchback"
  | "wagon"
  | "suv-compact"
  | "suv-mid"
  | "truck"
  | "sports-super";

export type VehicleCatalogEntry = {
  id: string;
  make: string;
  model: string;
  /** Модель для CarImages API, если отличается от отображаемой */
  imageModel?: string;
  trim?: string;
  /** /vehicles/… — приоритетнее API (без watermark) */
  localImage?: string;
  silhouetteId: VehicleSilhouetteId;
  aliases: string[];
};

export type VehiclePaint = {
  bodyColorHex: string;
  bodyColorLabel: string;
  wheelColorHex: string;
  wheelColorLabel: string;
};
