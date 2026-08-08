"use client";

import type { SessionSummary } from "@/casino/session/CasinoSessionContext";
import { fireConfetti } from "@/components/fx/confetti";
import { useEffect } from "react";

function formatDuration(startedAt: number | null, endedAt: number): string {
  if (startedAt == null) return "—";
  const totalSeconds = Math.max(0, Math.floor((endedAt - startedAt) / 1000));
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

function formatNet(net: number): string {
  if (net > 0) return `+${net}`;
  return `${net}`;
}

type LeaveSummaryProps = {
  summary: SessionSummary;
  onConfirm: () => void;
  onStay: () => void;
};

export function LeaveSummary({
  summary,
  onConfirm,
  onStay,
}: LeaveSummaryProps) {
  useEffect(() => {
    if (summary.net > 0) {
      fireConfetti({ count: 90 });
    }
  }, [summary.net]);

  const netTone =
    summary.net > 0
      ? "text-sz-jade"
      : summary.net < 0
        ? "text-sz-ember"
        : "text-sz-mist";

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-sz-void/80 px-4 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      aria-labelledby="leave-summary-title"
    >
      <div className="w-full max-w-md border border-sz-jade/30 bg-sz-panel p-6 shadow-[0_0_48px_rgba(61,255,154,0.12)] md:p-8">
        <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sz-jade/80">
          Leave casino
        </p>
        <h2
          id="leave-summary-title"
          className="display mt-2 text-2xl font-bold md:text-3xl"
        >
          Session summary
        </h2>
        <dl className="mt-6 grid grid-cols-2 gap-4 text-sm">
          <div>
            <dt className="text-sz-mist/45">Cash out</dt>
            <dd className="display mt-1 text-lg font-bold text-sz-gold">
              {summary.bankroll} Zard
            </dd>
          </div>
          <div>
            <dt className="text-sz-mist/45">Net P/L</dt>
            <dd className={`display mt-1 text-lg font-bold ${netTone}`}>
              {formatNet(summary.net)}
            </dd>
          </div>
          <div>
            <dt className="text-sz-mist/45">Hands</dt>
            <dd className="mt-1 font-semibold">{summary.hands}</dd>
          </div>
          <div>
            <dt className="text-sz-mist/45">Spins</dt>
            <dd className="mt-1 font-semibold">{summary.spins}</dd>
          </div>
          <div className="col-span-2">
            <dt className="text-sz-mist/45">Time on floor</dt>
            <dd className="mt-1 font-semibold tabular-nums">
              {formatDuration(summary.startedAt, summary.endedAt)}
            </dd>
          </div>
        </dl>
        <div className="mt-8 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={onConfirm}
            className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
          >
            Return to hangar
          </button>
          <button
            type="button"
            onClick={onStay}
            className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-sz-jade/50"
          >
            Stay
          </button>
        </div>
      </div>
    </div>
  );
}
