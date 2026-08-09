export function normalizeGuess(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

export function fuzzyMatch(guess: string, targets: string[]): boolean {
  const normalized = normalizeGuess(guess);
  if (!normalized) return false;
  return targets.some((target) => {
    const t = normalizeGuess(target);
    return normalized === t || t.includes(normalized) || normalized.includes(t);
  });
}
