export type BodyTypeIcon = {
  /** id = имя файла без расширения */
  id: string;
  label: string;
  fileName: string;
};

/** Иконки типов кузова — lib/car-icons/*.png → public/car-icons/ (17 шт.), от меньшего к большему */
export const BODY_TYPE_ICONS: BodyTypeIcon[] = [
  { id: "ebike", label: "E-bike", fileName: "ebike.png" },
  { id: "moto", label: "Мото", fileName: "moto.png" },
  { id: "mini", label: "Компакт", fileName: "mini.png" },
  { id: "hatchback", label: "Хэтчбек", fileName: "hatchback.png" },
  { id: "coupe", label: "Купе", fileName: "coupe.png" },
  { id: "sport", label: "Спорт", fileName: "sport.png" },
  { id: "sedan", label: "Седан", fileName: "sedan.png" },
  { id: "cabri", label: "Кабриолет", fileName: "cabri.png" },
  { id: "universal", label: "Универсал", fileName: "universal.png" },
  { id: "suv", label: "Кроссовер", fileName: "suv.png" },
  { id: "minivan", label: "Минивэн", fileName: "minivan.png" },
  { id: "7seatSUV", label: "7-местный SUV", fileName: "7seatSUV.png" },
  { id: "FULLsizeSUV", label: "Большой SUV", fileName: "FULLsizeSUV.png" },
  { id: "pickup", label: "Пикап", fileName: "pickup.png" },
  { id: "Cargo", label: "Фургон", fileName: "Cargo.png" },
  { id: "cyber", label: "Кибертрак", fileName: "cyber.png" },
  { id: "semi", label: "Тягач", fileName: "semi.png" },
];

export const BODY_TYPE_ICON_COUNT = BODY_TYPE_ICONS.length;

const iconsById = new Map(BODY_TYPE_ICONS.map((icon) => [icon.id, icon]));
const defaultBodyTypeIcon =
  iconsById.get("sedan") ?? BODY_TYPE_ICONS[0];

export function resolveBodyTypeIcon(iconId: string | undefined) {
  if (!iconId) {
    return defaultBodyTypeIcon;
  }

  return iconsById.get(iconId) ?? defaultBodyTypeIcon;
}

export function getBodyTypeIconLocalUrl(icon: BodyTypeIcon) {
  return `/car-icons/${encodeURIComponent(icon.fileName)}`;
}
