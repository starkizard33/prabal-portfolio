import Link from "next/link";
import { SpriteStage } from "@/components/starkizard/SpriteStage";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import { profile } from "@/data/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starkizard",
  description:
    "The hangar — Neon Void home for Pokémon sprites, Linkin Park, table tennis, Max Verstappen, and the casino.",
};

export default function StarkizardPage() {
  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad flex-1 pb-20">
        <section className="mx-auto max-w-6xl pt-14 md:pt-20">
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.32em] text-sz-jade/80">
            Neon Void · {profile.handle}
          </p>
          <h1 className="display animate-rise-delay-1 mt-4 text-[clamp(3rem,9vw,5.8rem)] leading-[0.92] font-extrabold tracking-tight">
            STARKIZARD
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-2xl text-lg text-sz-mist/75">
            Tony Stark energy × Charizard fire. Offline hangar for music,
            motorsport, rackets, dragons — and a session casino downstairs.
          </p>
          <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/starkizard/casino"
              className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
            >
              Enter Casino
            </Link>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-sz-ember/60"
            >
              Back to Prabal
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl" data-animate="fade-up">
          <SpriteStage />
        </section>

        <section id="interests" className="mx-auto mt-16 max-w-6xl">
          <div data-animate="fade-up">
            <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sz-mist/45">
              Interests
            </p>
            <h2 className="display mt-3 text-3xl font-bold md:text-4xl">
              What fuels the hangar
            </h2>
          </div>
          <ul
            data-animate-stagger
            className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3"
          >
            {profile.interests.map((interest) => {
              const isWip = "wip" in interest && interest.wip === true;
              return (
                <li
                  key={interest.id}
                  className="relative border border-white/10 bg-sz-panel/40 p-5 transition hover:border-sz-jade/40 hover:shadow-[0_0_28px_rgba(61,255,154,0.08)]"
                >
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="display text-xl font-bold text-sz-gold">
                      {interest.name}
                    </h3>
                    {isWip ? (
                      <span className="shrink-0 rounded-full border border-sz-ember/50 bg-sz-ember/15 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.18em] text-sz-ember">
                        WIP
                      </span>
                    ) : null}
                  </div>
                  <p className="mt-2 text-sm leading-relaxed text-sz-mist/70">
                    {interest.blurb}
                  </p>
                  <Link
                    href={interest.href}
                    className="mt-4 inline-block text-sm font-medium text-sz-jade hover:text-sz-gold"
                  >
                    {interest.cta}
                  </Link>
                </li>
              );
            })}
          </ul>
        </section>
      </main>

      <footer className="section-pad border-t border-white/8 py-6" data-animate="fade-up">
        <p className="mx-auto max-w-6xl text-center text-xs text-sz-mist/40">
          Animated sprites from{" "}
          <a
            href="https://play.pokemonshowdown.com/"
            className="text-sz-jade/70 underline-offset-2 hover:underline"
            target="_blank"
            rel="noreferrer"
          >
            Pokémon Showdown
          </a>
          . Fan / non-commercial personal site. Pokémon © Nintendo / Creatures /
          GAME FREAK.
        </p>
      </footer>
    </div>
  );
}
