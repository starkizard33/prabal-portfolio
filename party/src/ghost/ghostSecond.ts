/** Ghost Second — blind duration guess. Server owns the clock. */

export const GHOST_MIN_MS = 500;
export const GHOST_MAX_MS = 10_500;
export const GHOST_STEP_MS = 100;
export const GHOST_AUTO_STOP_MS = 30_000;
/** Ignore a second tap this soon — phone double-taps. */
export const GHOST_MIN_HOLD_MS = 180;
/** Never-started players rank behind a full 30s miss. */
export const GHOST_MISSED_MS = GHOST_AUTO_STOP_MS + 1;

export function pickTargetMs(random: () => number = Math.random): number {
  const steps = (GHOST_MAX_MS - GHOST_MIN_MS) / GHOST_STEP_MS;
  const index = Math.min(steps, Math.floor(random() * (steps + 1)));
  return GHOST_MIN_MS + index * GHOST_STEP_MS;
}

export function scoreAttempt(elapsedMs: number, targetMs: number): number {
  const capped = Math.min(Math.max(0, elapsedMs), GHOST_AUTO_STOP_MS);
  return Math.abs(capped - targetMs);
}

export function shouldIgnoreStop(elapsedMs: number): boolean {
  return elapsedMs < GHOST_MIN_HOLD_MS;
}

/** Phone clock, unless it claims a stop the server could not have seen. */
export function trustedElapsed(
  clientMs: number | undefined,
  serverMs: number,
): number {
  const server = Math.min(Math.max(0, serverMs), GHOST_AUTO_STOP_MS);
  if (clientMs == null || !Number.isFinite(clientMs)) return server;
  const claimed = Math.round(clientMs);
  if (claimed < GHOST_MIN_HOLD_MS || claimed > GHOST_AUTO_STOP_MS) return server;
  if (server - claimed > 2_000) return server;
  return claimed;
}

export function formatStop(elapsedMs: number): string {
  return `${(elapsedMs / 1000).toFixed(3)} seconds`;
}

export function rankByError(
  entries: { id: string; errorMs: number }[],
): Map<string, number> {
  const sorted = [...entries].sort(
    (a, b) => a.errorMs - b.errorMs || a.id.localeCompare(b.id),
  );
  const ranks = new Map<string, number>();
  for (let i = 0; i < sorted.length; i += 1) {
    const prev = sorted[i - 1];
    const rank =
      prev && prev.errorMs === sorted[i]!.errorMs
        ? ranks.get(prev.id)!
        : i + 1;
    ranks.set(sorted[i]!.id, rank);
  }
  return ranks;
}

export function formatTarget(targetMs: number): string {
  return `${(targetMs / 1000).toFixed(3)} seconds`;
}
