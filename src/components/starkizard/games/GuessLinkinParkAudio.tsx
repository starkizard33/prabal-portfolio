"use client";

import { fireConfetti } from "@/components/fx/confetti";
import { fuzzyMatch } from "@/components/starkizard/games/normalizeGuess";
import { GuessScoreboard } from "@/components/starkizard/games/GuessScoreboard";
import { awardGuessPoints } from "@/components/starkizard/games/scoring";
import {
  CLIP_SECONDS,
  LINKIN_PARK_SONGS,
  type LinkinParkSong,
} from "@/data/linkinParkSongs";
import { useCallback, useEffect, useRef, useState, type FormEvent } from "react";

type PreviewPayload = {
  preview: string;
  title: string;
  album: string | null;
  cover: string | null;
};

type RoundState = {
  attempt: number;
  solved: boolean;
  gaveUp: boolean;
  guesses: string[];
};

function clipForAttempt(attempt: number): number {
  return CLIP_SECONDS[Math.min(attempt, CLIP_SECONDS.length - 1)];
}

function shuffle<T>(items: T[]): T[] {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const freshRound = (): RoundState => ({
  attempt: 0,
  solved: false,
  gaveUp: false,
  guesses: [],
});

export function GuessLinkinParkAudio() {
  const [deck, setDeck] = useState<LinkinParkSong[] | null>(null);
  const [index, setIndex] = useState(0);
  const [round, setRound] = useState<RoundState>(freshRound);
  const [guess, setGuess] = useState("");
  const [feedback, setFeedback] = useState<string | null>(null);
  const [preview, setPreview] = useState<PreviewPayload | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [loadingPreview, setLoadingPreview] = useState(true);
  const [playing, setPlaying] = useState(false);
  const [score, setScore] = useState(0);
  const [streak, setStreak] = useState(0);
  const [bestStreak, setBestStreak] = useState(0);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const stopTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    setDeck(shuffle(LINKIN_PARK_SONGS));
  }, []);

  const song = deck ? deck[index % deck.length] : null;
  const done = round.solved || round.gaveUp;
  const clipSeconds = clipForAttempt(round.attempt);

  const stopClip = useCallback(() => {
    if (stopTimerRef.current) {
      clearTimeout(stopTimerRef.current);
      stopTimerRef.current = null;
    }
    const audio = audioRef.current;
    if (audio) {
      audio.pause();
      audio.currentTime = 0;
    }
    setPlaying(false);
  }, []);

  useEffect(() => () => stopClip(), [stopClip]);

  useEffect(() => {
    if (!song) return;
    let cancelled = false;
    stopClip();
    setLoadingPreview(true);
    setLoadError(null);
    setPreview(null);
    fetch(`/api/itunes/preview?title=${encodeURIComponent(song.title)}`)
      .then(async (res) => {
        if (!res.ok) {
          const body = (await res.json().catch(() => null)) as { error?: string } | null;
          throw new Error(body?.error || `Preview unavailable (${res.status})`);
        }
        return res.json() as Promise<PreviewPayload>;
      })
      .then((data) => {
        if (!cancelled) {
          setPreview(data);
          setLoadingPreview(false);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) {
          setLoadError(err.message || "Could not load preview");
          setLoadingPreview(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [song, stopClip]);

  async function playClip() {
    if (!preview?.preview || done) return;
    stopClip();
    const audio = audioRef.current ?? new Audio();
    audioRef.current = audio;
    audio.src = preview.preview;
    audio.currentTime = 0;
    try {
      await audio.play();
      setPlaying(true);
      stopTimerRef.current = setTimeout(() => {
        stopClip();
      }, clipSeconds * 1000 + 40);
    } catch {
      setFeedback("Browser blocked audio — tap play again after interacting with the page.");
    }
  }

  function handleSubmit(event: FormEvent) {
    event.preventDefault();
    if (!song || done || !guess.trim()) return;
    const targets = [song.title, ...song.aliases];
    const nextGuesses = [...round.guesses, guess.trim()];

    if (fuzzyMatch(guess, targets)) {
      const points = awardGuessPoints(round.attempt, streak);
      setScore((s) => s + points);
      setStreak((s) => {
        const next = s + 1;
        setBestStreak((best) => Math.max(best, next));
        return next;
      });
      setRound({ ...round, solved: true, guesses: nextGuesses });
      setFeedback(`Correct — ${song.title} (+${points})`);
      fireConfetti({ count: 80 });
      stopClip();
      return;
    }

    advanceAttempt(nextGuesses, "miss");
    setGuess("");
  }

  function advanceAttempt(guesses: string[], reason: "miss" | "skip") {
    if (!song) return;
    const nextAttempt = Math.min(round.attempt + 1, CLIP_SECONDS.length);
    const exhausted = nextAttempt >= CLIP_SECONDS.length;
    stopClip();
    if (exhausted) {
      setStreak(0);
      setRound({
        ...round,
        attempt: nextAttempt,
        gaveUp: true,
        guesses,
      });
      setFeedback(`Out of clips — it was “${song.title}” · ${song.album}`);
      return;
    }
    setRound({
      ...round,
      attempt: nextAttempt,
      guesses,
    });
    const nextClip = clipForAttempt(nextAttempt);
    setFeedback(
      reason === "skip"
        ? `Skipped — now ${nextClip}s available.`
        : `Not it. Next listen unlocks ${nextClip}s of the preview.`,
    );
  }

  function handleSkipClip() {
    if (!song || done || !!loadError) return;
    if (round.attempt >= CLIP_SECONDS.length - 1) return;
    advanceAttempt(round.guesses, "skip");
  }

  function handleReveal() {
    if (!song || done) return;
    setStreak(0);
    setRound({ ...round, gaveUp: true });
    setFeedback(`It was “${song.title}” · ${song.album}`);
    stopClip();
  }

  function handleNext() {
    stopClip();
    setIndex((i) => i + 1);
    setRound(freshRound());
    setGuess("");
    setFeedback(null);
  }

  if (!deck || !song) {
    return (
      <p className="border border-white/10 bg-sz-panel/50 p-6 text-sm text-sz-mist/60">
        Loading track deck…
      </p>
    );
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
      <div className="border border-sz-jade/20 bg-sz-panel/50 p-6 shadow-[0_0_40px_rgba(61,255,154,0.06)]">
        <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sz-mist/40">
          Progressive preview · track {(index % deck.length) + 1}/{deck.length}
        </p>
        <h3 className="display mt-3 text-2xl font-bold text-sz-mist md:text-3xl">
          Guess from audio
        </h3>
        <p className="mt-2 text-sm text-sz-mist/55">
          Clips grow {CLIP_SECONDS.map((s) => `${s}s`).join(" → ")}. Keep playing —
          shuffled deck, no daily limit.
        </p>

        <div className="mt-6 flex flex-col items-stretch gap-4 sm:flex-row sm:items-center">
          <button
            type="button"
            onClick={playClip}
            disabled={loadingPreview || !!loadError || done || !preview}
            className="w-full rounded-full bg-sz-jade px-6 py-3 text-sm font-semibold text-sz-void transition hover:bg-sz-gold disabled:opacity-40 sm:w-auto"
          >
            {playing ? `Playing ${clipSeconds}s…` : `Play ${clipSeconds}s clip`}
          </button>
          {playing ? (
            <button
              type="button"
              onClick={stopClip}
              className="w-full rounded-full border border-white/15 px-4 py-2 text-sm text-sz-mist/80 sm:w-auto"
            >
              Stop
            </button>
          ) : null}
          <p className="font-mono text-xs text-sz-mist/45">
            Clip {clipSeconds}s · attempt{" "}
            {Math.min(round.attempt + 1, CLIP_SECONDS.length)}/{CLIP_SECONDS.length}
          </p>
        </div>

        {loadingPreview ? (
          <p className="mt-4 text-sm text-sz-mist/50">Fetching iTunes preview…</p>
        ) : null}
        {loadError ? (
          <div className="mt-4 space-y-2">
            <p className="text-sm text-sz-ember">{loadError}</p>
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-full border border-sz-jade/40 px-4 py-2 text-sm text-sz-jade sm:w-auto"
            >
              Skip this track →
            </button>
          </div>
        ) : null}

        <form onSubmit={handleSubmit} className="mt-6 flex flex-col gap-3 sm:flex-row">
          <input
            value={guess}
            onChange={(e) => setGuess(e.target.value)}
            disabled={done || !!loadError}
            placeholder="Song title…"
            className="min-w-0 flex-1 rounded-full border border-white/15 bg-sz-void px-4 py-2.5 text-base text-sz-mist outline-none focus:border-sz-jade/60 disabled:opacity-50"
            autoComplete="off"
            spellCheck={false}
          />
          <button
            type="submit"
            disabled={done || !guess.trim() || !!loadError}
            className="w-full rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold disabled:opacity-40 sm:w-auto"
          >
            Guess
          </button>
        </form>

        <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
          <button
            type="button"
            onClick={handleSkipClip}
            disabled={
              done ||
              !!loadError ||
              round.attempt >= CLIP_SECONDS.length - 1
            }
            className="w-full rounded-full border border-white/15 px-4 py-2 text-sm text-sz-mist/80 transition hover:border-sz-jade/50 disabled:opacity-40 sm:w-auto"
          >
            Skip to longer clip
          </button>
          <button
            type="button"
            onClick={handleReveal}
            disabled={done || !!loadError}
            className="w-full rounded-full border border-white/15 px-4 py-2 text-sm text-sz-mist/80 transition hover:border-sz-ember/50 disabled:opacity-40 sm:w-auto"
          >
            Reveal
          </button>
          {done ? (
            <button
              type="button"
              onClick={handleNext}
              className="w-full rounded-full border border-sz-jade/40 px-4 py-2 text-sm text-sz-jade transition hover:bg-sz-jade/10 sm:w-auto"
            >
              Next track →
            </button>
          ) : null}
        </div>

        {done ? (
          <p className="mt-4 text-sm text-sz-gold">
            {song.title}{" "}
            <span className="text-sz-mist/45">· {song.album}</span>
          </p>
        ) : null}

        {feedback ? <p className="mt-4 text-sm text-sz-mist/80">{feedback}</p> : null}

        {round.guesses.length > 0 ? (
          <ul className="mt-4 space-y-1 text-xs text-sz-mist/40">
            {round.guesses.map((g, i) => (
              <li key={`${g}-${i}`}>
                #{i + 1} · {g}
              </li>
            ))}
          </ul>
        ) : null}
      </div>

      <GuessScoreboard
        score={score}
        streak={streak}
        bestStreak={bestStreak}
        stepNoun="miss / skip-to-longer-clip"
        howTo={
          <ol className="list-decimal space-y-2 pl-4">
            <li>Play starts at {CLIP_SECONDS[0]}s.</li>
            <li>Miss or skip unlocks a longer clip (costs a scoring step).</li>
            <li>Reveal shows the title; then go to the next track.</li>
          </ol>
        }
        footer={
          <>
            Streams iTunes Search API ~30s previews (proxied) — not hosted MP3s.
            Linkin Park © rights holders.
          </>
        }
      />
    </div>
  );
}
