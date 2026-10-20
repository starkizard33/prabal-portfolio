import { describe, expect, test } from "vitest";
import {
  GHOST_AUTO_STOP_MS,
  GHOST_MAX_MS,
  GHOST_MIN_HOLD_MS,
  GHOST_MIN_MS,
  pickTargetMs,
  rankByError,
  scoreAttempt,
  shouldIgnoreStop,
} from "./ghostSecond";

describe("Ghost Second scoring", () => {
  test("picks a shared target between 0.5s and 10.5s in 0.1s steps", () => {
    for (let i = 0; i <= 100; i += 1) {
      const ms = pickTargetMs(() => i / 100);
      expect(ms).toBeGreaterThanOrEqual(GHOST_MIN_MS);
      expect(ms).toBeLessThanOrEqual(GHOST_MAX_MS);
      expect(ms % 100).toBe(0);
    }
    expect(pickTargetMs(() => 0)).toBe(500);
    expect(pickTargetMs(() => 0.999)).toBe(10500);
  });

  test("score is absolute millisecond miss, capped at 30s", () => {
    expect(scoreAttempt(4700, 5000)).toBe(300);
    expect(scoreAttempt(5300, 5000)).toBe(300);
    expect(scoreAttempt(50_000, 5000)).toBe(GHOST_AUTO_STOP_MS - 5000);
  });

  test("ignores a stop that is too fast to be intentional", () => {
    expect(shouldIgnoreStop(GHOST_MIN_HOLD_MS - 1)).toBe(true);
    expect(shouldIgnoreStop(GHOST_MIN_HOLD_MS)).toBe(false);
  });

  test("lowest miss ranks first and ties share a rank", () => {
    const ranks = rankByError([
      { id: "a", errorMs: 400 },
      { id: "b", errorMs: 100 },
      { id: "c", errorMs: 100 },
    ]);
    expect(ranks.get("b")).toBe(1);
    expect(ranks.get("c")).toBe(1);
    expect(ranks.get("a")).toBe(3);
  });
});
