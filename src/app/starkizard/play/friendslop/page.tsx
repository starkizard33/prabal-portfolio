import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Friendslop · WIP · Starkizard",
  description: "Multiplayer party games coming later — work in progress.",
};

export default function FriendslopPlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play · WIP"
      title="Friendslop games"
      blurb="This bay is under construction — no pretend lobby, no fake matchmaking."
    >
      <div className="border border-sz-ember/35 bg-sz-panel/50 p-8 shadow-[0_0_40px_rgba(255,107,44,0.08)]">
        <span className="inline-block rounded-full border border-sz-ember/50 bg-sz-ember/15 px-3 py-1 font-mono text-[11px] uppercase tracking-[0.22em] text-sz-ember">
          Work in progress
        </span>
        <h2 className="display mt-5 text-2xl font-bold text-sz-gold md:text-3xl">
          Multiplayer party games coming later
        </h2>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-sz-mist/70 md:text-base">
          Thinking Codenames-class sessions: rooms, cluers, guessers, and chaotic
          friend groups. Nothing playable ships here yet — hangar card is the
          placeholder until the real stack lands.
        </p>
        <ul className="mt-6 space-y-2 text-sm text-sz-mist/55">
          <li>· Shared rooms / invite links</li>
          <li>· Turn-based word &amp; party formats</li>
          <li>· Neon Void skin, not a clipboard clone</li>
        </ul>
      </div>
    </PlayShell>
  );
}
