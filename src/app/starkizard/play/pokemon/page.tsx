import { GuessPokemon } from "@/components/starkizard/games/GuessPokemon";
import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guess the Pokémon · Starkizard",
  description: "Silhouette challenge — Neon Void hangar mini-game.",
};

export default function PokemonPlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Guess the Pokémon"
      blurb="Silhouette first. Name the species. Chain streaks for bonus points."
    >
      <GuessPokemon />
    </PlayShell>
  );
}
