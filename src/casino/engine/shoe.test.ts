import { describe, expect, test } from "vitest";
import { createShoe, draw, needsShuffle, cardsRemaining } from "./shoe";

describe("shoe", () => {
  test("6-deck shoe has 312 cards", () => {
    const shoe = createShoe(6, () => 0.5);
    expect(shoe.cards.length).toBe(312);
  });

  test("draw reduces remaining", () => {
    let shoe = createShoe(6, () => 0.1);
    const r = draw(shoe, 2);
    expect(r.cards).toHaveLength(2);
    expect(cardsRemaining(r.shoe)).toBe(310);
  });

  test("needsShuffle at penetration", () => {
    let shoe = createShoe(1, () => 0.2); // 52 cards
    const r = draw(shoe, 40);
    expect(needsShuffle(r.shoe, 15)).toBe(true);
  });
});
