import { describe, expect, test } from "vitest";
import { basicStrategy } from "./basic";
import {
  illustriousDeviation,
  shouldTakeInsurance,
} from "./illustrious18";

describe("basic strategy (multi-deck S17 DAS LS)", () => {
  test("basic: 16 vs 10 hits when cannot surrender preference encoded as H or R", () => {
    const a = basicStrategy({
      playerTotal: 16,
      soft: false,
      dealerUp: "10",
      canDouble: false,
      canSplit: false,
      canSurrender: true,
    });
    expect(["H", "R"]).toContain(a);
  });

  test("pair of aces always splits", () => {
    const a = basicStrategy({
      playerTotal: 12,
      soft: true,
      pairRank: "A",
      dealerUp: "10",
      canDouble: true,
      canSplit: true,
      canSurrender: false,
    });
    expect(a).toBe("P");
  });

  test("soft 18 doubles vs 6 when allowed", () => {
    const a = basicStrategy({
      playerTotal: 18,
      soft: true,
      dealerUp: "6",
      canDouble: true,
      canSplit: false,
      canSurrender: false,
    });
    expect(a).toBe("D");
  });
});

describe("illustrious 18", () => {
  test("illustrious: 16 vs 10 stands at TC >= 0", () => {
    const d = illustriousDeviation({
      playerTotal: 16,
      soft: false,
      dealerUp: "10",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      trueCount: 0,
    });
    expect(d).toBe("S");
  });

  test("insurance at TC >= 3", () => {
    expect(shouldTakeInsurance(3)).toBe(true);
    expect(shouldTakeInsurance(2)).toBe(false);
  });

  test("no deviation when below index", () => {
    const d = illustriousDeviation({
      playerTotal: 16,
      soft: false,
      dealerUp: "10",
      canDouble: false,
      canSplit: false,
      canSurrender: false,
      trueCount: -1,
    });
    expect(d).toBeNull();
  });
});
