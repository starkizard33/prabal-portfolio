"use client";

import { isRed } from "@/casino/engine/roulette";

/** Standard European wheel order clockwise from 0. */
export const EUROPEAN_ORDER = [
  0, 32, 15, 19, 4, 21, 2, 25, 17, 34, 6, 27, 13, 36, 11, 30, 8, 23, 10, 5, 24,
  16, 33, 1, 20, 14, 31, 9, 22, 18, 29, 7, 28, 12, 35, 3, 26,
] as const;

const SEGMENT = 360 / EUROPEAN_ORDER.length;

function pocketColor(n: number): string {
  if (n === 0) return "var(--sz-jade-dim)";
  return isRed(n) ? "#b91c1c" : "#0b1220";
}

function conicStops(): string {
  return EUROPEAN_ORDER.map((n, i) => {
    const start = i * SEGMENT;
    const end = (i + 1) * SEGMENT;
    const c = pocketColor(n);
    return `${c} ${start}deg ${end}deg`;
  }).join(", ");
}

type WheelProps = {
  spinning: boolean;
  rotationDeg: number;
  lastResult: number | null;
};

export function Wheel({ spinning, rotationDeg, lastResult }: WheelProps) {
  return (
    <div className="relative mx-auto aspect-square w-full max-w-[280px] md:max-w-[320px]">
      <div
        className="pointer-events-none absolute left-1/2 top-0 z-20 -translate-x-1/2"
        aria-hidden
      >
        <div className="h-0 w-0 border-l-[8px] border-r-[8px] border-t-[16px] border-l-transparent border-r-transparent border-t-sz-gold drop-shadow-[0_0_8px_rgba(240,196,92,0.55)]" />
      </div>

      <div
        className={`roulette-wheel relative h-full w-full rounded-full border-2 border-sz-jade/35 shadow-[0_0_48px_rgba(61,255,154,0.12),inset_0_0_40px_rgba(0,0,0,0.55)] ${
          spinning ? "roulette-wheel-spinning" : ""
        }`}
        style={{
          background: `conic-gradient(from -${SEGMENT / 2}deg, ${conicStops()})`,
          transform: `rotate(${rotationDeg}deg)`,
          transition: spinning
            ? "transform 2.8s cubic-bezier(0.12, 0.75, 0.18, 1)"
            : "none",
        }}
      >
        <div className="absolute inset-[18%] rounded-full border border-sz-jade/25 bg-[radial-gradient(circle_at_40%_35%,rgba(61,255,154,0.18),transparent_55%),radial-gradient(circle_at_50%_50%,#0f1620_0%,#070b10_70%)] shadow-[inset_0_0_24px_rgba(61,255,154,0.08)]" />
        <div className="absolute inset-[42%] rounded-full border border-sz-gold/40 bg-sz-void shadow-[0_0_16px_rgba(240,196,92,0.25)]" />
        <div
          className={`roulette-ball absolute left-1/2 top-[10%] z-10 h-2.5 w-2.5 -translate-x-1/2 rounded-full bg-sz-mist shadow-[0_0_10px_rgba(215,231,223,0.85)] ${
            spinning ? "roulette-ball-spin" : ""
          }`}
        />
      </div>

      <div className="mt-4 text-center">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sz-mist/45">
          Result
        </p>
        <p
          className={`display mt-1 text-3xl font-extrabold tabular-nums ${
            lastResult === null
              ? "text-sz-mist/35"
              : lastResult === 0
                ? "text-sz-jade"
                : isRed(lastResult)
                  ? "text-sz-ember"
                  : "text-sz-mist"
          }`}
        >
          {lastResult === null ? "—" : lastResult}
        </p>
      </div>
    </div>
  );
}

/** Degrees to land the given pocket under the top pointer. */
export function rotationForResult(result: number, spins = 5): number {
  const index = EUROPEAN_ORDER.indexOf(result as (typeof EUROPEAN_ORDER)[number]);
  const pocketCenter = index * SEGMENT;
  return spins * 360 + (360 - pocketCenter);
}
