import { describe, expect, test } from "vitest";
import { createShoe } from "./shoe";
import {
  applyAction,
  createBjRound,
  handTotal,
  isBlackjack,
  settlePayouts,
} from "./blackjack";
import type { Card } from "./cards";
import type { Shoe } from "./shoe";

const c = (rank: Card["rank"], suit: Card["suit"] = "S"): Card => ({
  rank,
  suit,
  id: `${rank}${suit}`,
});

function shoeWith(...front: Card[]): Shoe {
  const rest = createShoe(1, () => 0.5).cards;
  const cards = [...front, ...rest];
  return { cards, discard: [], initialCount: cards.length };
}

describe("blackjack", () => {
  test("handTotal soft ace", () => {
    expect(handTotal([c("A"), c("6")])).toEqual({ total: 17, soft: true });
  });

  test("detects blackjack", () => {
    expect(isBlackjack([c("A"), c("K")])).toBe(true);
  });

  test("player blackjack pays 3:2 when dealer has none", () => {
    // Deal order: P, D, P, D → P A, D 9, P K, D 5
    const shoe = shoeWith(c("A"), c("9"), c("K"), c("5"));
    const state = createBjRound(shoe, 100);
    expect(state.phase).toBe("settled");
    expect(state.message.toLowerCase()).toMatch(/blackjack/);
    expect(settlePayouts(state)).toBe(150);
  });

  test("surrender marks half loss", () => {
    const shoe = shoeWith(c("10"), c("9"), c("6"), c("8"));
    let s = createBjRound(shoe, 50);
    s = applyAction(s, "surrender");
    expect(s.playerHands[0].surrendered).toBe(true);
    expect(s.phase).toBe("settled");
    expect(settlePayouts(s)).toBe(-25);
  });

  test("double doubles bet and draws one", () => {
    // P 5+6 vs D 9+8; double draws 4 → 15
    const shoe = shoeWith(c("5"), c("9"), c("6"), c("8"), c("4"));
    let s = createBjRound(shoe, 50);
    expect(s.phase).toBe("player");
    s = applyAction(s, "double");
    expect(s.playerHands[0].doubled).toBe(true);
    expect(s.playerHands[0].bet).toBe(100);
    expect(s.playerHands[0].cards).toHaveLength(3);
    expect(s.playerHands[0].cards[2].rank).toBe("4");
  });

  test("split pairs creates two hands", () => {
    // P 8+8 vs D 6+9; post-split cards 2 then 3
    const shoe = shoeWith(c("8"), c("6"), c("8"), c("9"), c("2"), c("3"));
    let s = createBjRound(shoe, 40);
    expect(s.phase).toBe("player");
    s = applyAction(s, "split");
    expect(s.playerHands).toHaveLength(2);
    expect(s.playerHands[0].cards[0].rank).toBe("8");
    expect(s.playerHands[0].cards).toHaveLength(2);
    expect(s.playerHands[1].cards[0].rank).toBe("8");
    expect(s.playerHands[1].cards).toHaveLength(2);
    expect(s.playerHands[0].bet).toBe(40);
    expect(s.playerHands[1].bet).toBe(40);
  });

  test("dealer stands on soft 17", () => {
    // P 10+9 (=19); D up 6 hole A → soft 17, S17 stands
    const shoe = shoeWith(c("10"), c("6"), c("9"), c("A"));
    let s = createBjRound(shoe, 20);
    expect(s.phase).toBe("player");
    s = applyAction(s, "stand");
    expect(s.phase).toBe("settled");
    expect(s.dealer).toHaveLength(2);
    expect(handTotal(s.dealer)).toEqual({ total: 17, soft: true });
    expect(settlePayouts(s)).toBe(20);
  });

  test("insurance taken + dealer BJ pays 2:1", () => {
    // P 9+7 vs D A+K (BJ); offer insurance before peek
    const shoe = shoeWith(c("9"), c("A"), c("7"), c("K"));
    let s = createBjRound(shoe, 100);
    expect(s.phase).toBe("insurance");
    s = applyAction(s, "insurance");
    expect(s.phase).toBe("settled");
    expect(s.insuranceBet).toBe(50);
    // Main −100 + insurance +100 (2:1 on 50)
    expect(settlePayouts(s)).toBe(0);
  });

  test("decline insurance + dealer BJ loses main bet", () => {
    const shoe = shoeWith(c("9"), c("A"), c("7"), c("K"));
    let s = createBjRound(shoe, 100);
    expect(s.phase).toBe("insurance");
    s = applyAction(s, "stand"); // declines insurance, then peek settles
    expect(s.phase).toBe("settled");
    expect(s.insuranceBet).toBe(0);
    expect(settlePayouts(s)).toBe(-100);
  });

  test("split then 21 auto-advances", () => {
    // P 10+10 vs D 6+9; split draws A (21) then 5
    const shoe = shoeWith(c("10"), c("6"), c("10"), c("9"), c("A"), c("5"));
    let s = createBjRound(shoe, 40);
    s = applyAction(s, "split");
    expect(s.playerHands).toHaveLength(2);
    expect(handTotal(s.playerHands[0].cards).total).toBe(21);
    expect(s.activeHand).toBe(1);
    expect(s.phase).toBe("player");
  });
});
