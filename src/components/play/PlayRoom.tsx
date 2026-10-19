"use client";

import { PsychGame } from "@/components/play/PsychGame";
import { usePlayRoom } from "@/hooks/usePlayRoom";
import { MIN_PLAYERS_TO_START } from "@shared/playProtocol";
import Link from "next/link";
import { useState } from "react";

const SEAT_COLORS = [
  "var(--play-coral)",
  "var(--play-peach)",
  "var(--play-pink)",
  "var(--play-yellow)",
  "var(--play-orange)",
  "var(--play-cyan)",
  "var(--play-purple)",
  "#e8e8e8",
];

type PlayRoomProps = {
  code: string;
  initialName: string;
};

export function PlayRoom({ code, initialName }: PlayRoomProps) {
  const [name] = useState(() => {
    if (initialName.trim()) return initialName.trim().slice(0, 16);
    try {
      return sessionStorage.getItem("play:displayName")?.trim() || "Player";
    } catch {
      return "Player";
    }
  });

  const {
    roomCode,
    status,
    error,
    connectionId,
    room,
    send,
    isHost,
    isSpectator,
  } = usePlayRoom(code, name);

  const players = room?.players ?? [];
  const inPsych =
    room &&
    room.phase !== "lobby" &&
    (room.phase === "psych_decks" ||
      room.phase.startsWith("psych_"));

  return (
    <main className="mx-auto flex min-h-dvh max-w-lg flex-col px-5 pb-16 pt-8">
      <div className="flex items-center justify-between gap-3">
        <Link
          href="/play"
          className="text-sm text-[var(--play-text-muted)] transition hover:text-white"
        >
          ← Home
        </Link>
        <p className="font-mono text-xs uppercase tracking-[0.2em] text-[var(--play-text-muted)]">
          {status === "live" ? "live" : status}
        </p>
      </div>

      <h1 className="mt-6 text-3xl font-bold tracking-tight text-white">
        Room{" "}
        <span className="font-mono tracking-[0.2em] text-[var(--play-yellow)]">
          {roomCode || "····"}
        </span>
      </h1>
      <p className="mt-2 text-sm text-[var(--play-text-muted)]">
        Playing as <span className="text-white">{name}</span>
        {isHost ? " · host" : null}
        {isSpectator ? " · spectating" : null}
      </p>

      {inPsych && room ? (
        <div className="mt-8">
          <PsychGame
            room={room}
            isHost={isHost}
            isSpectator={isSpectator}
            send={send}
          />
        </div>
      ) : (
        <>
          <section className="mt-8 rounded-[var(--play-radius-lg)] bg-[var(--play-surface)] p-5">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white">Players</h2>
              <span className="text-xs text-[var(--play-text-muted)]">
                {players.length}/8
              </span>
            </div>

            {players.length === 0 ? (
              <p className="mt-4 text-sm text-[var(--play-text-muted)]">
                Waiting for the party server…
              </p>
            ) : (
              <ul className="mt-4 space-y-2">
                {players.map((player, index) => {
                  const seat = SEAT_COLORS[index % SEAT_COLORS.length];
                  const you = player.id === connectionId;
                  const host = player.id === room?.hostId;
                  return (
                    <li
                      key={player.id}
                      className="play-card flex items-center justify-between gap-3"
                      style={{ background: seat, color: "#121212" }}
                    >
                      <span className="font-semibold">
                        {player.name}
                        {you ? " (you)" : ""}
                      </span>
                      <span className="flex items-center gap-2">
                        {player.score > 0 ? (
                          <span className="font-mono text-xs opacity-70">
                            {player.score}
                          </span>
                        ) : null}
                        {host ? (
                          <span className="rounded-full bg-black/15 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider">
                            host
                          </span>
                        ) : null}
                      </span>
                    </li>
                  );
                })}
              </ul>
            )}
          </section>

          <section className="mt-6 space-y-3">
            <h2 className="text-sm font-semibold text-white">Games</h2>
            <button
              type="button"
              disabled={!isHost || players.length < MIN_PLAYERS_TO_START}
              onClick={() => send({ type: "open_psych" })}
              className="play-card w-full bg-[var(--play-coral)] text-left disabled:cursor-not-allowed disabled:opacity-40"
              style={{ color: "#121212", transform: "rotate(-1deg)" }}
            >
              <p className="text-lg font-bold">Psych</p>
              <p className="mt-1 text-sm opacity-80">
                Anonymous answers. Vote for the best take.
              </p>
              <p className="mt-3 text-[10px] font-semibold uppercase tracking-wider opacity-70">
                {isHost
                  ? players.length < MIN_PLAYERS_TO_START
                    ? `Need ${MIN_PLAYERS_TO_START}+ players`
                    : "Tap to open decks"
                  : "Waiting for host"}
              </p>
            </button>

            <div
              className="play-card opacity-50"
              style={{
                background: "var(--play-surface-alt)",
                color: "#fff",
                transform: "rotate(1.2deg)",
              }}
            >
              <p className="text-lg font-bold">More games</p>
              <p className="mt-1 text-sm text-[var(--play-text-muted)]">
                Coming soon — Codenames-style and party cards.
              </p>
            </div>
          </section>
        </>
      )}

      {error ? (
        <p className="mt-6 text-sm text-[var(--play-coral)]">{error}</p>
      ) : null}

      <p className="mt-auto pt-10 text-center text-[11px] text-[var(--play-text-muted)]">
        Share code <span className="font-mono text-white">{roomCode}</span> with
        friends.
      </p>
    </main>
  );
}
