"use client";

import { fireConfetti } from "@/components/fx/confetti";
import { fuzzyMatch } from "@/components/starkizard/games/normalizeGuess";
import { GuessScoreboard } from "@/components/starkizard/games/GuessScoreboard";
import { awardGuessPoints } from "@/components/starkizard/games/scoring";
import { useCallback, useEffect, useMemo, useState, type FormEvent } from "react";

/** Compact wire format from /data/pokedex.json */
type SlimDexEntry = {
  id: number;
  name: string;
  types: string[];
  generation: number;
  funFact: string;
};

export type PokedexEntry = SlimDexEntry & {
  aliases: string[];
  region: string;
  sprite: string;
  spriteFallback: string;
};

const GEN_REGION: Record<number, string> = {
  1: "Kanto",
  2: "Johto",
  3: "Hoenn",
  4: "Sinnoh",
  5: "Unova",
  6: "Kalos",
  7: "Alola",
  8: "Galar",
  9: "Paldea",
};

const ARTWORK =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon/other/official-artwork";
const SPRITE =
  "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";

function aliasesFor(name: string): string[] {
  const lower = name.toLowerCase();
  const noPunct = lower.replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
  const joined = noPunct.replace(/\s+/g, "");
  return Array.from(new Set([lower, noPunct, joined].filter(Boolean)));
}

function hydrateEntry(entry: SlimDexEntry): PokedexEntry {
  return {
    ...entry,
    aliases: aliasesFor(entry.name),
    region: GEN_REGION[entry.generation] || "Unknown",
    sprite: `${ARTWORK}/${entry.id}.png`,
    spriteFallback: `${SPRITE}/${entry.id}.png`,
  };
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type HintTier = 0 | 1 | 2 | 3 | 4;

export function GuessPokemon() {
  const [dex, setDex] = useState<PokedexEntry[] | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [fails, setFails] = useState<HintTier>(0);
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [spriteSrc, setSpriteSrc] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/data/pokedex.json")
      .then((res) => {
        if (!res.ok) throw new Error(`Could not load Pokédex (${res.status})`);
        return res.json() as Promise<SlimDexEntry[]>;
      })
      .then((data) => {
        if (!cancelled) setDex(shuffle(data.map(hydrateEntry)));
      })
      .catch((err: Error) => {
        if (!cancelled) setLoadError(err.message || "Failed to load Pokédex");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const current = dex && dex.length > 0 ? dex[index % dex.length] : null;

  useEffect(() => {
    if (current) setSpriteSrc(current.sprite);
  }, [current]);

  const showSprite = revealed;
  const hintRegion = fails >= 1;
  const hintTypes = fails >= 2;
  const hintNumber = fails >= 3;
  const hintPartialName = fails >= 4;

  const partialName = useMemo(() => {
    if (!current) return "";
    const letters = current.name.split("");
    return letters
      .map((ch, i) => {
        if (ch === " " || ch === "-" || ch === ".") return ch;
        if (i === 0 || i === letters.length - 1) return ch;
        return "·";
      })
      .join("");
  }, [current]);

  const settle = useCallback(
    (points: number, message: string) => {
      setScore((s) => s + points);
      setFeedback(message);
      setRevealed(true);
      if (points > 0) {
        fireConfetti({ count: 80 });
        setStreak((prev) => {
          const next = prev + 1;
          setBestStreak((best) => Math.max(best, next));
          return next;
        });
      } else {
        setStreak(0);
      }
    },
    [],
  );

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!current || revealed) return;
    const targets = [current.name, ...current.aliases];
    if (fuzzyMatch(guess, targets)) {
      const points = awardGuessPoints(fails, streak);
      settle(
        points,
        `Correct — ${current.name}! (+${points})${fails === 0 ? " First try." : ""}`,
      );
      return;
    }

    if (fails >= 4) {
      settle(0, `It was ${current.name}. ${current.funFact}`);
      return;
    }

    const next = (fails + 1) as HintTier;
    setFails(next);
    setGuess("");
    const messages: Record<HintTier, string> = {
      0: "Not quite.",
      1: "Hint unlocked: home region.",
      2: "Hint unlocked: typing.",
      3: "Hint unlocked: National Pokédex number.",
      4: "Last hint: partial name. One more miss reveals it.",
    };
    setFeedback(messages[next]);
  }

  function handleReveal() {
    if (!current || revealed) return;
    settle(0, `It was ${current.name}.`);
  }

  function handleNext() {
    setIndex((i) => i + 1);
    setGuess("");
    setFails(0);
    setRevealed(false);
    setFeedback(null);
  }

  if (loadError) {
    return (
      <p className="border border-sz-ember/40 bg-sz-panel/50 p-6 text-sm text-sz-ember">
        {loadError}
      </p>
    );
  }

  if (!current) {
    return (
      <p className="border border-white/10 bg-sz-panel/50 p-6 text-sm text-sz-mist/60">
        Loading national Pokédex…
      </p>
    );
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
            src={spriteSrc || current.sprite}
            alt={showSprite ? current.name : "Mystery Pokémon silhouette"}
            width={220}
            height={220}
            onError={() => {
              if (spriteSrc !== current.spriteFallback) {
                setSpriteSrc(current.spriteFallback);
              }
            }}
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

        {!revealed ? (
          <ul className="mt-5 space-y-2 text-sm text-sz-mist/70">
            {hintRegion ? (
              <li>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sz-mist/40">
                  Region
                </span>{" "}
                <span className="text-sz-jade">{current.region}</span>
                <span className="text-sz-mist/40"> · Gen {current.generation}</span>
              </li>
            ) : null}
            {hintTypes ? (
              <li>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sz-mist/40">
                  Type
                </span>{" "}
                <span className="text-sz-gold">{current.types.join(" / ")}</span>
              </li>
            ) : null}
            {hintNumber ? (
              <li>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sz-mist/40">
                  National dex
                </span>{" "}
                <span className="text-sz-mist">#{String(current.id).padStart(4, "0")}</span>
              </li>
            ) : null}
            {hintPartialName ? (
              <li>
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sz-mist/40">
                  Name shape
                </span>{" "}
                <span className="font-mono tracking-[0.18em] text-sz-mist">{partialName}</span>
              </li>
            ) : null}
            {!hintRegion ? (
              <li className="text-sz-mist/40">Miss to unlock hints: region → type → # → name shape.</li>
            ) : null}
          </ul>
        ) : (
          <p className="mt-5 text-sm leading-relaxed text-sz-mist/70">
            <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-sz-jade/70">
              Fun fact
            </span>
            <br />
            {current.funFact}
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={revealed}
            placeholder="Type the species name…"
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-sz-void px-4 py-2.5 text-base text-sz-mist outline-none focus:border-sz-jade/60 disabled:opacity-50"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={revealed || !guess.trim()}
            className="w-full rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold disabled:opacity-40 sm:w-auto"
          >
            Guess
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleReveal}
            disabled={revealed}
            className="w-full rounded-full border border-white/15 px-4 py-2 text-sm text-sz-mist/80 transition hover:border-sz-ember/50 disabled:opacity-40 sm:w-auto"
          >
            Reveal
          </button>
          {revealed ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-full border border-sz-jade/40 px-4 py-2 text-sm text-sz-jade transition hover:bg-sz-jade/10 sm:w-auto"
            >
              Next Pokémon →
            </button>
          ) : null}
        </div>

        {feedback ? (
          <p className="mt-4 text-sm text-sz-gold">{feedback}</p>
        ) : null}
      </div>

      <GuessScoreboard
        score={score}
        streak={streak}
        bestStreak={bestStreak}
        extras={[{ label: "Dex size", value: dex?.length ?? "—" }]}
        stepNoun="miss (hint unlock)"
        footer={
          <>
            Full national dex (all gens). Sprites via PokeAPI · Pokémon © Nintendo /
            Creatures / GAME FREAK.
          </>
        }
      />
    </div>
  );
}
