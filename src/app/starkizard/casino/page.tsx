"use client";

import { BuyInGate } from "@/components/casino/BuyInGate";
import { LeaveSummary } from "@/components/casino/LeaveSummary";
import { SessionHud } from "@/components/casino/SessionHud";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import {
  useCasinoSession,
  type SessionSummary,
} from "@/casino/session/CasinoSessionContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

const doors = [
  {
    href: "/starkizard/casino/blackjack",
    title: "Blackjack",
    blurb: "Six-deck shoe, S17, late surrender. Helpers optional.",
  },
  {
    href: "/starkizard/casino/roulette",
    title: "Roulette",
    blurb: "European single-zero wheel. Outside bets front and center.",
  },
] as const;

function previewSummary(state: {
  bankroll: number;
  startBankroll: number;
  hands: number;
  spins: number;
  startedAt: number | null;
}): SessionSummary {
  const endedAt = Date.now();
  return {
    bankroll: state.bankroll,
    startBankroll: state.startBankroll,
    hands: state.hands,
    spins: state.spins,
    startedAt: state.startedAt,
    endedAt,
    net: state.bankroll - state.startBankroll,
  };
}

export default function CasinoLobbyPage() {
  const { state, leaveCasino, abandonActiveTable, adjustBankroll } =
    useCasinoSession();
  const router = useRouter();
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  function handleLeaveRequest() {
    const refund = abandonActiveTable();
    if (refund > 0) adjustBankroll(refund);
    setSummary(
      previewSummary({
        ...state,
        bankroll: state.bankroll + refund,
      }),
    );
  }

  function handleConfirmLeave() {
    leaveCasino();
    setSummary(null);
    router.push("/starkizard");
  }

  function handleStay() {
    setSummary(null);
  }

  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad flex-1 pb-20">
        {!state.active ? (
          <BuyInGate />
        ) : (
          <div className="mx-auto max-w-6xl pt-10 md:pt-14">
            <p className="animate-rise font-mono text-xs uppercase tracking-[0.32em] text-sz-jade/80">
              Neon Void · Lobby
            </p>
            <h1 className="display animate-rise-delay-1 mt-3 text-[clamp(2.4rem,6vw,3.8rem)] font-extrabold tracking-tight">
              Pick a table
            </h1>
            <div className="animate-rise-delay-2 mt-8">
              <SessionHud onLeave={handleLeaveRequest} />
            </div>
            <ul className="animate-rise-delay-3 mt-10 grid gap-5 md:grid-cols-2">
              {doors.map((door) => (
                <li key={door.href}>
                  <Link
                    href={door.href}
                    className="group block border border-white/10 bg-sz-panel/40 p-6 transition hover:border-sz-jade/45 hover:shadow-[0_0_32px_rgba(61,255,154,0.1)]"
                  >
                    <h2 className="display text-2xl font-bold text-sz-gold transition group-hover:text-sz-jade">
                      {door.title}
                    </h2>
                    <p className="mt-2 text-sm leading-relaxed text-sz-mist/70">
                      {door.blurb}
                    </p>
                    <span className="mt-4 inline-block text-sm font-medium text-sz-jade">
                      Enter →
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </main>

      {summary ? (
        <LeaveSummary
          summary={summary}
          onConfirm={handleConfirmLeave}
          onStay={handleStay}
        />
      ) : null}
    </div>
  );
}
