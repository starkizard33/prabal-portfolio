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
      blurb="Three circuits or draw your own. Free drive with soft walls — pass green gates in order, then SF. No reverse. 3 laps + ghost."
    >
      <CircuitRace />
    </PlayShell>
  );
}
