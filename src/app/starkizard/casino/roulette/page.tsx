"use client";

import { LeaveSummary } from "@/components/casino/LeaveSummary";
import { RouletteTable } from "@/components/casino/roulette/RouletteTable";
import { SessionHud } from "@/components/casino/SessionHud";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import {
  useCasinoSession,
  type SessionSummary,
} from "@/casino/session/CasinoSessionContext";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

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

export default function CasinoRoulettePage() {
  const { state, leaveCasino } = useCasinoSession();
  const router = useRouter();
  const [summary, setSummary] = useState<SessionSummary | null>(null);

  useEffect(() => {
    if (!state.active) {
      router.replace("/starkizard/casino");
    }
  }, [state.active, router]);

  if (!state.active) {
    return (
      <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
        <StarkizardNav />
        <main className="section-pad flex flex-1 items-center justify-center pb-20">
          <p className="text-sz-mist/60">Redirecting to casino lobby…</p>
        </main>
      </div>
    );
  }

  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad mx-auto w-full max-w-6xl flex-1 pb-20 pt-8 md:pt-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/starkizard/casino"
            className="text-sm text-sz-mist/60 transition hover:text-sz-jade"
          >
            ← Lobby
          </Link>
        </div>
        <SessionHud onLeave={() => setSummary(previewSummary(state))} />
        <div className="mt-8">
          <RouletteTable />
        </div>
      </main>

      {summary ? (
        <LeaveSummary
          summary={summary}
          onConfirm={() => {
            leaveCasino();
            setSummary(null);
            router.push("/starkizard");
          }}
          onStay={() => setSummary(null)}
        />
      ) : null}
    </div>
  );
}
