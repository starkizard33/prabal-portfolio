import { CircuitRace } from "@/components/starkizard/games/CircuitRace";
import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Circuit Race · Starkizard",
  description:
    "Pick a layout or draw your own — time trial with ghost on a Neon Void circuit.",
};

export default function RacePlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Circuit Race"
      blurb="Choose a preset (Red Bull Ring, figure-eight, hairpins, speed bowl) or draw your own centerline. Wide track, hard wall slowdown, ghost laps — WASD or arrows."
    >
      <CircuitRace />
    </PlayShell>
  );
}
