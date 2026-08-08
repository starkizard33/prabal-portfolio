/** Shared guess-game scoring (Pokémon, LP lyrics, LP audio). */

export const SCORE = {
  /** First-try correct award before streak. */
  base: 100,
  /** Subtracted once per miss / hint unlock / longer-clip skip. */
  stepPenalty: 20,
  /** Added once per current streak (before this win). */
  streakBonus: 10,
  /** Floor when you still land the answer. */
  minAward: 20,
} as const;

/**
 * Points for a correct answer.
 * @param stepsUsed 0 = first try; each miss/hint/clip-skip increments by 1
 * @param streak current streak before applying this win
 */
export function awardGuessPoints(stepsUsed: number, streak: number): number {
  const steps = Math.max(0, Math.floor(stepsUsed));
  const ladder = Math.max(SCORE.minAward, SCORE.base - steps * SCORE.stepPenalty);
  return ladder + Math.max(0, streak) * SCORE.streakBonus;
}

/** Human-readable ladder without streak: 100 → 80 → 60 → 40 → 20 */
export function scoreLadderPreview(maxSteps = 4): string {
  const parts: number[] = [];
  for (let i = 0; i <= maxSteps; i += 1) {
    parts.push(Math.max(SCORE.minAward, SCORE.base - i * SCORE.stepPenalty));
  }
  return parts.join(" → ");
}
