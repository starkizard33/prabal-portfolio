export const SINGLE_TABLE_KEY = "play:singleNames";
export const SINGLE_TABLE_MAX = 30;

export function readSingleTable(): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = sessionStorage.getItem(SINGLE_TABLE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((name): name is string => typeof name === "string");
  } catch {
    return [];
  }
}
