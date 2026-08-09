import { PlayShell } from "@/components/starkizard/games/PlayShell";
import { TableTennis } from "@/components/starkizard/games/TableTennis";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Table Tennis · Starkizard",
  description: "2D table tennis with topspin, backspin, and sidespin vs bot.",
};

export default function TableTennisPlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Table Tennis"
      blurb="First to 11. Hold Q topspin, E backspin, A/D sidespin on contact — ball curves."
    >
      <TableTennis />
    </PlayShell>
  );
}
