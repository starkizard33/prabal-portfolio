import { GuessLinkinPark } from "@/components/starkizard/games/GuessLinkinPark";
import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guess the song · Starkizard",
  description: "Linkin Park lyric snippets — Neon Void hangar mini-game.",
};

export default function LinkinParkPlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Guess the song"
      blurb="Short lyric fragments. Type the track title — fuzzy matching is fine."
    >
      <GuessLinkinPark />
    </PlayShell>
  );
}
