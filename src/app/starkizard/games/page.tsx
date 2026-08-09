import Link from "next/link";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Custom board games",
  description: "Board game prototypes and concepts from the Starkizard hangar.",
};

const games = [
  {
    name: "Clearance Run",
    status: "Concept",
    pitch:
      "Co-op tableau game where players clear transaction batches before the night window closes. Take roles from matching, networks, and ops — one bad rule cascade and the table fails together.",
    players: "2–4",
    vibe: "Systems / pressure",
  },
  {
    name: "Orange Sector",
    status: "Rules draft",
    pitch:
      "Race weekend drafting: tire compounds, sector times, and late-brake overtake checks. Max energy optional. Short campaign of three grands prix.",
    players: "2–6",
    vibe: "F1 / racing",
  },
  {
    name: "Hybrid Theory",
    status: "Prototype",
    pitch:
      "Set-collection around eras and setlists. Chain tempos, drop the bridge at the right time, and steal the encore. Built for Linkin Park nights.",
    players: "2–5",
    vibe: "Music / set-collection",
  },
  {
    name: "Spin Lab",
    status: "Ideation",
    pitch:
      "Abstract TT dueling — serve, loop, and counter with hidden spin discs. Reads like a mind game more than a luck-fest.",
    players: "2",
    vibe: "Table tennis / bluffing",
  },
];

export default function BoardGamesPage() {
  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad mx-auto w-full max-w-5xl flex-1 py-12 md:py-16">
        <Link
          href="/starkizard"
          className="text-sm text-sz-mist/60 transition hover:text-sz-jade"
        >
          ← Back to hangar
        </Link>
        <p className="mt-8 font-mono text-[11px] uppercase tracking-[0.28em] text-sz-jade/80">
          Custom board games
        </p>
        <h1 className="display mt-3 text-4xl font-extrabold tracking-tight md:text-5xl">
          Prototypes in the hangar
        </h1>
        <p className="mt-4 max-w-2xl text-sz-mist/70">
          Early designs and themes. Playable modules can land here over time —
          for now, the pitches live on the felt.
        </p>

        <ul className="mt-12 space-y-6">
          {games.map((game) => (
            <li
              key={game.name}
              className="rounded-2xl border border-white/10 bg-sz-panel/70 p-6 md:p-7"
            >
              <div className="flex flex-wrap items-center gap-3">
                <h2 className="display text-2xl font-bold text-sz-gold">
                  {game.name}
                </h2>
                <span className="rounded-full border border-sz-ember/40 px-3 py-0.5 font-mono text-[10px] uppercase tracking-[0.2em] text-sz-ember">
                  {game.status}
                </span>
              </div>
              <p className="mt-3 max-w-3xl leading-relaxed text-sz-mist/75">
                {game.pitch}
              </p>
              <dl className="mt-5 flex flex-wrap gap-6 text-sm text-sz-mist/55">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    Players
                  </dt>
                  <dd className="mt-1 text-sz-mist">{game.players}</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.2em]">
                    Vibe
                  </dt>
                  <dd className="mt-1 text-sz-mist">{game.vibe}</dd>
                </div>
              </dl>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
