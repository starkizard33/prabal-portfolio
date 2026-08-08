"use client";

import {
  isRed,
  settleRoulette,
  spinEuropean,
  type RouletteBet,
  type RouletteBetKind,
} from "@/casino/engine/roulette";
import { useCasinoSession } from "@/casino/session/CasinoSessionContext";
import { fireConfetti } from "@/components/fx/confetti";
import { useRef, useState } from "react";
import { rotationForResult, Wheel } from "./Wheel";

const CHIP_STEPS = [10, 25, 50, 100, 200] as const;
const SPIN_MS = 2800;

type BetKey = string;

function betKey(kind: RouletteBetKind, value?: number): BetKey {
  return value === undefined ? kind : `${kind}:${value}`;
}

function parseKey(key: BetKey): { kind: RouletteBetKind; value?: number } {
  const [kind, raw] = key.split(":") as [RouletteBetKind, string?];
  return raw === undefined ? { kind } : { kind, value: Number(raw) };
}

function toBets(map: Map<BetKey, number>): RouletteBet[] {
  return [...map.entries()].map(([key, amount]) => {
    const { kind, value } = parseKey(key);
    return value === undefined ? { kind, amount } : { kind, value, amount };
  });
}

function stakeTotal(map: Map<BetKey, number>): number {
  let sum = 0;
  for (const amount of map.values()) sum += amount;
  return sum;
}

const STRAIGHT_GRID: number[][] = (() => {
  const rows: number[][] = [];
  for (let row = 0; row < 12; row++) {
    rows.push([3 + row * 3, 2 + row * 3, 1 + row * 3]);
  }
  return rows;
})();

function pocketTone(n: number): string {
  if (n === 0) return "bg-sz-jade/25 text-sz-jade border-sz-jade/50";
  if (isRed(n)) return "bg-[#7f1d1d]/80 text-sz-mist border-red-500/40";
  return "bg-sz-void text-sz-mist border-white/15";
}

export function RouletteTable() {
  const { state: session, adjustBankroll, recordSpin } = useCasinoSession();
  const [chip, setChip] = useState<(typeof CHIP_STEPS)[number]>(25);
  const [pending, setPending] = useState<Map<BetKey, number>>(() => new Map());
  const [lastBets, setLastBets] = useState<Map<BetKey, number> | null>(null);
  const [spinning, setSpinning] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [lastResult, setLastResult] = useState<number | null>(null);
  const [message, setMessage] = useState("Select a chip and tap the felt.");
  const [flashNet, setFlashNet] = useState<number | null>(null);
  const spinLock = useRef(false);

  const stake = stakeTotal(pending);
  const canSpin = !spinning && stake > 0 && stake <= session.bankroll;

  function amountOn(key: BetKey): number {
    return pending.get(key) ?? 0;
  }

  function place(kind: RouletteBetKind, value?: number) {
    if (spinning) return;
    if (chip > session.bankroll - stake) {
      setMessage("Not enough bankroll for that chip.");
      return;
    }
    const key = betKey(kind, value);
    setPending((prev) => {
      const next = new Map(prev);
      next.set(key, (next.get(key) ?? 0) + chip);
      return next;
    });
    setFlashNet(null);
    setMessage(`Added ${chip} on ${kind}${value !== undefined ? ` ${value}` : ""}.`);
  }

  function clearBets() {
    if (spinning) return;
    setPending(new Map());
    setFlashNet(null);
    setMessage("Bets cleared.");
  }

  function rebet() {
    if (spinning || !lastBets) return;
    const total = stakeTotal(lastBets);
    if (total > session.bankroll) {
      setMessage("Not enough bankroll to rebet.");
      return;
    }
    setPending(new Map(lastBets));
    setFlashNet(null);
    setMessage("Last bets restored.");
  }

  function spin() {
    if (spinLock.current || !canSpin) return;
    spinLock.current = true;

    const bets = toBets(pending);
    const total = stakeTotal(pending);
    setLastBets(new Map(pending));
    adjustBankroll(-total);
    setSpinning(true);
    setFlashNet(null);
    setMessage("Ball in play…");

    const provisional = spinEuropean();
    const nextRot = rotation + rotationForResult(provisional, 5 + Math.floor(Math.random() * 3));
    setRotation(nextRot);

    window.setTimeout(() => {
      const result = provisional;
      const { payout, net } = settleRoulette(bets, result);
      adjustBankroll(payout);
      recordSpin();
      setLastResult(result);
      setPending(new Map());
      setSpinning(false);
      setFlashNet(net);
      const tone = net > 0 ? "Won" : net < 0 ? "Lost" : "Push";
      setMessage(
        `${tone} · landed ${result}${result === 0 ? " (green)" : isRed(result) ? " red" : " black"} · P/L ${net >= 0 ? "+" : ""}${net}`,
      );
      if (net > 0) {
        fireConfetti({ count: 70 });
      }
      spinLock.current = false;
    }, SPIN_MS);
  }

  function cellClass(active: boolean, base: string): string {
    return `${base} relative min-h-9 border px-1 py-1.5 text-center text-xs font-semibold transition hover:brightness-125 disabled:opacity-50 ${
      active ? "ring-2 ring-sz-gold shadow-[0_0_12px_rgba(240,196,92,0.35)]" : ""
    }`;
  }

  function ChipMark({ amount }: { amount: number }) {
    if (amount <= 0) return null;
    return (
      <span className="absolute bottom-0.5 right-0.5 rounded-full bg-sz-gold px-1.5 py-0.5 font-mono text-[9px] font-bold leading-none text-sz-void">
        {amount}
      </span>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col items-start justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-sz-jade/80">
            European · single zero
          </p>
          <h1 className="display mt-2 text-3xl font-extrabold md:text-4xl">Roulette</h1>
        </div>
        <p className="text-sm text-sz-mist/60">
          Stake on table:{" "}
          <span className="font-semibold text-sz-gold">{stake}</span> Zard
        </p>
      </div>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,320px)_1fr] lg:items-start">
        <Wheel spinning={spinning} rotationDeg={rotation} lastResult={lastResult} />

        <div className="space-y-4">
          <div className="overflow-x-auto rounded-sm border border-sz-jade/20 bg-sz-panel/40 p-3 shadow-[0_0_40px_rgba(61,255,154,0.06)]">
            <div className="inline-grid min-w-[520px] grid-cols-[2.5rem_repeat(12,minmax(2.4rem,1fr))_2.75rem] gap-0.5">
              <button
                type="button"
                disabled={spinning}
                onClick={() => place("straight", 0)}
                className={cellClass(
                  amountOn(betKey("straight", 0)) > 0,
                  `row-span-3 flex items-center justify-center ${pocketTone(0)}`,
                )}
              >
                0
                <ChipMark amount={amountOn(betKey("straight", 0))} />
              </button>

              {STRAIGHT_GRID.map((col, colIdx) =>
                col.map((n, rowIdx) => (
                  <button
                    key={n}
                    type="button"
                    disabled={spinning}
                    onClick={() => place("straight", n)}
                    style={{ gridColumn: colIdx + 2, gridRow: rowIdx + 1 }}
                    className={cellClass(
                      amountOn(betKey("straight", n)) > 0,
                      pocketTone(n),
                    )}
                  >
                    {n}
                    <ChipMark amount={amountOn(betKey("straight", n))} />
                  </button>
                )),
              )}

              {([3, 2, 1] as const).map((col, i) => (
                <button
                  key={`col-${col}`}
                  type="button"
                  disabled={spinning}
                  onClick={() => place("column", col)}
                  style={{ gridColumn: 14, gridRow: i + 1 }}
                  className={cellClass(
                    amountOn(betKey("column", col)) > 0,
                    "bg-sz-void/80 text-[10px] uppercase tracking-wide text-sz-mist/80 border-sz-jade/25",
                  )}
                >
                  2:1
                  <ChipMark amount={amountOn(betKey("column", col))} />
                </button>
              ))}

              {([1, 2, 3] as const).map((dz, i) => (
                <button
                  key={`dz-${dz}`}
                  type="button"
                  disabled={spinning}
                  onClick={() => place("dozen", dz)}
                  style={{ gridColumn: `${2 + i * 4} / span 4`, gridRow: 4 }}
                  className={cellClass(
                    amountOn(betKey("dozen", dz)) > 0,
                    "bg-sz-void/70 text-[10px] uppercase tracking-[0.18em] text-sz-mist/75 border-sz-jade/20",
                  )}
                >
                  {dz === 1 ? "1st 12" : dz === 2 ? "2nd 12" : "3rd 12"}
                  <ChipMark amount={amountOn(betKey("dozen", dz))} />
                </button>
              ))}

              {(
                [
                  ["low", "1–18"],
                  ["even", "Even"],
                  ["red", "Red"],
                  ["black", "Black"],
                  ["odd", "Odd"],
                  ["high", "19–36"],
                ] as const
              ).map(([kind, label], i) => (
                <button
                  key={kind}
                  type="button"
                  disabled={spinning}
                  onClick={() => place(kind)}
                  style={{ gridColumn: `${2 + i * 2} / span 2`, gridRow: 5 }}
                  className={cellClass(
                    amountOn(betKey(kind)) > 0,
                    kind === "red"
                      ? "bg-[#7f1d1d]/70 border-red-500/35 text-sz-mist"
                      : kind === "black"
                        ? "bg-sz-void border-white/20 text-sz-mist"
                        : "bg-sz-void/70 border-sz-jade/20 text-sz-mist/80",
                  )}
                >
                  {label}
                  <ChipMark amount={amountOn(betKey(kind))} />
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {CHIP_STEPS.map((c) => (
              <button
                key={c}
                type="button"
                disabled={spinning || c > session.bankroll}
                onClick={() => setChip(c)}
                className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-35 ${
                  chip === c
                    ? "bg-sz-gold text-sz-void"
                    : "border border-white/15 text-sz-mist hover:border-sz-gold/40"
                }`}
              >
                {c}
              </button>
            ))}
            <button
              type="button"
              disabled={spinning || pending.size === 0}
              onClick={clearBets}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-sz-mist transition hover:border-sz-ember/50 disabled:opacity-35"
            >
              Clear
            </button>
            <button
              type="button"
              disabled={spinning || !lastBets}
              onClick={rebet}
              className="rounded-full border border-white/15 px-4 py-1.5 text-xs font-semibold text-sz-mist transition hover:border-sz-jade/50 disabled:opacity-35"
            >
              Rebet
            </button>
            <button
              type="button"
              disabled={!canSpin}
              onClick={spin}
              className="rounded-full bg-sz-jade px-5 py-2 text-sm font-semibold text-sz-void transition hover:bg-sz-gold disabled:opacity-40"
            >
              {spinning ? "Spinning…" : "Spin"}
            </button>
          </div>

          <p
            className={`text-center text-sm md:text-left ${
              flashNet === null
                ? "text-sz-mist/75"
                : flashNet > 0
                  ? "text-sz-jade"
                  : flashNet < 0
                    ? "text-sz-ember"
                    : "text-sz-mist/75"
            }`}
          >
            {message}
          </p>
        </div>
      </div>
    </div>
  );
}
