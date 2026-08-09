export type RouletteBetKind =
  | "straight"
  | "red"
  | "black"
  | "odd"
  | "even"
  | "low"
  | "high"
  | "dozen"
  | "column";

export type RouletteBet = {
  kind: RouletteBetKind;
  value?: number;
  amount: number;
};

/** European single-zero red numbers. */
export const RED_NUMBERS = new Set([
  1, 3, 5, 7, 9, 12, 14, 16, 18, 19, 21, 23, 25, 27, 30, 32, 34, 36,
]);

export function isRed(n: number): boolean {
  return RED_NUMBERS.has(n);
}

export function isBlack(n: number): boolean {
  return n >= 1 && n <= 36 && !RED_NUMBERS.has(n);
}

/** 1st dozen 1–12, 2nd 13–24, 3rd 25–36; null for 0. */
export function dozenOf(n: number): 1 | 2 | 3 | null {
  if (n < 1 || n > 36) return null;
  if (n <= 12) return 1;
  if (n <= 24) return 2;
  return 3;
}

/** Column by n % 3: 1→col1, 2→col2, 0→col3; null for 0. */
export function columnOf(n: number): 1 | 2 | 3 | null {
  if (n < 1 || n > 36) return null;
  const mod = n % 3;
  if (mod === 1) return 1;
  if (mod === 2) return 2;
  return 3;
}

function defaultRng(): number {
  return Math.random();
}

/** Spin European wheel; returns 0–36 inclusive. `rng` should return [0, 1). */
export function spinEuropean(rng: () => number = defaultRng): number {
  return Math.floor(rng() * 37);
}

function wins(bet: RouletteBet, result: number): boolean {
  switch (bet.kind) {
    case "straight":
      return bet.value === result;
    case "red":
      return isRed(result);
    case "black":
      return isBlack(result);
    case "odd":
      return result >= 1 && result % 2 === 1;
    case "even":
      return result >= 1 && result % 2 === 0;
    case "low":
      return result >= 1 && result <= 18;
    case "high":
      return result >= 19 && result <= 36;
    case "dozen":
      return dozenOf(result) === bet.value;
    case "column":
      return columnOf(result) === bet.value;
  }
}

/** Profit multiplier for a winning bet (excludes stake return). */
function profitOdds(kind: RouletteBetKind): number {
  switch (kind) {
    case "straight":
      return 35;
    case "dozen":
    case "column":
      return 2;
    default:
      return 1;
  }
}

/**
 * Settle bets against a spun result.
 * `payout` = chips returned (stake + profit for winners).
 * `net` = payout − total stake.
 */
export function settleRoulette(
  bets: RouletteBet[],
  result: number,
): { payout: number; net: number } {
  let payout = 0;
  let stake = 0;
  for (const bet of bets) {
    stake += bet.amount;
    if (wins(bet, result)) {
      payout += bet.amount + bet.amount * profitOdds(bet.kind);
    }
  }
  return { payout, net: payout - stake };
}
