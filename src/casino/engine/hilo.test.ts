import { describe, expect, test } from "vitest";
import { hiLoDelta, trueCount } from "./hilo";

describe("hi-lo", () => {
  test("hi-lo delta for ten is -1", () => {
    expect(hiLoDelta("K")).toBe(-1);
  });

  test("low cards +1, neutral 0, ace -1", () => {
    expect(hiLoDelta("5")).toBe(1);
    expect(hiLoDelta("8")).toBe(0);
    expect(hiLoDelta("A")).toBe(-1);
  });

  test("true count divides running by decks remaining", () => {
    // 104 cards = 2 decks; RC +4 → TC +2
    expect(trueCount(4, 104)).toBe(2);
  });
});
