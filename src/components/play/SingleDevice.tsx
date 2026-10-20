"use client";

import Link from "next/link";
import { useEffect, useState, type FormEvent } from "react";

const STORAGE_KEY = "play:singleNames";
const MAX_NAMES = 8;

function readNames(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    const parsed = raw ? (JSON.parse(raw) as unknown) : [];
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((name): name is string => typeof name === "string");
  } catch {
    return [];
  }
}

export function SingleDevice() {
  const [names, setNames] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setNames(readNames());
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(names));
    } catch {
      /* ignore */
    }
  }, [names, ready]);

  function addName(event: FormEvent) {
    event.preventDefault();
    const name = draft.replace(/\s+/g, " ").trim();
    if (name.length < 2 || name.length > 16) {
      setError("Names are 2–16 characters.");
      return;
    }
    if (names.some((existing) => existing.toLowerCase() === name.toLowerCase())) {
      setError("That name is already in.");
      return;
    }
    if (names.length >= MAX_NAMES) {
      setError(`That's the table limit (${MAX_NAMES}).`);
      return;
    }
    setNames((current) => [...current, name]);
    setDraft("");
    setError(null);
  }

  return (
    <main className="mx-auto flex min-h-dvh w-full max-w-lg flex-col px-4 pb-[max(1.5rem,env(safe-area-inset-bottom))] pt-[max(1.75rem,env(safe-area-inset-top))] sm:px-5 sm:pt-14">
      <Link
        href="/play"
        className="text-sm text-[var(--play-text-muted)] underline-offset-2 hover:text-white hover:underline"
      >
        ← How are you playing?
      </Link>
      <h1 className="mt-4 text-[1.85rem] font-bold leading-[1.08] tracking-tight text-white sm:text-5xl">
        Who&apos;s here?
      </h1>
      <p className="mt-2 max-w-sm text-sm leading-relaxed text-[var(--play-text-muted)]">
        Add at least 2 names. You&apos;ll pass this phone to each person.
      </p>

      <form onSubmit={addName} className="mt-6 flex gap-2">
        <label className="min-w-0 flex-1">
          <span className="sr-only">Player name</span>
          <input
            value={draft}
            onChange={(event) => {
              setDraft(event.target.value);
              setError(null);
            }}
            maxLength={16}
            placeholder="Name"
            className="w-full rounded-[var(--play-radius-md)] border border-white/10 bg-[var(--play-surface-alt)] px-4 py-3 text-base text-white outline-none placeholder:text-white/25 focus:border-[var(--play-peach)]"
            autoComplete="off"
            enterKeyHint="done"
          />
        </label>
        <button
          type="submit"
          className="play-card shrink-0 bg-[var(--play-peach)] px-4 py-3 text-sm font-semibold text-[#121212]"
        >
          Add
        </button>
      </form>

      {error ? (
        <p className="mt-3 text-sm text-[var(--play-coral)]" role="alert">
          {error}
        </p>
      ) : null}

      <ul className="mt-5 space-y-2">
        {names.map((name) => (
          <li
            key={name}
            className="flex items-center justify-between rounded-[var(--play-radius-lg)] bg-[var(--play-surface)] px-4 py-3"
          >
            <span className="font-semibold text-white">{name}</span>
            <button
              type="button"
              onClick={() =>
                setNames((current) => current.filter((item) => item !== name))
              }
              className="text-sm text-[var(--play-text-muted)] underline-offset-2 hover:text-white hover:underline"
            >
              Remove
            </button>
          </li>
        ))}
      </ul>

      <p className="mt-6 text-sm text-[var(--play-text-muted)]">
        {names.length < 2
          ? `${names.length}/2 names. Add ${2 - names.length} more.`
          : `${names.length} playing. Pass-the-phone games will use this list.`}
      </p>
    </main>
  );
}
