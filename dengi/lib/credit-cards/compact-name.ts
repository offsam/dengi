/** Короткая подпись на компактной плитке: одна строка или главное слово */
export function formatCompactCardName(name: string) {
  const trimmed = name.trim();
  if (!trimmed) {
    return "Карта";
  }

  if (trimmed.length <= 16) {
    return trimmed;
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  const primary = words[0] ?? trimmed;

  if (primary.length >= 3) {
    return primary;
  }

  return `${trimmed.slice(0, 15)}…`;
}
