import { GuessPokemon } from "@/components/starkizard/games/GuessPokemon";
import { PlayShell } from "@/components/starkizard/games/PlayShell";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Guess the Pokémon · Starkizard",
  description:
    "National Pokédex silhouette quiz with progressive hints and Pokédex fun facts.",
};

export default function PokemonPlayPage() {
  return (
    <PlayShell
      eyebrow="Neon Void · Play"
      title="Guess the Pokémon"
      blurb="Full national dex. Misses unlock region → type → # → name shape. Nailing it shows a fun fact."
    >
      <GuessPokemon />
    </PlayShell>
  );
}
