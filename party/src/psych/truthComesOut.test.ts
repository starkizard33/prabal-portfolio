import { describe, expect, test } from "vitest";
import {
  TRUTH_COMES_OUT_PROMPTS,
  fillPrompt,
  pickPrompts,
} from "./truthComesOut";

describe("truthComesOut prompts", () => {
  test("every prompt uses at most two name slots", () => {
    for (const p of TRUTH_COMES_OUT_PROMPTS) {
      const nameCount = (p.template.match(/\{name\}/g) || []).length;
      const name2Count = (p.template.match(/\{name2\}/g) || []).length;
      expect(name2Count).toBeLessThanOrEqual(1);
      expect(nameCount + name2Count).toBeGreaterThanOrEqual(1);
      expect(nameCount + name2Count).toBeLessThanOrEqual(2);
      expect(p.template.toLowerCase()).not.toMatch(
        /whole group|this group|who(?:'s| is) most likely|among (?:us|you all)/,
      );
    }
  });

  test("fillPrompt substitutes one name", () => {
    const out = fillPrompt("Roast {name}.", ["Ada", "Bob"], 0);
    expect(out).toBe("Roast Ada.");
  });

  test("fillPrompt picks two distinct names when possible", () => {
    const out = fillPrompt(
      "{name} vs {name2}",
      ["Ada", "Bob", "Cara"],
      1,
    );
    expect(out).toMatch(/^(Ada|Bob|Cara) vs (Ada|Bob|Cara)$/);
    const [left, right] = out.split(" vs ");
    expect(left).not.toBe(right);
  });

  test("pickPrompts returns requested count", () => {
    expect(pickPrompts(7, 42)).toHaveLength(7);
  });
});
