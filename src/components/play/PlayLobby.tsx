"use client";

import {
  generateRoomCode,
  normalizeRoomCode,
} from "@/lib/play/roomCode";
import { useRouter } from "next/navigation";
import { useEffect, useState, type FormEvent } from "react";

const PASTELS = [
  { bg: "var(--play-coral)", rot: "-3deg", label: "Pass" },
  { bg: "var(--play-yellow)", rot: "2.5deg", label: "Guess" },
  { bg: "var(--play-pink)", rot: "-1.5deg", label: "Reveal" },
  { bg: "var(--play-peach)", rot: "3deg", label: "Laugh" },
] as const;

export function PlayLobby() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [joinCode, setJoinCode] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = sessionStorage.getItem("play:displayName")?.trim();
      if (saved) setName(saved);
    } catch {
      /* ignore */
    }
  }, []);

  function goToRoom(code: string, displayName: string) {
    router.push(
      `/play/room/${code}?name=${encodeURIComponent(displayName)}`,
    );
  }

  function persistName(value: string) {
    const trimmed = value.trim();
    if (trimmed) {
      try {
        sessionStorage.setItem("play:displayName", trimmed);
      } catch {
        /* ignore */
      }
    }
  }

  function requireName(): string | null {
    const display = name.trim();
    if (display.length < 2) {
      setError("Enter your name first (at least 2 characters).");
      return null;
    }
    return display;
  }

  function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const display = requireName();
    if (!display) return;
    persistName(display);
    goToRoom(generateRoomCode(4), display);
  }

  function handleJoin(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const display = requireName();
    if (!display) return;
    const code = normalizeRoomCode(joinCode);
    if (code.length < 4) {
      setError("Enter a 4-character room code.");
      return;
    }
    persistName(display);
    goToRoom(code, display);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-14">
      <p className="text-[11px] font-medium uppercase tracking-[0.22em] text-[var(--play-text-muted)] sm:text-xs">
        play.starkizard
      </p>
      <h1 className="mt-2 text-[1.85rem] font-bold leading-[1.08] tracking-tight text-white sm:mt-3 sm:text-5xl">
        Party games.
        <br />
        One room code.
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--play-text-muted)] sm:mt-4">
        Create a lobby, share the code, friends join from any browser. No
        accounts — just a name and a code.
      </p>

      <div
        className="relative mx-auto mt-5 h-20 w-full max-w-[240px] sm:mt-10 sm:h-40 sm:max-w-none"
        aria-hidden
      >
        {PASTELS.map((card, i) => (
          <div
            key={card.label}
            className="play-card absolute left-1/2 top-0 w-[36%] max-w-[110px] -translate-x-1/2 !px-3 !py-2.5 shadow-none sm:top-2 sm:w-[42%] sm:max-w-[150px] sm:!px-[18px] sm:!py-4"
            style={{
              background: card.bg,
              transform: `translateX(calc(-50% + ${(i - 1.5) * 20}px)) rotate(${card.rot})`,
              zIndex: i + 1,
              color: "#121212",
            }}
          >
            <p className="text-xs font-semibold sm:text-sm">{card.label}</p>
            <p className="mt-2 text-[9px] font-medium uppercase tracking-wider opacity-70 sm:mt-6 sm:text-[10px]">
              card
            </p>
          </div>
        ))}
      </div>

      {/* Section 1 — identity */}
      <section
        className="mt-5 rounded-[var(--play-radius-xl)] bg-[var(--play-surface)] p-3.5 sm:mt-10 sm:p-5"
        aria-labelledby="play-name-heading"
      >
        <h2
          id="play-name-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--play-text-muted)] sm:text-xs"
        >
          Your name
        </h2>
        <label className="mt-2.5 block sm:mt-4">
          <span className="sr-only">Enter your name</span>
          <input
            name="displayName"
            value={name}
            onChange={(e) => {
              setName(e.target.value);
              setError(null);
            }}
            maxLength={16}
            placeholder="e.g. Prabal"
            minLength={2}
            className="w-full rounded-[var(--play-radius-md)] border border-white/10 bg-[var(--play-surface-alt)] px-4 py-3 text-base text-white outline-none placeholder:text-white/25 focus:border-[var(--play-yellow)] sm:py-3.5"
            autoComplete="nickname"
            enterKeyHint="done"
          />
        </label>
      </section>

      {/* Section 2 — create or join */}
      <section
        className="mt-3 rounded-[var(--play-radius-xl)] bg-[var(--play-surface)] p-3.5 sm:mt-5 sm:p-5"
        aria-labelledby="play-room-heading"
      >
        <h2
          id="play-room-heading"
          className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[var(--play-text-muted)] sm:text-xs"
        >
          Room
        </h2>

        <form onSubmit={handleCreate} className="mt-2.5 sm:mt-4">
          <button
            type="submit"
            className="play-card min-h-11 w-full bg-[var(--play-yellow)] py-3 text-center text-base font-semibold text-[#121212] sm:min-h-12 sm:py-3.5"
          >
            Create room
          </button>
        </form>

        <div className="my-3 flex items-center gap-3 text-xs text-[var(--play-text-muted)] sm:my-4">
          <div className="h-px flex-1 bg-white/10" />
          or join
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <form onSubmit={handleJoin} className="space-y-2.5 sm:space-y-3">
          <label className="block">
            <span className="mb-1.5 block text-xs text-[var(--play-text-muted)]">
              Room code
            </span>
            <input
              name="roomCode"
              value={joinCode}
              onChange={(e) => {
                setJoinCode(normalizeRoomCode(e.target.value));
                setError(null);
              }}
              maxLength={6}
              placeholder="ABCD"
              inputMode="text"
              className="w-full rounded-[var(--play-radius-md)] border border-white/10 bg-[var(--play-surface-alt)] px-4 py-3 font-mono text-lg uppercase tracking-[0.35em] text-white outline-none placeholder:tracking-[0.35em] placeholder:text-white/25 focus:border-[var(--play-coral)] sm:py-3.5"
              autoCapitalize="characters"
              autoCorrect="off"
              spellCheck={false}
              enterKeyHint="go"
            />
          </label>
          <button
            type="submit"
            className="play-card min-h-11 w-full bg-[var(--play-coral)] py-3 text-center text-base font-semibold text-[#121212] sm:min-h-12 sm:py-3.5"
          >
            Join room
          </button>
        </form>
      </section>

      {error ? (
        <p className="mt-3 text-sm text-[var(--play-coral)]" role="alert">
          {error}
        </p>
      ) : null}
    </main>
  );
}
