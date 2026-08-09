"use client";

import { fuzzyMatch } from "@/components/starkizard/games/normalizeGuess";
import { useMemo, useState, type FormEvent } from "react";

type SongEntry = {
  id: string;
  title: string;
  album: string;
  aliases: string[];
  /** Full lyric lines used for random sampling (short fair-use fragments). */
  lyrics: string[];
};

const SONGS: SongEntry[] = [
  {
    id: "in-the-end",
    title: "In the End",
    album: "Hybrid Theory",
    aliases: ["in the end"],
    lyrics: [
      "It starts with one",
      "One thing I don't know why",
      "It doesn't even matter how hard you try",
      "Keep that in mind I designed this rhyme",
      "To explain in due time",
      "All I know",
      "Time is a valuable thing",
      "Watch it fly by as the pendulum swings",
      "Watch it count down to the end of the day",
      "The clock ticks life away",
      "It's so unreal",
      "Didn't look out below",
      "Watch the time go right out the window",
      "Trying to hold on, but didn't even know",
      "I wasted it all just to watch you go",
      "I kept everything inside",
      "And even though I tried, it all fell apart",
      "What it meant to me will eventually be",
      "A memory of a time when I tried so hard",
    ],
  },
  {
    id: "numb",
    title: "Numb",
    album: "Meteora",
    aliases: ["numb"],
    lyrics: [
      "I'm tired of being what you want me to be",
      "Feeling so faithless, lost under the surface",
      "I don't know what you're expecting of me",
      "Put under the pressure of walking in your shoes",
      "Caught in the undertow, just caught in the undertow",
      "Every step that I take is another mistake to you",
      "Caught in the undertow, just caught in the undertow",
      "And every second I waste is more than I can take",
      "I've become so tired, so much more aware",
      "I'm becoming this, all I want to do",
      "Is be more like me and be less like you",
      "Can't you see that you're smothering me?",
      "Holding too tightly, afraid to lose control",
      "Cause everything that you thought I would be",
      "Has fallen apart right in front of you",
    ],
  },
  {
    id: "crawling",
    title: "Crawling",
    album: "Hybrid Theory",
    aliases: ["crawling"],
    lyrics: [
      "There's something inside me that pulls beneath the surface",
      "Consuming, confusing",
      "This lack of self-control I fear is never ending",
      "Controlling",
      "I can't seem to find myself again",
      "My walls are closing in",
      "Without a sense of confidence",
      "I'm convinced that there's just too much pressure to take",
      "These wounds, they will not heal",
      "Fear is how I fall",
      "Confusing what is real",
      "There's something inside me that pulls beneath the surface",
      "Consuming, confusing",
      "This lack of self-control I fear is never ending",
      "Controlling",
    ],
  },
  {
    id: "breaking-the-habit",
    title: "Breaking the Habit",
    album: "Meteora",
    aliases: ["breaking the habit"],
    lyrics: [
      "Memories consume like opening the wound",
      "I'm picking me apart again",
      "You all assume I'm safe here in my room",
      "Unless I try to start again",
      "I don't want to be the one the battles always choose",
      "Cause inside I realize that I'm the one confused",
      "I don't know how I got this way",
      "I know it's not alright",
      "Clutching my cure, I tightly lock the door",
      "I try to catch my breath again",
      "I hurt much more than anytime before",
      "I had no options left again",
    ],
  },
  {
    id: "what-ive-done",
    title: "What I've Done",
    album: "Minutes to Midnight",
    aliases: ["what ive done", "what i've done"],
    lyrics: [
      "In this farewell",
      "There's no blood, there's no alibi",
      "Cause I've drawn regret",
      "From the truth of a thousand lies",
      "So let mercy come and wash away",
      "I'll face myself to cross out what I've become",
      "Erase myself and let go of what I've done",
      "Put to rest what you thought of me",
      "While I clean this slate with the hands of uncertainty",
      "For what I've become",
      "I start again",
      "And whatever pain may come",
      "Today this ends",
      "I'm forgiving what I've done",
    ],
  },
  {
    id: "one-step-closer",
    title: "One Step Closer",
    album: "Hybrid Theory",
    aliases: ["one step closer"],
    lyrics: [
      "I cannot take this anymore",
      "Saying everything I've said before",
      "All these words, they make no sense",
      "I find disdain that I come off so tense",
      "This way",
      "Everything you say to me",
      "Takes me one step closer to the edge",
      "And I'm about to break",
      "I need a little room to breathe",
      "Cause I'm one step closer to the edge",
      "And I'm about to break",
      "I find the answers aren't so clear",
      "Wish I could find a way to disappear",
      "All these thoughts they make no sense",
      "I find disdain that I come off insane",
    ],
  },
  {
    id: "faint",
    title: "Faint",
    album: "Meteora",
    aliases: ["faint"],
    lyrics: [
      "I am a little bit of loneliness, a little bit of disregard",
      "Handful of complaints but I can't help the fact",
      "That everyone can see these scars",
      "I am what I want you to want, what I want you to feel",
      "But it's like no matter what I do, I can't convince you",
      "To just believe this is real",
      "So I let go, watching you turn your back like you always do",
      "Face away and pretend that I'm not",
      "But I'll be here cause you're all that I've got",
      "I can't feel the way I did before",
      "Don't turn your back on me",
      "I won't be ignored",
      "Time won't heal this damage anymore",
      "Don't turn your back on me",
      "I won't be ignored",
    ],
  },
  {
    id: "somewhere-i-belong",
    title: "Somewhere I Belong",
    album: "Meteora",
    aliases: ["somewhere i belong"],
    lyrics: [
      "When this began, I had nothing to say",
      "And I'd get lost in the nothingness inside of me",
      "I was confused and I let it all out to find",
      "That I'm not the only person with these things in mind",
      "Inside of me is this empty room",
      "Something just may be missing about me",
      "I can't be who I am",
      "I want to heal, I want to feel",
      "What I thought was never real",
      "I want to let go of the pain I've felt so long",
      "Erase all the pain till it's gone",
      "I want to heal, I want to feel like I'm close to something real",
      "I want to find something I've wanted all along",
    ],
  },
  {
    id: "papercut",
    title: "Papercut",
    album: "Hybrid Theory",
    aliases: ["papercut", "paper cut"],
    lyrics: [
      "Why does it feel like night today?",
      "Something in here's not right today",
      "Why am I so uptight today?",
      "Paranoia's all I got left",
      "I don't know what stressed me first",
      "Or how the pressure was fed",
      "But I know just what it feels like",
      "To have a voice in the back of my head",
      "It's like a face that I hold inside",
      "Face that awakes when I close my eyes",
      "Face that watches every time I lie",
      "Face that laughs every time I fall",
      "And watches everything",
      "So I know that when it's time to sink or swim",
      "That the face inside is hearing me",
    ],
  },
  {
    id: "bleed-it-out",
    title: "Bleed It Out",
    album: "Minutes to Midnight",
    aliases: ["bleed it out"],
    lyrics: [
      "Yeah, here we go for the hundredth time",
      "Hand grenade pins in every line",
      "Throw 'em up and let something shine",
      "Going out of my fucking mind",
      "Filthy mouth, no excuse",
      "Find a new place to hang this noose",
      "String me up from atop these roofs",
      "Knot it tight so I won't get loose",
      "Truth is you can stop and stare",
      "Bled myself out and no one cares",
      "Dug a trench out, laid down there",
      "With a shovel up out of reach somewhere",
      "Yeah, here we go for the hundredth time",
      "Hand grenade pins in every line",
      "Throw 'em up and let something shine",
    ],
  },
  {
    id: "new-divide",
    title: "New Divide",
    album: "Transformers: Revenge of the Fallen",
    aliases: ["new divide"],
    lyrics: [
      "I remembered black skies, the lightning all around me",
      "I remembered each flash as time began to blur",
      "Like a startling sign that fate had finally found me",
      "And your voice was all I heard",
      "That I get what I deserve",
      "So give me reason to prove me wrong",
      "To wash this memory clean",
      "Let the floods cross the distance in your eyes",
      "Give me reason to fill this hole",
      "Connect the space between",
      "Let it be enough to reach the truth that lies",
      "Across this new divide",
      "There was nothing in sight but memories left abandoned",
      "There was nowhere to hide, the ashes fell like snow",
    ],
  },
  {
    id: "waiting-for-the-end",
    title: "Waiting for the End",
    album: "A Thousand Suns",
    aliases: ["waiting for the end"],
    lyrics: [
      "This is not the end, this is not the beginning",
      "Just a voice like a riot rocking every revision",
      "But you listen to the tone and the violent rhythm",
      "And though the words sound steady, something empty's within 'em",
      "We say yeah with fists flying up in the air",
      "Like we're holding onto something that's invisible there",
      "Cause we're living at the mercy of the pain and the fear",
      "Until we dead it, forget it, let it all disappear",
      "Waiting for the end to come",
      "Wishing I had strength to stand",
      "This is not what I had planned",
      "It's out of my control",
      "Flying at the speed of light",
      "Thoughts were spinning in my head",
      "So many things were left unsaid",
    ],
  },
];

function normalize(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9\s]/g, " ").replace(/\s+/g, " ").trim();
}

function snippetContainsTitle(snippet: string, title: string): boolean {
  const hay = ` ${normalize(snippet)} `;
  const full = normalize(title);
  if (hay.includes(` ${full} `)) return true;
  const significant = full.split(" ").filter((token) => token.length > 3);
  if (significant.length === 0) {
    // Short titles like "Numb" / "Faint"
    return full.split(" ").some((token) => token.length > 2 && hay.includes(` ${token} `));
  }
  if (significant.length === 1) {
    return hay.includes(` ${significant[0]} `);
  }
  return significant.every((token) => hay.includes(` ${token} `));
}

function pickSnippet(lyrics: string[], title: string): string {
  const windowSizes = [2, 3, 4];
  const attempts: string[] = [];

  for (let attempt = 0; attempt < 48; attempt += 1) {
    const size = windowSizes[Math.floor(Math.random() * windowSizes.length)];
    if (lyrics.length < size) continue;
    const start = Math.floor(Math.random() * (lyrics.length - size + 1));
    const slice = lyrics.slice(start, start + size).join(" / ");
    if (!snippetContainsTitle(slice, title)) {
      return slice;
    }
    attempts.push(slice);
  }

  // Fallback: first non-leaking window, else first 2 lines filtered hard.
  for (let size of [2, 3, 4]) {
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

type Round = SongEntry & { snippet: string };

export function GuessLinkinPark() {
  const deck = useMemo<Round[]>(
    () =>
      shuffle(SONGS).map((song) => ({
        ...song,
        snippet: pickSnippet(song.lyrics, song.title),
      })),
    [],
  );
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
