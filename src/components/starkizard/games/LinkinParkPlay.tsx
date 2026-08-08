"use client";

import { GuessLinkinPark } from "@/components/starkizard/games/GuessLinkinPark";
import dynamic from "next/dynamic";
import { useState } from "react";

const GuessLinkinParkAudio = dynamic(
  () =>
    import("@/components/starkizard/games/GuessLinkinParkAudio").then(
      (mod) => mod.GuessLinkinParkAudio,
    ),
  {
    ssr: false,
    loading: () => (
      <p className="border border-white/10 bg-sz-panel/50 p-6 text-sm text-sz-mist/60">
        Loading audio mode…
      </p>
    ),
  },
);

type Mode = "lyrics" | "audio";

export function LinkinParkPlay() {
  const [mode, setMode] = useState<Mode>("lyrics");

  return (
    <div className="space-y-6">
      <div
        className="inline-flex flex-wrap gap-2 rounded-full border border-white/10 bg-sz-void/60 p-1"
        role="tablist"
        aria-label="Linkin Park quiz mode"
      >
        <button
          type="button"
          role="tab"
          aria-selected={mode === "lyrics"}
          onClick={() => setMode("lyrics")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "lyrics"
              ? "bg-sz-jade text-sz-void"
              : "text-sz-mist/70 hover:text-sz-mist"
          }`}
        >
          Guess from lyrics
        </button>
        <button
          type="button"
          role="tab"
          aria-selected={mode === "audio"}
          onClick={() => setMode("audio")}
          className={`rounded-full px-4 py-2 text-sm font-medium transition ${
            mode === "audio"
              ? "bg-sz-jade text-sz-void"
              : "text-sz-mist/70 hover:text-sz-mist"
          }`}
        >
          Guess from audio
        </button>
      </div>

      {mode === "lyrics" ? <GuessLinkinPark /> : <GuessLinkinParkAudio />}
    </div>
  );
}
