import { buildSingleDeck, type Card } from "./cards";

export type Shoe = {
  cards: Card[];
  discard: Card[];
  initialCount: number;
};

function defaultRng(): number {
  return Math.random();
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [result[i], result[j]] = [result[j], result[i]];
  }
  return result;
}

export function createShoe(decks = 6, rng: () => number = defaultRng): Shoe {
  const cards = Array.from({ length: decks }, (_, deckIndex) =>
    buildSingleDeck(deckIndex),
  ).flat();
  const shuffled = shuffle(cards, rng);
  return {
    cards: shuffled,
    discard: [],
    initialCount: shuffled.length,
  };
}

export function draw(
  shoe: Shoe,
  n: number,
): { cards: Card[]; shoe: Shoe } {
  const cards = shoe.cards.slice(0, n);
  return {
    cards,
    shoe: {
      ...shoe,
      cards: shoe.cards.slice(n),
    },
  };
}

export function cardsRemaining(shoe: Shoe): number {
  return shoe.cards.length;
}

export function needsShuffle(shoe: Shoe, cutRemaining = 75): boolean {
  return shoe.cards.length <= cutRemaining;
}

export function reshuffle(shoe: Shoe, rng: () => number = defaultRng): Shoe {
  const combined = [...shoe.cards, ...shoe.discard];
  return {
    cards: shuffle(combined, rng),
    discard: [],
    initialCount: combined.length,
  };
}
