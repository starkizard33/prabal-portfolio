"use client";

import Link from "next/link";

export function PlayChoice() {
  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--play-text-muted)] sm:text-xs">
        play.starkizard
      </p>
      <h1 className="mt-2 text-[1.85rem] font-bold leading-[1.08] tracking-tight text-white sm:mt-3 sm:text-5xl">
        How are
        <br />
        you playing?
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--play-text-muted)] sm:mt-4">
        Same couch, or everyone on their own phone.
      </p>

      <div className="mt-8 flex flex-col gap-3 sm:mt-10">
        <Link
          href="/play/single"
          className="play-card block bg-[var(--play-peach)] px-5 py-5 text-[#121212]"
        >
          <p className="text-lg font-bold">Games on a single device</p>
          <p className="mt-1 text-sm leading-relaxed opacity-80">
            One phone. Add the names, then pass it around.
          </p>
        </Link>
        <Link
          href="/play/devices"
          className="play-card block bg-[var(--play-yellow)] px-5 py-5 text-[#121212]"
        >
          <p className="text-lg font-bold">On your own devices</p>
          <p className="mt-1 text-sm leading-relaxed opacity-80">
            Create or join a room. Psych and Ghost Second.
          </p>
        </Link>
      </div>
    </main>
  );
}
