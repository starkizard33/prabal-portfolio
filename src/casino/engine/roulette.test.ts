import { describe, expect, test } from "vitest";
import {
  columnOf,
  dozenOf,
  isBlack,
  isRed,
  settleRoulette,
  spinEuropean,
  type RouletteBet,
} from "./roulette";

describe("european roulette", () => {
  test("spinEuropean returns 0–36 from rng", () => {
    expect(spinEuropean(() => 0)).toBe(0);
    expect(spinEuropean(() => 36 / 37)).toBe(36);
  });

  test("red and black color map; 0 is neither", () => {
    expect(isRed(1)).toBe(true);
    expect(isBlack(1)).toBe(false);
    expect(isBlack(2)).toBe(true);
    expect(isRed(2)).toBe(false);
    expect(isRed(0)).toBe(false);
    expect(isBlack(0)).toBe(false);
  });

  test("dozen and column helpers", () => {
    expect(dozenOf(1)).toBe(1);
    expect(dozenOf(13)).toBe(2);
    expect(dozenOf(36)).toBe(3);
    expect(dozenOf(0)).toBe(null);
    expect(columnOf(1)).toBe(1);
    expect(columnOf(2)).toBe(2);
    expect(columnOf(3)).toBe(3);
    expect(columnOf(0)).toBe(null);
  });

  test("red wins even-money 1:1", () => {
    const bets: RouletteBet[] = [{ kind: "red", amount: 10 }];
    expect(settleRoulette(bets, 1)).toEqual({ payout: 20, net: 10 });
  });

  test("black wins; red loses on black result", () => {
    expect(settleRoulette([{ kind: "black", amount: 5 }], 2)).toEqual({
      payout: 10,
      net: 5,
    });
    expect(settleRoulette([{ kind: "red", amount: 5 }], 2)).toEqual({
      payout: 0,
      net: -5,
    });
  });

  test("zero loses even-money bets", () => {
    const bets: RouletteBet[] = [
      { kind: "red", amount: 10 },
      { kind: "black", amount: 10 },
      { kind: "odd", amount: 10 },
      { kind: "even", amount: 10 },
      { kind: "low", amount: 10 },
      { kind: "high", amount: 10 },
    ];
    expect(settleRoulette(bets, 0)).toEqual({ payout: 0, net: -60 });
  });

  test("straight pays 35:1", () => {
    expect(
      settleRoulette([{ kind: "straight", value: 17, amount: 10 }], 17),
    ).toEqual({ payout: 360, net: 350 });
    expect(
      settleRoulette([{ kind: "straight", value: 17, amount: 10 }], 16),
    ).toEqual({ payout: 0, net: -10 });
  });

  test("dozen and column pay 2:1", () => {
    expect(
      settleRoulette([{ kind: "dozen", value: 2, amount: 10 }], 17),
    ).toEqual({ payout: 30, net: 20 });
    expect(
      settleRoulette([{ kind: "column", value: 1, amount: 10 }], 1),
    ).toEqual({ payout: 30, net: 20 });
    expect(
      settleRoulette([{ kind: "dozen", value: 1, amount: 10 }], 0),
    ).toEqual({ payout: 0, net: -10 });
  });

  test("odd/even/low/high even-money", () => {
    expect(settleRoulette([{ kind: "odd", amount: 10 }], 17)).toEqual({
      payout: 20,
      net: 10,
    });
    expect(settleRoulette([{ kind: "even", amount: 10 }], 18)).toEqual({
      payout: 20,
      net: 10,
    });
    expect(settleRoulette([{ kind: "low", amount: 10 }], 18)).toEqual({
      payout: 20,
      net: 10,
    });
    expect(settleRoulette([{ kind: "high", amount: 10 }], 19)).toEqual({
      payout: 20,
      net: 10,
    });
  });
});
