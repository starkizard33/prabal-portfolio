import Link from "next/link";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Roulette · Casino",
  description: "European roulette — wheel UI landing next.",
};

export default function CasinoRouletteStubPage() {
  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad flex-1 pb-20">
        <section className="mx-auto max-w-3xl pt-16 md:pt-24">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-sz-jade/80">
            Table opening soon
          </p>
          <h1 className="display mt-4 text-4xl font-extrabold md:text-5xl">
            Roulette
          </h1>
          <p className="mt-4 text-lg text-sz-mist/70">
            European single-zero wheel and betting grid come next. Session wallet
            stays shared from the lobby.
          </p>
          <Link
            href="/starkizard/casino"
            className="mt-8 inline-block rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold transition hover:border-sz-jade/50 hover:text-sz-jade"
          >
            ← Back to lobby
          </Link>
        </section>
      </main>
    </div>
  );
}
