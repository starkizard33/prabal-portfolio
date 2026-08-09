export type Suit = "S" | "H" | "D" | "C";
export type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

export type Card = { suit: Suit; rank: Rank; id: string };

export const SUITS: readonly Suit[] = ["S", "H", "D", "C"];
export const RANKS: readonly Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

export function blackjackValue(rank: Rank): number {
  if (rank === "A") return 11;
  if (rank === "J" || rank === "Q" || rank === "K") return 10;
  return Number(rank);
}

export function buildSingleDeck(deckIndex = 0): Card[] {
  return SUITS.flatMap((suit) =>
    RANKS.map((rank) => ({
      suit,
      rank,
      id: `${deckIndex}-${rank}${suit}`,
    })),
  );
}
