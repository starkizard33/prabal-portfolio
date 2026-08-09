"use client";

import {
  CASINO_BUY_IN,
  useCasinoSession,
} from "@/casino/session/CasinoSessionContext";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

const MIN_BET = 10;

function formatElapsed(ms: number): string {
  const totalSeconds = Math.max(0, Math.floor(ms / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, "0")}`;
}

function formatNet(net: number): string {
  if (net > 0) return `+${net}`;
  return `${net}`;
}

export function SessionHud({ onLeave }: { onLeave: () => void }) {
  const { state, rebuyCasino, leaveCasino } = useCasinoSession();
  const router = useRouter();
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  const net = state.bankroll - state.startBankroll;
  const elapsedMs = state.startedAt ? now - state.startedAt : 0;
  const netTone =
    net > 0 ? "text-sz-jade" : net < 0 ? "text-sz-ember" : "text-sz-mist/80";
  const broke = state.bankroll < MIN_BET;

  function handleRebuy() {
    rebuyCasino();
  }

  function handleBrokeLeave() {
    leaveCasino();
    router.push("/starkizard");
  }

  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-end justify-between gap-4 border border-sz-jade/25 bg-sz-panel/50 px-4 py-4 shadow-[0_0_32px_rgba(61,255,154,0.06)] md:px-6">
        <dl className="grid grid-cols-2 gap-x-8 gap-y-3 sm:grid-cols-5">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-sz-mist/45">
              Bankroll
            </dt>
            <dd className="display mt-1 text-xl font-bold text-sz-gold">
              {state.bankroll}{" "}
              <span className="text-sm font-semibold text-sz-mist/50">Zard</span>
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-sz-mist/45">
              Net
            </dt>
            <dd className={`display mt-1 text-xl font-bold ${netTone}`}>
              {formatNet(net)}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-sz-mist/45">
              Hands
            </dt>
            <dd className="display mt-1 text-xl font-bold">{state.hands}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-sz-mist/45">
              Spins
            </dt>
            <dd className="display mt-1 text-xl font-bold">{state.spins}</dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.22em] text-sz-mist/45">
              Elapsed
            </dt>
            <dd className="display mt-1 text-xl font-bold tabular-nums">
              {formatElapsed(elapsedMs)}
            </dd>
          </div>
        </dl>
        <button
          type="button"
          onClick={onLeave}
          className="rounded-full border border-white/15 px-4 py-2 text-sm font-semibold text-sz-mist transition hover:border-sz-ember/60 hover:text-sz-ember"
        >
          Leave
        </button>
      </div>

      {broke ? (
        <div className="border border-sz-ember/35 bg-sz-panel/70 px-5 py-4 text-center">
          <p className="text-sm text-sz-mist/85">
            Bankroll below the {MIN_BET} minimum. Leave the floor or start a new{" "}
            {CASINO_BUY_IN} Zard buy-in.
          </p>
          <div className="mt-4 flex flex-wrap items-center justify-center gap-3">
            <button
              type="button"
              onClick={handleBrokeLeave}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-ember/60 hover:text-sz-ember"
            >
              Leave
            </button>
            <button
              type="button"
              onClick={handleRebuy}
              className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
            >
              New buy-in — {CASINO_BUY_IN} Zard
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}
