import type { StrategyAction } from "@/casino/engine/strategy/basic";

const I18_ROWS: { spot: string; index: string; action: string }[] = [
  { spot: "Insurance", index: "TC ≥ +3", action: "Take" },
  { spot: "16 vs 10", index: "TC ≥ 0", action: "S" },
  { spot: "15 vs 10", index: "TC ≥ +4", action: "S" },
  { spot: "T,T vs 5", index: "TC ≥ +5", action: "P" },
  { spot: "T,T vs 6", index: "TC ≥ +4", action: "P" },
  { spot: "10 vs 10", index: "TC ≥ +4", action: "D" },
  { spot: "12 vs 3", index: "TC ≥ +2", action: "S" },
  { spot: "12 vs 2", index: "TC ≥ +3", action: "S" },
  { spot: "11 vs A", index: "TC ≥ +1", action: "D" },
  { spot: "9 vs 2", index: "TC ≥ +1", action: "D" },
  { spot: "10 vs A", index: "TC ≥ +4", action: "D" },
  { spot: "9 vs 7", index: "TC ≥ +3", action: "D" },
  { spot: "16 vs 9", index: "TC ≥ +5", action: "S" },
  { spot: "13 vs 2", index: "TC < −1", action: "H" },
  { spot: "12 vs 4", index: "TC < 0", action: "H" },
  { spot: "12 vs 5", index: "TC < −2", action: "H" },
  { spot: "12 vs 6", index: "TC < −1", action: "H" },
  { spot: "13 vs 3", index: "TC < −2", action: "H" },
];

type CountPanelProps = {
  runningCount: number;
  tc: number;
  decksRemaining: number;
  cardsLeft: number;
  deviation: StrategyAction | null;
  insuranceCue: boolean;
};

export function CountPanel({
  runningCount,
  tc,
  decksRemaining,
  cardsLeft,
  deviation,
  insuranceCue,
}: CountPanelProps) {
  return (
    <aside className="space-y-4 border border-sz-gold/25 bg-sz-panel/60 p-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-gold/90">
          Count coach · Hi-Lo
        </p>
        <dl className="mt-3 grid grid-cols-3 gap-3">
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-sz-mist/40">
              RC
            </dt>
            <dd className="display mt-1 text-2xl font-bold tabular-nums text-sz-gold">
              {runningCount > 0 ? `+${runningCount}` : runningCount}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-sz-mist/40">
              TC
            </dt>
            <dd className="display mt-1 text-2xl font-bold tabular-nums text-sz-gold">
              {tc > 0 ? `+${tc}` : tc}
            </dd>
          </div>
          <div>
            <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-sz-mist/40">
              Decks
            </dt>
            <dd className="display mt-1 text-2xl font-bold tabular-nums">
              {decksRemaining.toFixed(1)}
            </dd>
          </div>
        </dl>
        <p className="mt-2 text-xs text-sz-mist/50">{cardsLeft} cards left</p>
        {deviation || insuranceCue ? (
          <p className="mt-2 text-sm font-semibold text-sz-gold">
            {insuranceCue ? "I18: take insurance" : null}
            {insuranceCue && deviation ? " · " : null}
            {deviation ? `I18 override → ${deviation}` : null}
          </p>
        ) : (
          <p className="mt-2 text-sm text-sz-mist/50">No deviation this spot</p>
        )}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full min-w-[240px] border-collapse text-left font-mono text-[10px] sm:text-[11px]">
          <thead>
            <tr className="text-sz-mist/40">
              <th className="py-1 pr-2 font-medium">Spot</th>
              <th className="py-1 pr-2 font-medium">Index</th>
              <th className="py-1 font-medium">Play</th>
            </tr>
          </thead>
          <tbody>
            {I18_ROWS.map((row) => {
              const hot =
                (insuranceCue && row.spot === "Insurance") ||
                (deviation && row.action === deviation);
              return (
                <tr
                  key={row.spot}
                  className={
                    hot
                      ? "bg-sz-gold/20 text-sz-gold"
                      : "text-sz-mist/65"
                  }
                >
                  <td className="py-1 pr-2">{row.spot}</td>
                  <td className="py-1 pr-2">{row.index}</td>
                  <td className="py-1 font-semibold">{row.action}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <p className="border-t border-white/10 pt-3 text-[11px] leading-relaxed text-sz-mist/45">
        Illustrious 18 deviations for multi-deck Hi-Lo / S17. Gold = count
        override. Educational only — sources: published I18 tables / Blackjack
        Apprentice–style references.
      </p>
    </aside>
  );
}
