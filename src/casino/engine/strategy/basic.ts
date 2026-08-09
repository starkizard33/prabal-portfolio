import type { Rank } from "../cards";

export type StrategyAction = "H" | "S" | "D" | "P" | "R";

export type StrategyInput = {
  playerTotal: number;
  soft: boolean;
  pairRank?: Rank;
  dealerUp: Rank;
  canDouble: boolean;
  canSplit: boolean;
  canSurrender: boolean;
};

/** Chart cell: action plus soft double / surrender fallbacks. */
type Cell = StrategyAction | "Dh" | "Ds" | "Rh" | "Rp";

type UpCol = "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "10" | "A";

function upCol(rank: Rank): UpCol {
  if (rank === "J" || rank === "Q" || rank === "K") return "10";
  if (rank === "10" || rank === "A") return rank;
  return rank as UpCol;
}

function isTenRank(rank: Rank): boolean {
  return rank === "10" || rank === "J" || rank === "Q" || rank === "K";
}

function resolveCell(
  cell: Cell,
  flags: Pick<StrategyInput, "canDouble" | "canSurrender" | "canSplit">,
): StrategyAction {
  switch (cell) {
    case "Dh":
      return flags.canDouble ? "D" : "H";
    case "Ds":
      return flags.canDouble ? "D" : "S";
    case "Rh":
      return flags.canSurrender ? "R" : "H";
    case "Rp":
      if (flags.canSurrender) return "R";
      return flags.canSplit ? "P" : "H";
    case "P":
      return flags.canSplit ? "P" : "H";
    case "D":
      return flags.canDouble ? "D" : "H";
    case "R":
      return flags.canSurrender ? "R" : "H";
    default:
      return cell;
  }
}

/** Multi-deck S17 + DAS + late surrender — hard totals. */
const HARD: Record<number, Record<UpCol, Cell>> = {
  21: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  20: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  19: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  18: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  17: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  16: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "Rh", "10": "Rh", A: "Rh" },
  15: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "10": "Rh", A: "H" },
  14: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  13: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  12: { "2": "H", "3": "H", "4": "S", "5": "S", "6": "S", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  11: { "2": "Dh", "3": "Dh", "4": "Dh", "5": "Dh", "6": "Dh", "7": "Dh", "8": "Dh", "9": "Dh", "10": "Dh", A: "H" },
  10: { "2": "Dh", "3": "Dh", "4": "Dh", "5": "Dh", "6": "Dh", "7": "Dh", "8": "Dh", "9": "Dh", "10": "H", A: "H" },
  9: { "2": "H", "3": "Dh", "4": "Dh", "5": "Dh", "6": "Dh", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  8: { "2": "H", "3": "H", "4": "H", "5": "H", "6": "H", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  7: { "2": "H", "3": "H", "4": "H", "5": "H", "6": "H", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  6: { "2": "H", "3": "H", "4": "H", "5": "H", "6": "H", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  5: { "2": "H", "3": "H", "4": "H", "5": "H", "6": "H", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  4: { "2": "H", "3": "H", "4": "H", "5": "H", "6": "H", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
};

/** Soft totals (A + N). Keys are soft totals 13–21. */
const SOFT: Record<number, Record<UpCol, Cell>> = {
  21: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  20: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  19: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  18: { "2": "Ds", "3": "Ds", "4": "Ds", "5": "Ds", "6": "Ds", "7": "S", "8": "S", "9": "H", "10": "H", A: "H" },
  17: { "2": "H", "3": "Dh", "4": "Dh", "5": "Dh", "6": "Dh", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  16: { "2": "H", "3": "H", "4": "Dh", "5": "Dh", "6": "Dh", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  15: { "2": "H", "3": "H", "4": "Dh", "5": "Dh", "6": "Dh", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  14: { "2": "H", "3": "H", "4": "H", "5": "Dh", "6": "Dh", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  13: { "2": "H", "3": "H", "4": "H", "5": "Dh", "6": "Dh", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
};

/**
 * Pair chart. Tens share "T"; fives omit (hard 10).
 * Educational approximation of multi-deck S17 DAS LS (Wizard of Odds / Apprentice-equivalent).
 */
const PAIRS: Record<string, Record<UpCol, Cell>> = {
  A: { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "P", "9": "P", "10": "P", A: "P" },
  T: { "2": "S", "3": "S", "4": "S", "5": "S", "6": "S", "7": "S", "8": "S", "9": "S", "10": "S", A: "S" },
  "9": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "S", "8": "P", "9": "P", "10": "S", A: "S" },
  "8": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "P", "9": "P", "10": "P", A: "Rp" },
  "7": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "H", "9": "H", "10": "H", A: "H" },
  "6": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  "4": { "2": "H", "3": "H", "4": "H", "5": "P", "6": "P", "7": "H", "8": "H", "9": "H", "10": "H", A: "H" },
  "3": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "H", "9": "H", "10": "H", A: "H" },
  "2": { "2": "P", "3": "P", "4": "P", "5": "P", "6": "P", "7": "P", "8": "H", "9": "H", "10": "H", A: "H" },
};

function pairKey(rank: Rank): string | null {
  if (rank === "A") return "A";
  if (isTenRank(rank)) return "T";
  if (rank === "5") return null;
  return rank;
}

function hardOrSoft(input: StrategyInput, up: UpCol): StrategyAction {
  const flags = {
    canDouble: input.canDouble,
    canSurrender: input.canSurrender,
    canSplit: input.canSplit,
  };
  if (input.soft) {
    const row = SOFT[input.playerTotal] ?? SOFT[13];
    return resolveCell(row[up], flags);
  }
  const total = Math.min(21, Math.max(4, input.playerTotal));
  const row = HARD[total] ?? HARD[8];
  return resolveCell(row[up], flags);
}

/**
 * Multi-deck S17 + DAS + late surrender basic strategy.
 * Returns H/S/D/P/R. Unavailable double/surrender fall back via Dh/Ds/Rh/Rp encoding.
 */
export function basicStrategy(input: StrategyInput): StrategyAction {
  const up = upCol(input.dealerUp);
  const flags = {
    canDouble: input.canDouble,
    canSurrender: input.canSurrender,
    canSplit: input.canSplit,
  };

  if (input.canSplit && input.pairRank !== undefined) {
    const key = pairKey(input.pairRank);
    if (key !== null) {
      const cell = PAIRS[key][up];
      if (cell === "P" || cell === "Rp" || cell === "S") {
        return resolveCell(cell, flags);
      }
      // cell === "H": treat as hard total (e.g. 4s vs 2)
    }
    // 5,5 → hard 10 via fallthrough
  }

  return hardOrSoft(input, up);
}
