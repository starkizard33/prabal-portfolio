import type { Rank } from "../cards";
import type { StrategyAction, StrategyInput } from "./basic";

export type IllustriousInput = StrategyInput & { trueCount: number };

type UpCol = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "A";

function upCol(rank: Rank): UpCol {
  if (rank === "J" || rank === "Q" || rank === "K") return "10";
  if (rank === "10" || rank === "A") return rank;
  return rank as UpCol;
}

function isTenRank(rank: Rank): boolean {
  return rank === "10" || rank === "J" || rank === "Q" || rank === "K";
}

/** Insurance Illustrious #1: take at TC ≥ +3. */
export function shouldTakeInsurance(tc: number): boolean {
  return tc >= 3;
}

/**
 * Illustrious 18 play deviations (Hi-Lo, multi-deck S17 baseline).
 * Returns the deviation action when the index triggers; null = use basic strategy.
 * Insurance is via {@link shouldTakeInsurance}.
 *
 * Positive-index plays: deviate when TC ≥ index.
 * Negative-index plays (stand-vs-weak stiffs): hit when TC < stand-index.
 */
export function illustriousDeviation(
  input: IllustriousInput,
): StrategyAction | null {
  const up = upCol(input.dealerUp);
  const tc = input.trueCount;
  const t = input.playerTotal;

  if (
    input.canSplit &&
    input.pairRank !== undefined &&
    isTenRank(input.pairRank) &&
    !input.soft
  ) {
    if (up === "5" && tc >= 5) return "P";
    if (up === "6" && tc >= 4) return "P";
  }

  if (input.soft) return null;

  // Stand / double deviations (TC ≥ index)
  if (t === 16 && up === "10" && tc >= 0) return "S";
  if (t === 15 && up === "10" && tc >= 4) return "S";
  if (t === 10 && up === "10" && tc >= 4) return "D";
  if (t === 12 && up === "3" && tc >= 2) return "S";
  if (t === 12 && up === "2" && tc >= 3) return "S";
  if (t === 11 && up === "A" && tc >= 1) return "D";
  if (t === 9 && up === "2" && tc >= 1) return "D";
  if (t === 10 && up === "A" && tc >= 4) return "D";
  if (t === 9 && up === "7" && tc >= 3) return "D";
  if (t === 16 && up === "9" && tc >= 5) return "S";

  // Negative indices: hit stiffs when TC is below the stand index
  if (t === 13 && up === "2" && tc < -1) return "H";
  if (t === 12 && up === "4" && tc < 0) return "H";
  if (t === 12 && up === "5" && tc < -2) return "H";
  if (t === 12 && up === "6" && tc < -1) return "H";
  if (t === 13 && up === "3" && tc < -2) return "H";

  return null;
}
