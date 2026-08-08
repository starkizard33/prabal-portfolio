"use client";

import { fireConfetti } from "@/components/fx/confetti";
import { fuzzyMatch } from "@/components/starkizard/games/normalizeGuess";
import { GuessScoreboard } from "@/components/starkizard/games/GuessScoreboard";
import { awardGuessPoints } from "@/components/starkizard/games/scoring";
import {
  LINKIN_PARK_LYRIC_SONGS,
  type LinkinParkSong,
} from "@/data/linkinParkSongs";
import { useEffect, useState, type FormEvent } from "react";

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function snippetContainsTitle(snippet: string, title: string): boolean {
  const hay = ` ${normalize(snippet)} `;
  const full = normalize(title);
  if (hay.includes(` ${full} `)) return true;
  const significant = full.split(" ").filter((token) => token.length > 3);
  if (significant.length === 0) {
    return full.split(" ").some((token) => token.length > 2 && hay.includes(` ${token} `));
  }
  if (significant.length === 1) {
    return hay.includes(` ${significant[0]} `);
  }
  return significant.every((token) => hay.includes(` ${token} `));
}

function pickSnippet(lyrics: string[], title: string): string {
  const windowSizes = [2, 3, 4];

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const size = windowSizes[Math.floor(Math.random() * windowSizes.length)];
    if (lyrics.length < size) continue;
    const start = Math.floor(Math.random() * (lyrics.length - size + 1));
    const slice = lyrics.slice(start, start + size).join(" / ");
    if (!snippetContainsTitle(slice, title)) {
      return slice;
    }
  }

  for (const size of [2, 3, 4]) {
    for (let start = 0; start <= lyrics.length - size; start += 1) {
      const slice = lyrics.slice(start, start + size).join(" / ");
      if (!snippetContainsTitle(slice, title)) return slice;
    }
  }
  return lyrics.slice(0, Math.min(2, lyrics.length)).join(" / ");
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

type Round = LinkinParkSong & { snippet: string };

function buildDeck(): Round[] {
  return shuffle(LINKIN_PARK_LYRIC_SONGS).map((song) => ({
    ...song,
    snippet: pickSnippet(song.lyrics!, song.title),
  }));
}

export function GuessLinkinPark() {
  const [deck, setDeck] = useState<Round[] | null>(null);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const [misses, setMisses] = useState(0);

  useEffect(() => {
    setDeck(buildDeck());
  }, []);

  if (!deck) {
    return (
      <p className="border border-white/10 bg-sz-panel/50 p-6 text-sm text-sz-mist/60">
        Shuffling lyrics…
      </p>
    );
  }

  const current = deck[index % deck.length];

  function settle(points: number, message: string) {
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
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (revealed) return;
    const targets = [current.title, ...current.aliases];
    if (fuzzyMatch(guess, targets)) {
      const points = awardGuessPoints(misses, streak);
      settle(points, `Correct — ${current.title} (+${points})`);
    } else {
      setMisses((m) => m + 1);
      setFeedback("Close the notebook and try again, or reveal.");
      setGuess("");
    }
  }

  function handleSkip() {
    if (revealed) return;
    settle(0, `It was “${current.title}” · ${current.album}`);
  }

  function handleNext() {
    setIndex((i) => i + 1);
    setGuess("");
    setRevealed(false);
    setFeedback(null);
    setMisses(0);
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="border border-sz-jade/20 bg-sz-panel/50 p-6 shadow-[0_0_40px_rgba(61,255,154,0.06)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sz-mist/40">
          Random lyric fragment
        </p>
        <blockquote className="display mt-4 text-2xl leading-snug font-bold text-sz-mist md:text-3xl">
          “{current.snippet}”
        </blockquote>
        {revealed ? (
          <p className="mt-4 text-sm text-sz-gold">
            {current.title}{" "}
            <span className="text-sz-mist/45">· {current.album}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-sz-mist/45">
            Title never appears in the fragment. Name the song.
          </p>
        )}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={revealed}
            placeholder="Song title…"
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
            onClick={handleSkip}
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
              Next snippet →
            </button>
          ) : null}
        </div>

        {feedback ? (
          <p className="mt-4 text-sm text-sz-mist/80">{feedback}</p>
        ) : null}
      </div>

      <GuessScoreboard
        score={score}
        streak={streak}
        bestStreak={bestStreak}
        stepNoun="miss"
        footer={
          <>
            Short fair-use lyric fragments for a personal fan quiz. Linkin Park ©
            respective rights holders.
          </>
        }
      />
    </div>
  );
}
