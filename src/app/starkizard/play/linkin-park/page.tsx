import { LinkinParkPlay } from "@/components/starkizard/games/LinkinParkPlay";
import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guess the song · Starkizard",
  description:
    "Linkin Park — lyric snippets or progressive iTunes audio previews.",
};

export default function LinkinParkPlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Linkin Park"
      blurb="Two modes: lyric fragments, or progressive audio clips (1s → 30s) — play as many as you want."
    >
      <LinkinParkPlay />
    </PlayShell>
  );
}
