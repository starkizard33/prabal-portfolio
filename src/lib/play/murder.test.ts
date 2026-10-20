import { describe, expect, test } from "vitest";
import { dealRoles, murdererCount, murderWinner } from "./murder";

describe("Murder roles", () => {
  test("scales murderers with the table", () => {
    expect(murdererCount(3)).toBe(0);
    expect(murdererCount(4)).toBe(1);
    expect(murdererCount(7)).toBe(1);
    expect(murdererCount(8)).toBe(2);
    expect(murdererCount(10)).toBe(2);
    expect(murdererCount(11)).toBe(3);
    expect(murdererCount(16)).toBe(3);
    expect(murdererCount(17)).toBe(4);
    expect(murdererCount(21)).toBe(5);
    expect(murdererCount(26)).toBe(6);
    expect(murdererCount(30)).toBe(6);
    expect(murdererCount(31)).toBe(0);
  });

  test("deals the right number of living murderers", () => {
    const seats = dealRoles(
      ["A", "B", "C", "D", "E", "F", "G", "H"],
      () => 0,
    );
    expect(seats.filter((seat) => seat.role === "murderer")).toHaveLength(2);
    expect(seats.every((seat) => seat.alive)).toBe(true);
  });

  test("civilians win when every murderer is dead", () => {
    expect(
      murderWinner([
        { role: "murderer", alive: false },
        { role: "civilian", alive: true },
      ]),
    ).toBe("civilian");
  });

  test("murderers win when every civilian is dead", () => {
    expect(
      murderWinner([
        { role: "murderer", alive: true },
        { role: "civilian", alive: false },
      ]),
    ).toBe("murderer");
  });

  test("the game continues while both sides have someone alive", () => {
    expect(
      murderWinner([
        { role: "murderer", alive: true },
        { role: "civilian", alive: true },
      ]),
    ).toBeNull();
  });
});
