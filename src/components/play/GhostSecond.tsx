"use client";

import {
  formatGhostTime,
  type ClientMessage,
  type GhostPublicState,
} from "@shared/playProtocol";
import { useEffect, useRef, useState } from "react";

type GhostSecondProps = {
  ghost: GhostPublicState;
  isHost: boolean;
  isSpectator?: boolean;
  send: (msg: ClientMessage) => void;
};

export function GhostSecond({
  ghost,
  isHost,
  isSpectator,
  send,
}: GhostSecondProps) {
  const revealed = ghost.results != null;
  const startedAt = useRef<number | null>(null);
  const arm = useRef<"idle" | "running" | "done">("idle");
  const [local, setLocal] = useState<"running" | "done" | null>(null);
  const [localElapsed, setLocalElapsed] = useState<number | null>(null);

  useEffect(() => {
    arm.current = "idle";
    startedAt.current = null;
    setLocal(null);
    setLocalElapsed(null);
  }, [ghost.round]);

  const running = local === "running" || ghost.youStatus === "running";
  const done =
    revealed || local === "done" || ghost.youStatus === "done";
  const canTap = !isSpectator && !done && !revealed;
  const elapsedMs = ghost.youElapsedMs ?? localElapsed;

  function tap(event: React.PointerEvent<HTMLButtonElement>) {
    event.preventDefault();
    if (isSpectator || revealed || arm.current === "done") return;
    try {
      navigator.vibrate?.(12);
    } catch {
      /* ignore */
    }
    if (arm.current === "idle" && ghost.youStatus !== "running") {
      arm.current = "running";
      startedAt.current = performance.now();
      setLocal("running");
      send({ type: "ghost_tap" });
      return;
    }
    if (startedAt.current == null) {
      arm.current = "done";
      setLocal("done");
      send({ type: "ghost_tap" });
      return;
    }
    const held = Math.round(performance.now() - startedAt.current);
    if (held < 180) return;
    arm.current = "done";
    setLocal("done");
    setLocalElapsed(held);
    send({ type: "ghost_tap", elapsedMs: held });
  }

  return (
    <section className="mt-6 flex flex-col items-center">
      <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[var(--play-text-muted)]">
        Ghost Second · {ghost.round}/{ghost.totalRounds}
      </p>
      <p className="mt-2 text-center text-sm text-[var(--play-text-muted)]">
        Feel this long. You won&apos;t see your clock.
      </p>
      <p className="mt-5 font-mono text-5xl font-bold tracking-tight text-white sm:text-7xl">
        {(ghost.targetMs / 1000).toFixed(3)}
      </p>
      <p className="mt-2 text-xs uppercase tracking-[0.18em] text-[var(--play-text-muted)]">
        {ghost.final ? "seconds · lowest total wins" : "seconds"}
      </p>

      <button
        type="button"
        onPointerDown={tap}
        disabled={!canTap}
        aria-pressed={running}
        style={{
          background: running && !done ? "#ff4b3e" : "#3dff9a",
          opacity: canTap || (running && !done) ? 1 : 0.55,
          boxShadow:
            running && !done
              ? "0 0 0 10px rgba(255,75,62,0.18)"
              : "0 0 0 10px rgba(61,255,154,0.16)",
          touchAction: "manipulation",
        }}
        aria-label={done ? "Locked" : running ? "Stop" : "Start"}
        className="mt-10 flex h-44 w-44 items-center justify-center rounded-full text-lg font-bold text-[#121212] transition-transform active:scale-95 disabled:cursor-default disabled:active:scale-100 sm:h-52 sm:w-52"
      >
        {isSpectator
          ? "Watching"
          : done
            ? "Locked"
            : running
              ? "Stop"
              : "Start"}
      </button>

      <p className="mt-4 min-h-5 text-center text-sm text-white">
        {isSpectator
          ? "You joined mid-round."
          : done && (elapsedMs != null || ghost.youErrorMs != null)
            ? ghost.youAutoStopped
              ? `Auto-stopped at ${formatGhostTime(30_000)}.`
              : elapsedMs != null
                ? `You stopped at ${formatGhostTime(elapsedMs)}${
                    ghost.youErrorMs != null
                      ? ` · ${ghost.youErrorMs.toLocaleString()} ms off`
                      : ""
                  }.`
                : `You were ${ghost.youErrorMs!.toLocaleString()} ms off.`
            : running
              ? "Clock is running. Tap when it feels right."
              : revealed
                ? "Round closed."
                : "Tap once to start. Tap again to stop."}
      </p>

      <p className="mt-6 text-xs text-[var(--play-text-muted)]">
        {ghost.lockedCount}/{ghost.activeCount} locked
      </p>

      {revealed && ghost.results ? (
        <ol className="mt-4 w-full space-y-2">
          {ghost.results.map((row) => (
            <li
              key={row.playerId}
              className="flex items-center justify-between rounded-[var(--play-radius-lg)] px-4 py-3"
              style={{
                background: row.rank === 1 ? "var(--play-yellow)" : "var(--play-surface)",
                color: row.rank === 1 ? "#121212" : "#fff",
              }}
            >
              <span className="font-semibold">
                {row.rank}. {row.name}
                {row.isYou ? " (you)" : ""}
              </span>
              <span className="text-right font-mono text-sm">
                {ghost.final
                  ? `${row.totalMs.toLocaleString()} ms`
                  : row.elapsedMs != null
                    ? `${formatGhostTime(row.elapsedMs)} · ${row.errorMs.toLocaleString()} ms`
                    : `${row.errorMs.toLocaleString()} ms`}
                {!ghost.final ? (
                  <span className="mt-0.5 block text-[10px] opacity-70">
                    total {row.totalMs.toLocaleString()}
                  </span>
                ) : null}
              </span>
            </li>
          ))}
        </ol>
      ) : null}

      {isHost ? (
        <div className="mt-6 flex w-full flex-col gap-2">
          {!revealed ? (
            <button
              type="button"
              onClick={() => send({ type: "ghost_end" })}
              className="play-card w-full bg-[var(--play-surface-alt)] py-3 text-sm font-semibold text-white"
            >
              Close round
            </button>
          ) : (
            <button
              type="button"
              onClick={() => send({ type: "ghost_again" })}
              className="play-card w-full bg-[var(--play-yellow)] py-3 text-sm font-semibold text-[#121212]"
            >
              {ghost.final
                ? "Play again"
                : ghost.round >= ghost.totalRounds
                  ? "Final scores"
                  : "Next round"}
            </button>
          )}
          <button
            type="button"
            onClick={() => send({ type: "back_to_lobby" })}
            className="text-sm text-[var(--play-text-muted)] underline-offset-2 hover:text-white hover:underline"
          >
            ← Back to room
          </button>
        </div>
      ) : null}
    </section>
  );
}
