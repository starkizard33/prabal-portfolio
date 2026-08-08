import {
  SCORE,
  scoreLadderPreview,
} from "@/components/starkizard/games/scoring";
import type { ReactNode } from "react";

type ExtraStat = {
  label: string;
  value: string | number;
};

type GuessScoreboardProps = {
  score: number;
  streak: number;
  bestStreak?: number;
  extras?: ExtraStat[];
  /** What increments the −20 step (shown in the key). */
  stepNoun: string;
  howTo?: ReactNode;
  footer?: ReactNode;
};

export function GuessScoreboard({
  score,
  streak,
  bestStreak,
  extras = [],
  stepNoun,
  howTo,
  footer,
}: GuessScoreboardProps) {
  return (
    <aside className="border border-white/10 bg-sz-panel/40 p-5">
      <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-mist/45">
        Scoreboard
      </p>
      <dl className="mt-4 space-y-4">
        <div className="flex items-end justify-between border-b border-white/8 pb-3">
          <dt className="text-sm text-sz-mist/60">Points</dt>
          <dd className="display text-3xl font-bold text-sz-jade">{score}</dd>
        </div>
        <div className="flex items-end justify-between border-b border-white/8 pb-3">
          <dt className="text-sm text-sz-mist/60">Streak</dt>
          <dd className="display text-2xl font-bold text-sz-gold">{streak}</dd>
        </div>
        {bestStreak !== undefined ? (
          <div className="flex items-end justify-between border-b border-white/8 pb-3">
            <dt className="text-sm text-sz-mist/60">Best streak</dt>
            <dd className="display text-xl font-bold text-sz-mist">{bestStreak}</dd>
          </div>
        ) : null}
        {extras.map((stat) => (
          <div
            key={stat.label}
            className="flex items-end justify-between border-b border-white/8 pb-3 last:border-b-0 last:pb-0"
          >
            <dt className="text-sm text-sz-mist/60">{stat.label}</dt>
            <dd className="font-mono text-sm text-sz-mist/70">{stat.value}</dd>
          </div>
        ))}
      </dl>

      <div className="mt-6 border-t border-white/8 pt-5">
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-mist/45">
          Scoring key
        </p>
        <ul className="mt-3 space-y-2 text-xs leading-relaxed text-sz-mist/60">
          <li>
            Base <span className="text-sz-jade">{SCORE.base}</span> on a correct
            answer.
          </li>
          <li>
            −{SCORE.stepPenalty} per {stepNoun} before you land it.
          </li>
          <li>
            Ladder {scoreLadderPreview()} (before streak).
          </li>
          <li>
            +{SCORE.streakBonus} × current streak when you score.
          </li>
          <li>Reveal / skip-to-answer = 0 · streak resets.</li>
        </ul>
      </div>

      {howTo ? <div className="mt-5 text-sm text-sz-mist/65">{howTo}</div> : null}
      {footer ? (
        <div className="mt-5 text-xs leading-relaxed text-sz-mist/40">{footer}</div>
      ) : null}
    </aside>
  );
}
