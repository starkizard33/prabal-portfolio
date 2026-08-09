"use client";

import { useState } from "react";

const SHOWDOWN_CDN = "https://play.pokemonshowdown.com/sprites/ani";

type Sprite = {
  id: string;
  name: string;
  localSrc: string;
  cdnSrc: string;
  fallbackSrc: string;
  className: string;
};

const sprites: Sprite[] = [
  {
    id: "charizard",
    name: "Charizard",
    localSrc: "/sprites/charizard.gif",
    cdnSrc: `${SHOWDOWN_CDN}/charizard.gif`,
    fallbackSrc: "/sprites/charizard-fallback.svg",
    className: "sprite-float h-[min(42vw,220px)] w-auto drop-shadow-[0_0_28px_rgba(255,107,44,0.55)]",
  },
  {
    id: "rayquaza",
    name: "Rayquaza",
    localSrc: "/sprites/rayquaza.gif",
    cdnSrc: `${SHOWDOWN_CDN}/rayquaza.gif`,
    fallbackSrc: "/sprites/rayquaza-fallback.svg",
    className:
      "sprite-float-delay h-[min(48vw,260px)] w-auto drop-shadow-[0_0_36px_rgba(61,255,154,0.6)]",
  },
];

function SpriteFigure({ sprite }: { sprite: Sprite }) {
  const [sourceIndex, setSourceIndex] = useState(0);
  const sources = [sprite.localSrc, sprite.cdnSrc, sprite.fallbackSrc];
  const src = sources[Math.min(sourceIndex, sources.length - 1)];

  return (
    <figure className="relative flex flex-col items-center">
      <div
        className="pointer-events-none absolute inset-x-8 bottom-6 top-8 rounded-full bg-[radial-gradient(circle,rgba(61,255,154,0.22),transparent_68%)] blur-xl"
        aria-hidden
      />
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={sprite.name}
        width={sprite.id === "rayquaza" ? 192 : 160}
        height={sprite.id === "rayquaza" ? 192 : 160}
        className={`relative image-pixelated ${sprite.className}`}
        onError={() =>
          setSourceIndex((current) =>
            current < sources.length - 1 ? current + 1 : current,
          )
        }
      />
      <figcaption className="mt-3 font-mono text-[10px] uppercase tracking-[0.32em] text-sz-mist/45">
        {sprite.name}
      </figcaption>
    </figure>
  );
}

export function SpriteStage() {
  return (
    <section
      className="sprite-stage relative mx-auto w-full max-w-5xl overflow-hidden rounded-[2rem] border border-sz-jade/25 px-4 py-12 md:px-10 md:py-16"
      aria-label="Hangar sprites"
    >
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_at_50%_60%,rgba(61,255,154,0.16),transparent_58%),radial-gradient(ellipse_at_20%_30%,rgba(255,107,44,0.12),transparent_45%)]"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-sz-jade/70 to-transparent"
        aria-hidden
      />

      <div className="relative flex flex-wrap items-end justify-center gap-10 md:gap-20">
        {sprites.map((sprite) => (
          <SpriteFigure key={sprite.id} sprite={sprite} />
        ))}
      </div>

      <p className="relative mt-10 text-center font-mono text-[10px] uppercase tracking-[0.28em] text-sz-mist/35">
        Sprites: Pokémon Showdown community animations · fan / non-commercial
        personal site · Pokémon © Nintendo / Creatures / GAME FREAK
      </p>
    </section>
  );
}
