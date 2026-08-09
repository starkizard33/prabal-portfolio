"use client";

import { fuzzyMatch } from "@/components/starkizard/games/normalizeGuess";
import { useMemo, useState, type FormEvent } from "react";

const SHOWDOWN = "https://play.pokemonshowdown.com/sprites/ani";

type PokemonEntry = {
  id: string;
  name: string;
  aliases: string[];
  sprite: string;
};

const POKEDEX: PokemonEntry[] = [
  {
    id: "pikachu",
    name: "Pikachu",
    aliases: ["pikachu"],
    sprite: `${SHOWDOWN}/pikachu.gif`,
  },
  {
    id: "mega-charizard-y",
    name: "Mega Charizard Y",
    aliases: ["mega charizard y", "charizard y", "charizard-megay", "megacharizardy"],
    sprite: "/sprites/mega-charizard-y.gif",
  },
  {
    id: "mega-rayquaza",
    name: "Mega Rayquaza",
    aliases: ["mega rayquaza", "rayquaza mega", "megarayquaza"],
    sprite: "/sprites/mega-rayquaza.gif",
  },
  {
    id: "gengar",
    name: "Gengar",
    aliases: ["gengar"],
    sprite: `${SHOWDOWN}/gengar.gif`,
  },
  {
    id: "lucario",
    name: "Lucario",
    aliases: ["lucario"],
    sprite: `${SHOWDOWN}/lucario.gif`,
  },
  {
    id: "garchomp",
    name: "Garchomp",
    aliases: ["garchomp"],
    sprite: `${SHOWDOWN}/garchomp.gif`,
  },
  {
    id: "greninja",
    name: "Greninja",
    aliases: ["greninja"],
    sprite: `${SHOWDOWN}/greninja.gif`,
  },
  {
    id: "eevee",
    name: "Eevee",
    aliases: ["eevee"],
    sprite: `${SHOWDOWN}/eevee.gif`,
  },
  {
    id: "snorlax",
    name: "Snorlax",
    aliases: ["snorlax"],
    sprite: `${SHOWDOWN}/snorlax.gif`,
  },
  {
    id: "dragonite",
    name: "Dragonite",
    aliases: ["dragonite"],
    sprite: `${SHOWDOWN}/dragonite.gif`,
  },
  {
    id: "blastoise",
    name: "Blastoise",
    aliases: ["blastoise"],
    sprite: `${SHOWDOWN}/blastoise.gif`,
  },
  {
    id: "venusaur",
    name: "Venusaur",
    aliases: ["venusaur"],
    sprite: `${SHOWDOWN}/venusaur.gif`,
  },
  {
    id: "mewtwo",
    name: "Mewtwo",
    aliases: ["mewtwo"],
    sprite: `${SHOWDOWN}/mewtwo.gif`,
  },
  {
    id: "umbreon",
    name: "Umbreon",
    aliases: ["umbreon"],
    sprite: `${SHOWDOWN}/umbreon.gif`,
  },
  {
    id: "tyranitar",
    name: "Tyranitar",
    aliases: ["tyranitar"],
    sprite: `${SHOWDOWN}/tyranitar.gif`,
  },
];

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

export function GuessPokemon() {
  const deck = useMemo(() => shuffle(POKEDEX), []);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);

  const current = deck[index % deck.length];
  const showSprite = revealed;

  function awardAndAdvance(points: number, message: string) {
    setScore((s) => s + points);
    setFeedback(message);
    setRevealed(true);
    if (points > 0) {
      setStreak((prev) => {
        const next = prev + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
    } else {
      setStreak(0);
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (revealed) return;
    const targets = [current.name, ...current.aliases];
    if (fuzzyMatch(guess, targets)) {
      awardAndAdvance(100 + streak * 10, `Correct — ${current.name}!`);
    } else {
      setFeedback("Not quite. Try again or reveal.");
    }
  }

  function handleReveal() {
    if (revealed) return;
    awardAndAdvance(0, `It was ${current.name}.`);
  }

  function handleNext() {
    setIndex((i) => i + 1);
    setGuess("");
    setRevealed(false);
    setFeedback(null);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
      <div className="border border-sz-jade/20 bg-sz-panel/50 p-6 shadow-[0_0_40px_rgba(61,255,154,0.06)]">
        <div
          className={`relative flex min-h-[300px] flex-col items-center justify-center overflow-hidden rounded-2xl border py-10 transition duration-500 ${
            showSprite
              ? "border-sz-jade/30 bg-sz-void/70"
              : "border-[#c9d4e3]/80 bg-[radial-gradient(circle_at_50%_45%,#ffffff_0%,#e8eef6_55%,#d5deea_100%)]"
          }`}
        >
          {!showSprite ? (
            <div
              className="pointer-events-none absolute inset-0 opacity-40"
              style={{
                backgroundImage:
                  "radial-gradient(circle at 50% 52%, transparent 28%, rgba(18,21,28,0.06) 70%)",
              }}
              aria-hidden
            />
          ) : null}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={current.sprite}
            alt={showSprite ? current.name : "Mystery Pokémon silhouette"}
            width={220}
            height={220}
            className={`image-pixelated relative h-[min(48vw,220px)] w-auto transition duration-500 ${
              showSprite
                ? "drop-shadow-[0_0_28px_rgba(61,255,154,0.45)]"
                : "brightness-0 contrast-[1.15] drop-shadow-[0_10px_18px_rgba(18,21,28,0.35)]"
            }`}
            draggable={false}
          />
          <p
            className={`relative mt-5 font-mono text-[10px] uppercase tracking-[0.28em] ${
              showSprite ? "text-sz-mist/40" : "text-[#2a3140]/55"
            }`}
          >
            {showSprite ? current.name : "Who's that Pokémon?"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={revealed}
            placeholder="Type the species name…"
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-sz-void px-4 py-2.5 text-sz-mist outline-none focus:border-sz-jade/60 disabled:opacity-50"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={revealed || !guess.trim()}
            className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold disabled:opacity-40"
          >
            Guess
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-3">
          <button
            type="button"
            onClick={handleReveal}
            disabled={revealed}
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-sz-mist/80 transition hover:border-sz-ember/50 disabled:opacity-40"
          >
            Reveal
          </button>
          {revealed ? (
            <button
              type="button"
              onClick={handleNext}
              className="rounded-full border border-sz-jade/40 px-4 py-2 text-sm text-sz-jade transition hover:bg-sz-jade/10"
            >
              Next Pokémon →
            </button>
          ) : null}
        </div>

        {feedback ? (
          <p className="mt-4 text-sm text-sz-gold">{feedback}</p>
        ) : null}
      </div>

      <aside className="border border-white/10 bg-sz-panel/40 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-mist/45">
          Scoreboard
        </p>
        <dl className="mt-4 space-y-4">
          <div className="flex items-end justify-between border-b border-white/8 pb-3">
            <dt className="text-sm text-sz-mist/60">Total</dt>
            <dd className="display text-3xl font-bold text-sz-jade">{score}</dd>
          </div>
          <div className="flex items-end justify-between border-b border-white/8 pb-3">
            <dt className="text-sm text-sz-mist/60">Streak</dt>
            <dd className="display text-2xl font-bold text-sz-gold">{streak}</dd>
          </div>
          <div className="flex items-end justify-between">
            <dt className="text-sm text-sz-mist/60">Best streak</dt>
            <dd className="display text-xl font-bold text-sz-mist">{bestStreak}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs leading-relaxed text-sz-mist/40">
          Silhouette on a light board until you nail it. Fan sprites via Showdown
          · Pokémon © Nintendo / Creatures / GAME FREAK.
        </p>
      </aside>
    </div>
  );
}
