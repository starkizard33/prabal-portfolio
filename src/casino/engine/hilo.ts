import type { Rank } from "./cards";

/** Hi-Lo tag: 2–6:+1, 7–9:0, T–A:−1 */
export function hiLoDelta(rank: Rank): number {
  if (rank === "A" || rank === "10" || rank === "J" || rank === "Q" || rank === "K") {
    return -1;
  }
  if (rank === "7" || rank === "8" || rank === "9") {
    return 0;
  }
  return 1;
}

/**
 * True count = running / decks remaining, truncated toward zero.
 * decksRemaining = cardsRemaining / 52.
 */
export function trueCount(running: number, cardsRemaining: number): number {
  if (cardsRemaining <= 0) return 0;
  const decksRemaining = cardsRemaining / 52;
  return Math.trunc(running / decksRemaining);
}
