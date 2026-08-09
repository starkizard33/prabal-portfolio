import Link from "next/link";
import { BlackjackTable } from "@/components/starkizard/BlackjackTable";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blackjack",
  description: "Play a casual blackjack table in the Starkizard hangar.",
};

export default function BlackjackPage() {
  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad mx-auto w-full max-w-4xl flex-1 py-12 md:py-16">
        <Link
          href="/starkizard"
          className="text-sm text-sz-mist/60 transition hover:text-sz-jade"
        >
          ← Back to hangar
        </Link>
        <p className="mt-6 max-w-2xl text-sz-mist/70">
          Four-deck shoe, dealer stands on 17, blackjack pays 3:2. For fun —
          not advice, not a casino.
        </p>
        <div className="mt-8">
          <BlackjackTable />
        </div>
      </main>
    </div>
  );
}
