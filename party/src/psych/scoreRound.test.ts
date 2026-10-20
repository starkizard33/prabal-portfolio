import { describe, expect, test } from "vitest";
import { pointsFromVotes, PSYCH_POINT } from "./scoreRound";

describe("Psych points", () => {
  test("a vote for someone's answer is one point for the author", () => {
    const scores = pointsFromVotes({
      votes: [
        { voterId: "a", answerId: "b-answer" },
        { voterId: "b", answerId: "b-answer" },
      ],
      answers: [{ answerId: "b-answer", authorId: "bo" }],
    });
    expect(scores.get("bo")).toBe(2 * PSYCH_POINT);
    expect(scores.has("a")).toBe(false);
  });

  test("picking the true fact scores the voter, not a fake author", () => {
    const scores = pointsFromVotes({
      votes: [
        { voterId: "ada", answerId: "fact-truth" },
        { voterId: "bo", answerId: "cy-bluff" },
      ],
      answers: [{ answerId: "cy-bluff", authorId: "cy" }],
      truthId: "fact-truth",
    });
    expect(scores.get("ada")).toBe(1);
    expect(scores.get("cy")).toBe(1);
    expect(scores.has("bo")).toBe(false);
  });
});
