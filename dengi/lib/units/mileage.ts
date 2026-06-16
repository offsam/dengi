/** Км → мили (для одноразовой миграции старых данных) */
export const KM_TO_MI = 0.621_371;

export function kmToMiles(km: number) {
  return Math.round(km * KM_TO_MI);
}
