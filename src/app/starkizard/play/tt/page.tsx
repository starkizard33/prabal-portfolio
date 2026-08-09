import { PlayShell } from "@/components/starkizard/games/PlayShell";
import { TableTennis } from "@/components/starkizard/games/TableTennis";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Table Tennis · Starkizard",
  description: "2D table tennis vs bot — Neon Void hangar mini-game.",
};

export default function TableTennisPlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Table Tennis"
      blurb="You vs the hangar bot. First to 11. Mouse, touch, or keyboard."
    >
      <TableTennis />
    </PlayShell>
  );
}
