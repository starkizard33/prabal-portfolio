export function normalizeGuess(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0;
  if (!a.length) return b.length;
  if (!b.length) return a.length;
  const prev = new Array<number>(b.length + 1);
  const curr = new Array<number>(b.length + 1);
  for (let j = 0; j <= b.length; j += 1) prev[j] = j;
  for (let i = 1; i <= a.length; i += 1) {
    curr[0] = i;
    for (let j = 1; j <= b.length; j += 1) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1;
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost);
    }
    for (let j = 0; j <= b.length; j += 1) prev[j] = curr[j];
  }
  return prev[b.length];
}

function typoTolerance(length: number): number {
  if (length <= 3) return 0;
  if (length <= 5) return 1;
  if (length <= 9) return 2;
  return 3;
}

/** Higher is better. Negative means no useful match. */
export function fuzzyScore(query: string, candidate: string): number {
  const q = normalizeGuess(query);
  const c = normalizeGuess(candidate);
  if (!q || !c) return -1;
  if (q === c) return 1000;
  if (c.startsWith(q)) return 800 - Math.min(q.length, 40);
  if (c.includes(q)) return 600 - c.indexOf(q);
  if (q.includes(c) && c.length >= 3) return 500;

  const compactQ = q.replace(/\s+/g, "");
  const compactC = c.replace(/\s+/g, "");
  if (compactQ === compactC) return 950;
  if (compactC.startsWith(compactQ)) return 750;

  const dist = levenshtein(compactQ, compactC);
  const allowed = typoTolerance(Math.max(compactQ.length, compactC.length));
  if (dist <= allowed) return 400 - dist * 40;

  // soft subsequence: typed letters appear in order
  let qi = 0;
  for (let i = 0; i < compactC.length && qi < compactQ.length; i += 1) {
    if (compactC[i] === compactQ[qi]) qi += 1;
  }
  if (qi === compactQ.length && compactQ.length >= 3) {
    return 200 - (compactC.length - compactQ.length);
  }

  return -1;
}

export function fuzzyMatch(guess: string, targets: string[]): boolean {
  return targets.some((target) => fuzzyScore(guess, target) >= 400);
}

export function suggestMatches(
  query: string,
  options: readonly string[],
  limit = 8,
): string[] {
  const q = normalizeGuess(query);
  if (!q) return [];

  const scored: { label: string; score: number }[] = [];
  for (const option of options) {
    const score = fuzzyScore(query, option);
    if (score < 0) continue;
    scored.push({ label: option, score });
  }

  scored.sort((a, b) => b.score - a.score || a.label.localeCompare(b.label));

  const seen = new Set<string>();
  const out: string[] = [];
  for (const item of scored) {
    if (seen.has(item.label)) continue;
    seen.add(item.label);
    out.push(item.label);
    if (out.length >= limit) break;
  }
  return out;
}
