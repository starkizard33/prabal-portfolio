import { describe, expect, it } from "vitest";
import {
  buildGates,
  densifySmoothPath,
  ensureClosed,
  initialLapState,
  nearestOnTrack,
  updateLapGates,
} from "./circuitTrack";

const square = densifySmoothPath(
  ensureClosed([
    { x: 0, y: 0 },
    { x: 200, y: 0 },
    { x: 200, y: 200 },
    { x: 0, y: 200 },
    { x: 0, y: 0 },
  ]),
);

describe("nearestOnTrack", () => {
  it("should find a nearby ribbon point", () => {
    const n = nearestOnTrack(square, 100, 8);
    expect(n.dist).toBeLessThan(12);
  });
});

describe("updateLapGates", () => {
  it("should require ordered sectors before SF counts a lap", () => {
    const gates = buildGates(square, 4, 40);
    let state = initialLapState();

    // At SF while latched — no lap
    let r = updateLapGates(state, gates, gates[0].x, gates[0].y);
    expect(r.lapCompleted).toBe(false);

    // Leave SF
    state = updateLapGates(state, gates, 9999, 9999).state;
    expect(state.sfLatched).toBe(false);

    // Hit SF early — still next is 1, so this is ignored (wrong target)
    r = updateLapGates(state, gates, gates[0].x, gates[0].y);
    expect(r.lapCompleted).toBe(false);
    expect(r.state.nextIndex).toBe(1);

    // Clear 1 → 2 → 3
    for (const idx of [1, 2, 3]) {
      r = updateLapGates(state, gates, gates[idx].x, gates[idx].y);
      expect(r.hitIndex).toBe(idx);
      state = r.state;
    }
    expect(state.nextIndex).toBe(0);

    // Must leave then re-enter SF
    state = updateLapGates(state, gates, 9999, 9999).state;
    r = updateLapGates(state, gates, gates[0].x, gates[0].y);
    expect(r.lapCompleted).toBe(true);
    expect(r.state.completedLaps).toBe(1);
    expect(r.state.nextIndex).toBe(1);
  });

  it("should ignore out-of-order sectors", () => {
    const gates = buildGates(square, 4, 40);
    let state = initialLapState();
    state = updateLapGates(state, gates, 9999, 9999).state;
    const skip = updateLapGates(state, gates, gates[2].x, gates[2].y);
    expect(skip.state.nextIndex).toBe(1);
    expect(skip.hitIndex).toBeNull();
  });
});
