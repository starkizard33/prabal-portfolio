import { describe, expect, it } from "vitest";
import {
  SCORE,
  awardGuessPoints,
  scoreLadderPreview,
} from "@/components/starkizard/games/scoring";

describe("awardGuessPoints", () => {
  it("awards base on a first-try with no streak", () => {
    expect(awardGuessPoints(0, 0)).toBe(SCORE.base);
  });

  it("subtracts one step penalty per miss", () => {
    expect(awardGuessPoints(1, 0)).toBe(SCORE.base - SCORE.stepPenalty);
    expect(awardGuessPoints(2, 0)).toBe(SCORE.base - SCORE.stepPenalty * 2);
  });

  it("floors at minAward before streak", () => {
    expect(awardGuessPoints(10, 0)).toBe(SCORE.minAward);
  });

  it("adds streak bonus after the ladder", () => {
    expect(awardGuessPoints(0, 3)).toBe(SCORE.base + 3 * SCORE.streakBonus);
    expect(awardGuessPoints(2, 2)).toBe(
      SCORE.base - 2 * SCORE.stepPenalty + 2 * SCORE.streakBonus,
    );
  });

  it("prints the shared ladder", () => {
    expect(scoreLadderPreview()).toBe("100 → 80 → 60 → 40 → 20");
  });
});
