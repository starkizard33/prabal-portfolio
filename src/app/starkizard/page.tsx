import Link from "next/link";
import { MegaRayquaza } from "@/components/starkizard/MegaRayquaza";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import { profile } from "@/data/profile";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Starkizard",
  description:
    "The hangar — Pokémon, Linkin Park, table tennis, Max Verstappen, blackjack, and custom board games.",
};

export default function StarkizardPage() {
  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad flex-1 pb-20">
        <section className="mx-auto max-w-6xl pt-14 md:pt-20">
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.32em] text-sz-jade/80">
            Offline mode · {profile.handle}
          </p>
          <h1 className="display animate-rise-delay-1 mt-4 text-[clamp(3rem,9vw,5.8rem)] leading-[0.92] font-extrabold tracking-tight">
            STARKIZARD
          </h1>
          <p className="animate-rise-delay-2 mt-5 max-w-2xl text-lg text-sz-mist/75">
            Tony Stark energy × Charizard fire. This is where Prabal keeps the
            non-work hangar: music, motorsport, rackets, dragons, and games.
          </p>
          <div className="animate-rise-delay-3 mt-8 flex flex-wrap gap-3">
            <Link
              href="/starkizard/blackjack"
              className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
            >
              Play blackjack
            </Link>
            <Link
              href="/starkizard/games"
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-sz-ember/60"
            >
              Custom board games
            </Link>
          </div>
        </section>

        <section className="mx-auto mt-14 max-w-6xl">
          <MegaRayquaza />
        </section>

        <section className="mx-auto mt-16 max-w-6xl">
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sz-mist/45">
            Interests
          </p>
          <h2 className="display mt-3 text-3xl font-bold md:text-4xl">
            What fuels the hangar
          </h2>
          <ul className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {profile.interests.map((interest, index) => (
              <li
                key={interest.id}
                className="rounded-2xl border border-white/10 bg-sz-panel/60 p-5 transition hover:border-sz-jade/35"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <h3 className="display text-xl font-bold text-sz-gold">
                  {interest.name}
                </h3>
                <p className="mt-2 text-sm leading-relaxed text-sz-mist/70">
                  {interest.blurb}
                </p>
                {interest.id === "blackjack" ? (
                  <Link
                    href="/starkizard/blackjack"
                    className="mt-4 inline-block text-sm font-medium text-sz-jade hover:text-sz-gold"
                  >
                    Open table →
                  </Link>
                ) : null}
                {interest.id === "boardgames" ? (
                  <Link
                    href="/starkizard/games"
                    className="mt-4 inline-block text-sm font-medium text-sz-jade hover:text-sz-gold"
                  >
                    See prototypes →
                  </Link>
                ) : null}
              </li>
            ))}
          </ul>
        </section>
      </main>
    </div>
  );
}
