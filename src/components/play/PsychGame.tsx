"use client";

import type {
  ClientMessage,
  PsychDeckId,
  RoomState,
} from "@shared/playProtocol";
import { MAX_ANSWER_LEN } from "@shared/playProtocol";
import { useMemo, useState } from "react";

type PsychGameProps = {
  room: RoomState;
  isHost: boolean;
  isSpectator?: boolean;
  send: (msg: ClientMessage) => void;
};

const DECKS: {
  id: PsychDeckId | "soon";
  title: string;
  blurb: string;
  color: string;
  live: boolean;
}[] = [
  {
    id: "truth-comes-out",
    title: "Truth Comes Out",
    blurb: "7 rounds of anonymous takes about this room. Vote for the best.",
    color: "var(--play-coral)",
    live: true,
  },
  {
    id: "truth-comes-out-nsfw",
    title: "Truth Comes Out · NSFW",
    blurb:
      "18+ · Spicy, messy, funny. Same rules — anonymous answers, then vote.",
    color: "var(--play-pink)",
    live: true,
  },
  {
    id: "soon",
    title: "More decks",
    blurb: "Coming soon.",
    color: "var(--play-yellow)",
    live: false,
  },
];

export function PsychGame({ room, isHost, isSpectator, send }: PsychGameProps) {
  if (room.phase === "psych_decks") {
    return <DeckPicker isHost={isHost} send={send} />;
  }

  const psych = room.psych;
  if (!psych) {
    return (
      <p className="text-sm text-[var(--play-text-muted)]">Loading Psych…</p>
    );
  }

  if (room.phase === "psych_answer") {
    return (
      <AnswerPhase
        psych={psych}
        isSpectator={isSpectator}
        send={send}
      />
    );
  }

  if (room.phase === "psych_vote") {
    return (
      <VotePhase psych={psych} isSpectator={isSpectator} send={send} />
    );
  }

  if (room.phase === "psych_round_result") {
    return (
      <RoundResultPhase
        room={room}
        psych={psych}
        isHost={isHost}
        send={send}
      />
    );
  }

  if (room.phase === "psych_final") {
    return <FinalPhase room={room} isHost={isHost} send={send} />;
  }

  return null;
}

function DeckPicker({
  isHost,
  send,
}: {
  isHost: boolean;
  send: (msg: ClientMessage) => void;
}) {
  return (
    <section className="space-y-4">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--play-text-muted)]">
          Psych
        </p>
        <h2 className="mt-1 text-2xl font-bold text-white">Pick a deck</h2>
        <p className="mt-1 text-sm text-[var(--play-text-muted)]">
          {isHost
            ? "You're the host — start a deck when everyone's ready."
            : "Waiting for the host to pick a deck…"}
        </p>
      </div>

      <div className="grid gap-3">
        {DECKS.map((deck, i) => (
          <button
            key={deck.id}
            type="button"
            disabled={!isHost || !deck.live}
            onClick={() => {
              if (
                deck.live &&
                (deck.id === "truth-comes-out" ||
                  deck.id === "truth-comes-out-nsfw")
              ) {
                send({ type: "start_deck", deckId: deck.id });
              }
            }}
            className="play-card text-left disabled:cursor-not-allowed disabled:opacity-45"
            style={{
              background: deck.color,
              color: "#121212",
              transform: `rotate(${i === 0 ? -1 : i === 1 ? 1.5 : -0.5}deg)`,
            }}
          >
            <p className="text-lg font-bold">{deck.title}</p>
            <p className="mt-1 text-sm opacity-80">{deck.blurb}</p>
            <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider opacity-70">
              {deck.live
                ? deck.id === "truth-comes-out-nsfw"
                  ? "18+ · 7 rounds · tap to start"
                  : "7 rounds · tap to start"
                : "soon"}
            </p>
          </button>
        ))}
      </div>

      {isHost ? (
        <button
          type="button"
          onClick={() => send({ type: "back_to_lobby" })}
          className="text-sm text-[var(--play-text-muted)] underline-offset-2 hover:text-white hover:underline"
        >
          ← Back to room
        </button>
      ) : null}
    </section>
  );
}

function AnswerPhase({
  psych,
  isSpectator,
  send,
}: {
  psych: NonNullable<RoomState["psych"]>;
  isSpectator?: boolean;
  send: (msg: ClientMessage) => void;
}) {
  const [text, setText] = useState("");

  return (
    <section className="space-y-5">
      <RoundHeader psych={psych} label="Answer" />
      <QuestionCard text={psych.question ?? ""} />

      {isSpectator ? (
        <p className="text-sm text-[var(--play-text-muted)]">
          You're spectating — answers unlock when the round ends.
        </p>
      ) : psych.youSubmitted ? (
        <div className="rounded-[var(--play-radius-lg)] bg-[var(--play-surface)] p-4">
          <p className="text-sm font-semibold text-[var(--play-yellow)]">
            Answer locked in
          </p>
          <p className="mt-2 text-sm text-[var(--play-text-muted)]">
            Waiting for {psych.waitingFor} more…
            ({psych.submittedCount}/{psych.activePlayerCount})
          </p>
        </div>
      ) : (
        <form
          className="space-y-3"
          onSubmit={(e) => {
            e.preventDefault();
            send({ type: "submit_answer", text });
          }}
        >
          <textarea
            value={text}
            onChange={(e) => setText(e.target.value.slice(0, MAX_ANSWER_LEN))}
            rows={3}
            maxLength={MAX_ANSWER_LEN}
            placeholder="Type something sharp, silly, or true…"
            className="w-full resize-none rounded-[var(--play-radius-md)] border border-white/10 bg-[var(--play-surface)] px-4 py-3 text-base text-white outline-none placeholder:text-white/30 focus:border-[var(--play-coral)]"
          />
          <div className="flex items-center justify-between gap-3">
            <span className="text-xs text-[var(--play-text-muted)]">
              {text.length}/{MAX_ANSWER_LEN}
            </span>
            <button
              type="submit"
              disabled={!text.trim()}
              className="play-card bg-[var(--play-coral)] px-5 py-2.5 text-sm font-semibold text-[#121212] disabled:opacity-40"
            >
              Submit
            </button>
          </div>
        </form>
      )}
    </section>
  );
}

function VotePhase({
  psych,
  isSpectator,
  send,
}: {
  psych: NonNullable<RoomState["psych"]>;
  isSpectator?: boolean;
  send: (msg: ClientMessage) => void;
}) {
  const options = useMemo(() => {
    const list = psych.voteOptions ?? [];
    return list.filter((o) => o.answerId !== psych.yourAnswerId);
  }, [psych.voteOptions, psych.yourAnswerId]);

  return (
    <section className="space-y-5">
      <RoundHeader psych={psych} label="Vote" />
      <QuestionCard text={psych.question ?? ""} />
      <p className="text-sm text-[var(--play-text-muted)]">
        Pick the funniest / most accurate. Answers are anonymous — you can't
        pick your own.
      </p>

      {isSpectator ? (
        <p className="text-sm text-[var(--play-text-muted)]">
          Spectating while the room votes…
        </p>
      ) : psych.youVoted ? (
        <p className="text-sm font-semibold text-[var(--play-yellow)]">
          Vote in. Waiting for {psych.waitingFor} more…
        </p>
      ) : options.length === 0 ? (
        <p className="text-sm text-[var(--play-text-muted)]">
          No other answers to vote on — hanging tight.
        </p>
      ) : (
        <ul className="space-y-2">
          {options.map((opt, i) => {
            const colors = [
              "var(--play-peach)",
              "var(--play-yellow)",
              "var(--play-pink)",
              "var(--play-cyan)",
              "var(--play-purple)",
              "var(--play-coral)",
            ];
            return (
              <li key={opt.answerId}>
                <button
                  type="button"
                  onClick={() =>
                    send({ type: "submit_vote", answerId: opt.answerId })
                  }
                  className="play-card w-full text-left text-sm font-semibold"
                  style={{
                    background: colors[i % colors.length],
                    color: "#121212",
                  }}
                >
                  {opt.text}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}

function pickedLine(names: string[]): string {
  if (names.length === 0) return "Nobody picked this";
  if (names.length === 1) return `${names[0]} picked this`;
  if (names.length === 2) return `${names[0]} and ${names[1]} picked this`;
  return `${names.slice(0, -1).join(", ")}, and ${names.at(-1)} picked this`;
}

function RoundResultPhase({
  room,
  psych,
  isHost,
  send,
}: {
  room: RoomState;
  psych: NonNullable<RoomState["psych"]>;
  isHost: boolean;
  send: (msg: ClientMessage) => void;
}) {
  return (
    <section className="space-y-5">
      <RoundHeader psych={psych} label="Results" />
      <QuestionCard text={psych.question ?? ""} />

      <ul className="space-y-2">
        {(psych.roundResults ?? []).map((r) => (
          <li
            key={r.answerId}
            className="rounded-[var(--play-radius-md)] bg-[var(--play-surface)] px-4 py-3"
          >
            <p className="text-sm text-white">“{r.text}”</p>
            <p className="mt-1 text-xs text-[var(--play-text-muted)]">
              {r.authorName}
              {r.isYou ? " (you)" : ""} · {r.votes} vote
              {r.votes === 1 ? "" : "s"} · +{r.votes * 100}
              pts
            </p>
            <p className="mt-1 text-xs font-semibold text-white">
              {pickedLine(r.voters ?? [])}
            </p>
          </li>
        ))}
      </ul>

      <ScoreStrip players={room.players} />

      {isHost ? (
        <button
          type="button"
          onClick={() => send({ type: "advance" })}
          className="play-card w-full bg-[var(--play-yellow)] py-3 text-center text-sm font-semibold text-[#121212]"
        >
          {psych.round >= psych.totalRounds ? "Final scores" : "Next round →"}
        </button>
      ) : (
        <p className="text-center text-sm text-[var(--play-text-muted)]">
          Waiting for host to continue…
        </p>
      )}
    </section>
  );
}

function FinalPhase({
  room,
  isHost,
  send,
}: {
  room: RoomState;
  isHost: boolean;
  send: (msg: ClientMessage) => void;
}) {
  const ranked = [...room.players].sort((a, b) => b.score - a.score);
  return (
    <section className="space-y-5">
      <h2 className="text-2xl font-bold text-white">Final scores</h2>
      <p className="text-sm text-[var(--play-text-muted)]">
        Truth Comes Out · {room.psych?.totalRounds ?? 7} rounds
      </p>
      <ol className="space-y-2">
        {ranked.map((p, i) => (
          <li
            key={p.id}
            className="play-card flex items-center justify-between"
            style={{
              background:
                i === 0
                  ? "var(--play-yellow)"
                  : i === 1
                    ? "var(--play-peach)"
                    : i === 2
                      ? "var(--play-coral)"
                      : "var(--play-surface)",
              color: i < 3 ? "#121212" : "#fff",
            }}
          >
            <span className="font-semibold">
              #{i + 1} {p.name}
            </span>
            <span className="font-mono text-sm">{p.score}</span>
          </li>
        ))}
      </ol>
      {isHost ? (
        <button
          type="button"
          onClick={() => send({ type: "advance" })}
          className="play-card w-full bg-[var(--play-cyan)] py-3 text-sm font-semibold text-[#121212]"
        >
          Back to room lobby
        </button>
      ) : (
        <p className="text-center text-sm text-[var(--play-text-muted)]">
          Waiting for host…
        </p>
      )}
    </section>
  );
}

function RoundHeader({
  psych,
  label,
}: {
  psych: NonNullable<RoomState["psych"]>;
  label: string;
}) {
  return (
    <div className="flex items-end justify-between gap-3">
      <div>
        <p className="text-xs font-medium uppercase tracking-[0.2em] text-[var(--play-text-muted)]">
          {psych.deckTitle}
        </p>
        <h2 className="text-xl font-bold text-white">
          Round {psych.round}/{psych.totalRounds}
        </h2>
      </div>
      <span className="rounded-full bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-wider text-white/80">
        {label}
      </span>
    </div>
  );
}

function QuestionCard({ text }: { text: string }) {
  return (
    <blockquote className="play-card bg-[var(--play-purple)] text-lg font-semibold leading-snug text-[#121212]">
      {text}
    </blockquote>
  );
}

function ScoreStrip({ players }: { players: RoomState["players"] }) {
  const top = [...players].sort((a, b) => b.score - a.score).slice(0, 4);
  return (
    <div className="flex flex-wrap gap-2">
      {top.map((p) => (
        <span
          key={p.id}
          className="rounded-full bg-white/10 px-3 py-1 text-xs text-white/85"
        >
          {p.name} · {p.score}
        </span>
      ))}
    </div>
  );
}
