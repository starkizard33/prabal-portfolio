"use client";

import {
  dealRoles,
  murdererCount,
  murderWinner,
  MURDER_MIN_PLAYERS,
  type MurderSeat,
} from "@/lib/play/murder";
import { readSingleTable } from "@/lib/play/singleTable";
import Link from "next/link";
import { useEffect, useState } from "react";

type Phase = "rules" | "pass" | "role" | "board" | "confirm-death" | "win";

export function MurderGame() {
  const [names, setNames] = useState<string[]>([]);
  const [ready, setReady] = useState(false);
  const [seats, setSeats] = useState<MurderSeat[]>([]);
  const [phase, setPhase] = useState<Phase>("rules");
  const [revealIndex, setRevealIndex] = useState(0);
  const [pendingName, setPendingName] = useState<string | null>(null);

  useEffect(() => {
    setNames(readSingleTable());
    setReady(true);
  }, []);

  function startDeal() {
    const dealt = dealRoles(names);
    setSeats(dealt);
    setRevealIndex(0);
    setPendingName(null);
    setPhase("pass");
  }

  function kill(name: string) {
    const next = seats.map((seat) =>
      seat.name === name ? { ...seat, alive: false } : seat,
    );
    setSeats(next);
    setPendingName(null);
    setPhase(murderWinner(next) ? "win" : "board");
  }

  if (!ready) {
    return (
      <main className="mx-auto max-w-lg px-4 pt-16 text-sm text-[var(--play-text-muted)]">
        Loading…
      </main>
    );
  }

  if (names.length < MURDER_MIN_PLAYERS) {
    return (
      <Shell>
        <p className="text-sm text-white">
          Murder needs {MURDER_MIN_PLAYERS} or more names.
        </p>
      </Shell>
    );
  }

  const killers = murdererCount(names.length);
  const current = seats[revealIndex];

  if (phase === "rules") {
    return (
      <Shell>
        <h1 className="text-4xl font-bold text-white">Murder</h1>
        <ol className="mt-5 list-decimal space-y-3 pl-5 text-sm leading-relaxed text-[var(--play-text-muted)]">
          <li>Pass the phone. Each person sees a secret role, then hides it.</li>
          <li>
            Murderers kill with a wink. If you&apos;re winked at, wait 2 seconds,
            cross your arms, then tap your name.
          </li>
          <li>
            To accuse, raise a hand. When someone joins you, count to three and
            point together.
          </li>
          <li>
            If you point at the same person, they tap their name. They&apos;re
            dead.
          </li>
          <li>
            If you point at different people, the accusers tap their own names.
            They&apos;re out.
          </li>
          <li>
            Civilians win when every murderer is dead. Murderers win when every
            civilian is dead.
          </li>
        </ol>
        <p className="mt-5 text-sm text-white">
          This table: {killers} murderer{killers === 1 ? "" : "s"},{" "}
          {names.length - killers} civilians.
        </p>
        <button
          type="button"
          onClick={startDeal}
          className="play-card mt-6 w-full bg-[var(--play-coral)] py-3 text-base font-semibold text-[#121212]"
        >
          Deal roles
        </button>
      </Shell>
    );
  }

  if ((phase === "pass" || phase === "role") && current) {
    if (phase === "pass") {
      return (
        <Shell>
          <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--play-text-muted)]">
            {revealIndex + 1} / {seats.length}
          </p>
          <h1 className="mt-3 text-4xl font-bold text-white">
            Pass to {current.name}
          </h1>
          <p className="mt-3 text-sm text-[var(--play-text-muted)]">
            Everyone else look away.
          </p>
          <button
            type="button"
            onClick={() => setPhase("role")}
            className="play-card mt-8 w-full bg-[var(--play-yellow)] py-4 text-base font-semibold text-[#121212]"
          >
            I&apos;m {current.name}
          </button>
        </Shell>
      );
    }

    const murderer = current.role === "murderer";
    return (
      <Shell>
        <p
          className="text-5xl font-bold tracking-tight"
          style={{ color: murderer ? "var(--play-coral)" : "#3dff9a" }}
        >
          {murderer ? "Murderer" : "Civilian"}
        </p>
        <p className="mt-4 text-sm text-white">
          {murderer
            ? "Wink to kill. Don't get caught."
            : "Watch for a wink. Cross your arms two seconds after it."}
        </p>
        <button
          type="button"
          onClick={() => {
            if (revealIndex >= seats.length - 1) {
              setPhase("board");
              return;
            }
            setRevealIndex((index) => index + 1);
            setPhase("pass");
          }}
          className="play-card mt-8 w-full bg-[var(--play-surface-alt)] py-4 text-base font-semibold text-white"
        >
          Hide and pass
        </button>
      </Shell>
    );
  }

  if (phase === "win") {
    const winner = murderWinner(seats);
    return (
      <Shell>
        <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--play-text-muted)]">
          Game over
        </p>
        <h1 className="mt-2 text-4xl font-bold text-white">
          {winner === "civilian" ? "Civilians win" : "Murderers win"}
        </h1>
        <ul className="mt-6 space-y-2">
          {seats.map((seat) => (
            <li
              key={seat.name}
              className="flex items-center justify-between rounded-[var(--play-radius-lg)] bg-[var(--play-surface)] px-4 py-3"
            >
              <span className="font-semibold text-white">{seat.name}</span>
              <span className="text-sm text-[var(--play-text-muted)]">
                {seat.role === "murderer" ? "Murderer" : "Civilian"}
                {seat.alive ? "" : " · dead"}
              </span>
            </li>
          ))}
        </ul>
        <button
          type="button"
          onClick={startDeal}
          className="play-card mt-6 w-full bg-[var(--play-yellow)] py-3 text-base font-semibold text-[#121212]"
        >
          Play again
        </button>
      </Shell>
    );
  }

  if (phase === "confirm-death" && pendingName) {
    return (
      <Shell>
        <h1 className="text-4xl font-bold text-white">{pendingName} dies?</h1>
        <p className="mt-3 text-sm text-[var(--play-text-muted)]">
          A wink, or the person everyone pointed at, or an accuser who pointed
          the wrong way.
        </p>
        <button
          type="button"
          onClick={() => kill(pendingName)}
          className="play-card mt-8 w-full bg-[var(--play-coral)] py-4 text-base font-semibold text-[#121212]"
        >
          Yes, they&apos;re dead
        </button>
        <button
          type="button"
          onClick={() => {
            setPendingName(null);
            setPhase("board");
          }}
          className="mt-3 w-full py-3 text-sm text-[var(--play-text-muted)]"
        >
          Cancel
        </button>
      </Shell>
    );
  }

  return (
    <Shell>
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[var(--play-text-muted)]">
        Murder
      </p>
      <h1 className="mt-2 text-3xl font-bold text-white">Who&apos;s out?</h1>
      <p className="mt-2 text-sm text-[var(--play-text-muted)]">
        Tap the person who was winked at, the person everyone pointed at, or an
        accuser who pointed the wrong way.
      </p>
      <NameGrid
        seats={seats}
        onPick={(name) => {
          setPendingName(name);
          setPhase("confirm-death");
        }}
      />
    </Shell>
  );
}

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.25rem,env(safe-area-inset-top))] sm:px-5">
      <Link
        href="/play/single/games"
        className="text-sm text-[var(--play-text-muted)] underline-offset-2 hover:text-white hover:underline"
      >
        ← Games
      </Link>
      <div className="mt-5">{children}</div>
    </main>
  );
}

function NameGrid({
  seats,
  onPick,
}: {
  seats: Pick<MurderSeat, "name" | "alive">[];
  onPick: (name: string) => void;
}) {
  return (
    <ul className="mt-6 grid grid-cols-2 gap-4">
      {seats.map((seat) => {
        return (
          <li key={seat.name}>
            <button
              type="button"
              disabled={!seat.alive}
              onClick={() => onPick(seat.name)}
              className="flex min-h-32 w-full flex-col items-center justify-center rounded-[var(--play-radius-xl)] px-3 text-center text-xl font-bold disabled:opacity-40"
              style={{
                background: seat.alive
                  ? "var(--play-surface)"
                  : "var(--play-surface-alt)",
                color: "#fff",
              }}
            >
              <span className={seat.alive ? undefined : "line-through"}>
                {seat.name}
              </span>
              {!seat.alive ? (
                <span className="mt-1 block text-xs font-semibold uppercase tracking-wider no-underline">
                  Dead
                </span>
              ) : null}
            </button>
          </li>
        );
      })}
    </ul>
  );
}
