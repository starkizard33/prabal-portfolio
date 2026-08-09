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
      blurb="Pick a circuit or draw your own. Press Enter for a five-light start — timer begins on lights out. 5 laps, gentler throttle, ghost on each layout."
    >
      <CircuitRace />
    </PlayShell>
  );
}
