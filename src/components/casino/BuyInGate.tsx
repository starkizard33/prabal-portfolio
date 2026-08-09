"use client";

import {
  CASINO_BUY_IN,
  useCasinoSession,
} from "@/casino/session/CasinoSessionContext";

export function BuyInGate() {
  const { enterCasino } = useCasinoSession();

  return (
    <section className="mx-auto flex max-w-xl flex-col items-start pt-16 md:pt-24">
      <p className="animate-rise font-mono text-xs uppercase tracking-[0.32em] text-sz-jade/80">
        Neon Void · Session buy-in
      </p>
      <h1 className="display animate-rise-delay-1 mt-4 text-[clamp(2.5rem,7vw,4.2rem)] leading-[0.95] font-extrabold tracking-tight">
        Casino floor
      </h1>
      <p className="animate-rise-delay-2 mt-5 text-lg text-sz-mist/75">
        Walk in with {CASINO_BUY_IN} Zard. Session-only wallet — refresh clears
        the table. No accounts, no real stakes.
      </p>
      <button
        type="button"
        onClick={enterCasino}
        className="animate-rise-delay-3 mt-8 rounded-full bg-sz-jade px-6 py-3 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
      >
        Buy in — {CASINO_BUY_IN} Zard
      </button>
    </section>
  );
}
