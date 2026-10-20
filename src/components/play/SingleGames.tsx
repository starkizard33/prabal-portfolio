"use client";

import { MURDER_MIN_PLAYERS } from "@/lib/play/murder";
import { readSingleTable } from "@/lib/play/singleTable";
import Link from "next/link";
import { useEffect, useState } from "react";

export function SingleGames() {
  const [names, setNames] = useState<string[]>([]);

  useEffect(() => {
    setNames(readSingleTable());
  }, []);

  const canMurder = names.length >= MURDER_MIN_PLAYERS;

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-14">
      <Link
        href="/play/single"
        className="text-sm text-[var(--play-text-muted)] underline-offset-2 hover:text-white hover:underline"
      >
        ← Names
      </Link>
      <p className="mt-4 text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--play-text-muted)]">
        One phone
      </p>
      <h1 className="mt-2 text-3xl font-bold tracking-tight text-white">
        Games
      </h1>
      <p className="mt-2 text-sm text-[var(--play-text-muted)]">
        {names.length} at the table
        {names.length > 0 ? `: ${names.join(", ")}` : ""}.
      </p>

      <section className="mt-8 space-y-3">
        {canMurder ? (
          <Link
            href="/play/single/murder"
            className="play-card block bg-[var(--play-coral)] text-left text-[#121212]"
            style={{ transform: "rotate(-1deg)" }}
          >
            <p className="text-lg font-bold">Murder</p>
            <p className="mt-1 text-sm opacity-80">
              Silent winks. Catch them, or die trying.
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider opacity-70">
              Tap to start
            </p>
          </Link>
        ) : (
          <div
            className="play-card bg-[var(--play-coral)] text-left text-[#121212] opacity-40"
            style={{ transform: "rotate(-1deg)" }}
          >
            <p className="text-lg font-bold">Murder</p>
            <p className="mt-1 text-sm opacity-80">
              Silent winks. Catch them, or die trying.
            </p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider opacity-70">
              Need {MURDER_MIN_PLAYERS}+ players
            </p>
          </div>
        )}
      </section>
    </main>
  );
}
