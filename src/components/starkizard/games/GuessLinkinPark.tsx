"use client";

import { fuzzyMatch } from "@/components/starkizard/games/normalizeGuess";
import { useMemo, useState, type FormEvent } from "react";

type SongEntry = {
  id: string;
  title: string;
  album: string;
  lyricsSnippet: string;
  aliases: string[];
};

const SONGS: SongEntry[] = [
  {
    id: "in-the-end",
    title: "In the End",
    album: "Hybrid Theory",
    lyricsSnippet: "I tried so hard and got so far",
    aliases: ["in the end"],
  },
  {
    id: "numb",
    title: "Numb",
    album: "Meteora",
    lyricsSnippet: "I've become so numb, I can't feel you there",
    aliases: ["numb"],
  },
  {
    id: "crawling",
    title: "Crawling",
    album: "Hybrid Theory",
    lyricsSnippet: "Crawling in my skin, these wounds they will not heal",
    aliases: ["crawling"],
  },
  {
    id: "breaking-the-habit",
    title: "Breaking the Habit",
    album: "Meteora",
    lyricsSnippet: "I don't know what's worth fighting for",
    aliases: ["breaking the habit"],
  },
  {
    id: "what-ive-done",
    title: "What I've Done",
    album: "Minutes to Midnight",
    lyricsSnippet: "What I've done, I'll face myself",
    aliases: ["what ive done", "what i've done"],
  },
  {
    id: "one-step-closer",
    title: "One Step Closer",
    album: "Hybrid Theory",
    lyricsSnippet: "Everything you say to me takes me one step closer",
    aliases: ["one step closer"],
  },
  {
    id: "faint",
    title: "Faint",
    album: "Meteora",
    lyricsSnippet: "I am a little bit of loneliness, a little bit of disregard",
    aliases: ["faint"],
  },
  {
    id: "somewhere-i-belong",
    title: "Somewhere I Belong",
    album: "Meteora",
    lyricsSnippet: "I want to heal, I want to feel what I thought was never real",
    aliases: ["somewhere i belong"],
  },
  {
    id: "papercut",
    title: "Papercut",
    album: "Hybrid Theory",
    lyricsSnippet: "Why does it feel like night today?",
    aliases: ["papercut", "paper cut"],
  },
  {
    id: "bleed-it-out",
    title: "Bleed It Out",
    album: "Minutes to Midnight",
    lyricsSnippet: "Yeah, here we go for the hundredth time",
    aliases: ["bleed it out"],
  },
  {
    id: "new-divide",
    title: "New Divide",
    album: "Transformers: Revenge of the Fallen",
    lyricsSnippet: "I remembered black skies, the lightning all around me",
    aliases: ["new divide"],
  },
  {
    id: "waiting-for-the-end",
    title: "Waiting for the End",
    album: "A Thousand Suns",
    lyricsSnippet: "This is not the end, this is not the beginning",
    aliases: ["waiting for the end"],
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

export function GuessLinkinPark() {
  const deck = useMemo(() => shuffle(SONGS), []);
  const [index, setIndex] = useState(0);
  const [guess, setGuess] = useState("");
  const [revealed, setRevealed] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);

  const current = deck[index % deck.length];

  function settle(points: number, message: string) {
    setScore((s) => s + points);
    setFeedback(message);
    setRevealed(true);
    setStreak((prev) => (points > 0 ? prev + 1 : 0));
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (revealed) return;
    const targets = [current.title, ...current.aliases];
    if (fuzzyMatch(guess, targets)) {
      settle(100 + streak * 15, `Correct — ${current.title}`);
    } else {
      setFeedback("Close the notebook and try again, or skip.");
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
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="border border-sz-jade/20 bg-sz-panel/50 p-6 shadow-[0_0_40px_rgba(61,255,154,0.06)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sz-mist/40">
          Lyrics snippet
        </p>
        <blockquote className="display mt-4 text-2xl leading-snug font-bold text-sz-mist md:text-3xl">
          “{current.lyricsSnippet}”
        </blockquote>
        {revealed ? (
          <p className="mt-4 text-sm text-sz-gold">
            {current.title} <span className="text-sz-mist/45">· {current.album}</span>
          </p>
        ) : (
          <p className="mt-4 text-sm text-sz-mist/45">Name the song title.</p>
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
            Skip / reveal
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

      <aside className="border border-white/10 bg-sz-panel/40 p-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-mist/45">
          Scoreboard
        </p>
        <dl className="mt-4 space-y-4">
          <div className="flex items-end justify-between border-b border-white/8 pb-3">
            <dt className="text-sm text-sz-mist/60">Points</dt>
            <dd className="display text-3xl font-bold text-sz-jade">{score}</dd>
          </div>
          <div className="flex items-end justify-between">
            <dt className="text-sm text-sz-mist/60">Streak</dt>
            <dd className="display text-2xl font-bold text-sz-gold">{streak}</dd>
          </div>
        </dl>
        <p className="mt-6 text-xs leading-relaxed text-sz-mist/40">
          Short fair-use lyric fragments for a personal fan quiz. Linkin Park ©
          respective rights holders.
        </p>
      </aside>
    </div>
  );
}
