import { describe, expect, test } from "vitest";
import { votersByAnswer } from "./revealVotes";

describe("Psych vote reveal", () => {
  test("lists who picked each answer", () => {
    const grouped = votersByAnswer([
      { voterName: "Ada", answerId: "a1" },
      { voterName: "Bo", answerId: "a2" },
      { voterName: "Cy", answerId: "a1" },
      { voterName: "Dee", answerId: "" },
    ]);
    expect(grouped.get("a1")).toEqual(["Ada", "Cy"]);
    expect(grouped.get("a2")).toEqual(["Bo"]);
    expect(grouped.has("")).toBe(false);
  });
});