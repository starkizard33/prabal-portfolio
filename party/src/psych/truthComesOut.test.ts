import { describe, expect, test } from "vitest";
import { TRUTH_COMES_OUT_NSFW_PROMPTS } from "./truthComesOutNsfw";
import {
  TRUTH_COMES_OUT_PROMPTS,
  fillPrompt,
  pickPrompts,
} from "./truthComesOut";

function assertPromptShape(p: { template: string }) {
  const nameCount = (p.template.match(/\{name\}/g) || []).length;
  const name2Count = (p.template.match(/\{name2\}/g) || []).length;
  expect(name2Count).toBeLessThanOrEqual(1);
  expect(nameCount + name2Count).toBeGreaterThanOrEqual(1);
  expect(nameCount + name2Count).toBeLessThanOrEqual(2);
  expect(p.template.toLowerCase()).not.toMatch(
    /whole group|this group|who(?:'s| is) most likely|among (?:us|you all)/,
  );
  expect(p.template.toLowerCase()).not.toMatch(
    /\b(describe|transcribe|narrate)\b/,
  );
  // No A-or-B / pick-one-of-two player choices
  expect(p.template).not.toMatch(
    /\b(or \{name2\}|\{name\} or \{name2\}|worse rizz:|who gets more)\b/i,
  );
}

describe("truthComesOut prompts", () => {
  test("every prompt uses at most two name slots", () => {
    for (const p of TRUTH_COMES_OUT_PROMPTS) assertPromptShape(p);
  });

  test("NSFW deck prompts follow the same spotlight rules", () => {
    expect(TRUTH_COMES_OUT_NSFW_PROMPTS.length).toBeGreaterThanOrEqual(30);
    for (const p of TRUTH_COMES_OUT_NSFW_PROMPTS) assertPromptShape(p);
  });

  test("pickPrompts can draw from NSFW pool", () => {
    expect(pickPrompts(7, 9, TRUTH_COMES_OUT_NSFW_PROMPTS)).toHaveLength(7);
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
