import { describe, expect, test } from "vitest";
import { IS_THAT_A_FACT_PROMPTS } from "./isThatAFact";
import { isOneWordFact } from "./scoreRound";
import { pickPrompts } from "./truthComesOut";

describe("Is That a Fact", () => {
  test("every answer is one word and not written in the question", () => {
    const ids = new Set<string>();
    const answers = new Set<string>();
    expect(IS_THAT_A_FACT_PROMPTS.length).toBeGreaterThanOrEqual(100);
    for (const prompt of IS_THAT_A_FACT_PROMPTS) {
      expect(ids.has(prompt.id)).toBe(false);
      ids.add(prompt.id);
      const answer = prompt.factAnswer ?? "";
      expect(isOneWordFact(answer)).toBe(true);
      expect(answers.has(answer.toLowerCase())).toBe(false);
      answers.add(answer.toLowerCase());
      expect(prompt.template.toLowerCase().includes(answer.toLowerCase())).toBe(
        false,
      );
    }
  });

  test("a match can draw seven different questions", () => {
    const round = pickPrompts(7, 42, IS_THAT_A_FACT_PROMPTS);
    expect(new Set(round.map((prompt) => prompt.id)).size).toBe(7);
    expect(round.every((prompt) => prompt.factAnswer)).toBe(true);
  });
});
