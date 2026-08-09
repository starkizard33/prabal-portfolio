import { CircuitRace } from "@/components/starkizard/games/CircuitRace";
import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Spielberg Circuit · Starkizard",
  description: "Fan-track time trial inspired by Red Bull Ring vibes.",
};

export default function RacePlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Spielberg Circuit"
      blurb="Fan track time trial — 2 laps, optional ghost. WASD or arrow keys."
    >
      <CircuitRace />
    </PlayShell>
  );
}
