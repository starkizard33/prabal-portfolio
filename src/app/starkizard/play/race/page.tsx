import { CircuitRace } from "@/components/starkizard/games/CircuitRace";
import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Red Bull Ring · Starkizard",
  description:
    "Fan recreation of the Red Bull Ring layout — time trial with ghost.",
};

export default function RacePlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Red Bull Ring"
      blurb="Unofficial fan layout (S/F south, T3 NE hairpin, real corner names). WASD or arrows — chase your ghost."
    >
      <CircuitRace />
    </PlayShell>
  );
}
