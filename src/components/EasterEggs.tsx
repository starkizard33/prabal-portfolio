"use client";

import {
  ALL_DAD_JOKES,
  BLACKJACK_JOKES,
  F1_JOKES,
  LINKIN_PARK_JOKES,
  POKEMON_JOKES,
  TABLE_TENNIS_JOKES,
  formatDadJoke,
  pickJoke,
  type DadJoke,
} from "@/data/dadJokes";
import { useEffect, useRef, useState } from "react";

const KONAMI = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

type Toast = { id: number; title: string; body: string };

/** Typed shortcuts → themed joke pools (real jokes from joke sites). */
const TYPE_POOLS: Record<string, DadJoke[]> = {
  charizard: POKEMON_JOKES,
  pokemon: POKEMON_JOKES,
  rayquaza: POKEMON_JOKES,
  pikachu: POKEMON_JOKES,
  butterfree: POKEMON_JOKES,
  numb: LINKIN_PARK_JOKES,
  meteora: LINKIN_PARK_JOKES,
  hybrid: LINKIN_PARK_JOKES,
  linkin: LINKIN_PARK_JOKES,
  max: F1_JOKES,
  verstappen: F1_JOKES,
  orange: F1_JOKES,
  f1: F1_JOKES,
  pingpong: TABLE_TENNIS_JOKES,
  tabletennis: TABLE_TENNIS_JOKES,
  paddle: TABLE_TENNIS_JOKES,
  blackjack: BLACKJACK_JOKES,
  casino: BLACKJACK_JOKES,
  zard: BLACKJACK_JOKES,
  starkizard: ALL_DAD_JOKES,
};

const QUERY_POOLS: Record<string, DadJoke[]> = {
  charizard: POKEMON_JOKES,
  pokemon: POKEMON_JOKES,
  numb: LINKIN_PARK_JOKES,
  orange: F1_JOKES,
  max: F1_JOKES,
  tt: TABLE_TENNIS_JOKES,
  blackjack: BLACKJACK_JOKES,
  joke: ALL_DAD_JOKES,
};

/**
 * Interest-themed easter eggs that surface real online dad jokes.
 */
export function EasterEggs() {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const konamiRef = useRef(0);
  const typeBuffer = useRef("");
  const titleClicks = useRef(0);
  const toastId = useRef(0);
  const spin = useRef(0);

  function nextJoke(pool: DadJoke[]) {
    spin.current += 1;
    return formatDadJoke(pickJoke(pool, Date.now() + spin.current));
  }

  function pushToast(title: string, body: string) {
    const id = (toastId.current += 1);
    setToasts((prev) => [...prev.slice(-2), { id, title, body }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 7000);
  }

  function pushJoke(pool: DadJoke[]) {
    const joke = nextJoke(pool);
    pushToast(joke.title, joke.body);
  }

  useEffect(() => {
    // eslint-disable-next-line no-console
    console.log(
      "%cstarkizard",
      "color:#3dff9a;font-size:18px;font-weight:700;letter-spacing:0.12em",
    );
    // eslint-disable-next-line no-console
    console.log(
      "%cDad-joke eggs loaded from the internet. Type: charizard · numb · max · pingpong · blackjack",
      "color:#9aa3b2;font-size:12px",
    );
    // eslint-disable-next-line no-console
    console.log(
      "%cAlso: Konami · brand 5× · ?egg=charizard · ?egg=numb · ?egg=orange · ?egg=blackjack",
      "color:#6b7280;font-size:11px",
    );

    const params = new URLSearchParams(window.location.search);
    const egg = params.get("egg")?.toLowerCase();
    if (egg && QUERY_POOLS[egg]) {
      pushJoke(QUERY_POOLS[egg]);
    }

    function onKeyDown(event: KeyboardEvent) {
      const target = event.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const expected = KONAMI[konamiRef.current];
      if (key === expected || key === expected.toLowerCase()) {
        konamiRef.current += 1;
        if (konamiRef.current >= KONAMI.length) {
          konamiRef.current = 0;
          pushJoke(ALL_DAD_JOKES);
        }
      } else {
        konamiRef.current = key === KONAMI[0] ? 1 : 0;
      }

      if (event.key.length === 1 && /[a-z0-9]/i.test(event.key)) {
        typeBuffer.current = (typeBuffer.current + event.key.toLowerCase()).slice(-24);
        const codes = Object.keys(TYPE_POOLS).sort((a, b) => b.length - a.length);
        for (const code of codes) {
          if (typeBuffer.current.endsWith(code)) {
            pushJoke(TYPE_POOLS[code]);
            typeBuffer.current = "";
            break;
          }
        }
      }
    }

    function onBrandClick(event: MouseEvent) {
      const el = (event.target as HTMLElement | null)?.closest?.("[data-egg='brand']");
      if (!el) return;
      titleClicks.current += 1;
      if (titleClicks.current >= 5) {
        titleClicks.current = 0;
        pushJoke(ALL_DAD_JOKES);
      }
    }

    window.addEventListener("keydown", onKeyDown);
    document.addEventListener("click", onBrandClick);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("click", onBrandClick);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- mount-only listeners
  }, []);

  if (toasts.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed bottom-4 right-4 z-[80] flex max-w-sm flex-col gap-2"
      aria-live="polite"
    >
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className="pointer-events-auto border border-sz-jade/30 bg-[#0c1018]/95 px-4 py-3 text-sz-mist shadow-[0_0_28px_rgba(61,255,154,0.12)] backdrop-blur"
        >
          <p className="font-mono text-[10px] uppercase tracking-[0.24em] text-sz-jade/80">
            Dad joke
          </p>
          <p className="mt-1 text-sm font-medium text-sz-mist">{toast.title}</p>
          <p className="mt-1 text-sm text-sz-mist/75">{toast.body}</p>
        </div>
      ))}
    </div>
  );
}
