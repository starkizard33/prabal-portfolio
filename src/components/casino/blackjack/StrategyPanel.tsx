import {
  HARD_CHART,
  PAIRS_CHART,
  SOFT_CHART,
  type ChartCell,
  type StrategyAction,
  type UpCol,
} from "@/casino/engine/strategy/basic";

const UP_COLS: UpCol[] = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "A"];

const HARD_ROWS = [17, 16, 15, 14, 13, 12, 11, 10, 9, 8];
const SOFT_ROWS = [20, 19, 18, 17, 16, 15, 14, 13];
const PAIR_ROWS = ["A", "T", "9", "8", "7", "6", "4", "3", "2"] as const;

export type StrategyHighlight = {
  chart: "hard" | "soft" | "pairs";
  row: string;
  up: UpCol;
};

type StrategyPanelProps = {
  recommend: StrategyAction | null;
  highlight: StrategyHighlight | null;
};

function cellClass(
  chart: StrategyHighlight["chart"],
  row: string,
  up: UpCol,
  highlight: StrategyHighlight | null,
): string {
  if (
    highlight &&
    highlight.chart === chart &&
    highlight.row === row &&
    highlight.up === up
  ) {
    return "bg-sz-jade/25 text-sz-jade font-semibold shadow-[0_0_12px_rgba(61,255,154,0.25)]";
  }
  return "text-sz-mist/70";
}

function MiniChart({
  title,
  chart,
  rowLabels,
  rows,
  highlight,
}: {
  title: string;
  chart: StrategyHighlight["chart"];
  rowLabels: string[];
  rows: Record<string | number, Record<UpCol, ChartCell>>;
  highlight: StrategyHighlight | null;
}) {
  return (
    <div>
      <p className="mb-2 font-mono text-[10px] uppercase tracking-[0.22em] text-sz-mist/50">
        {title}
      </p>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[280px] border-collapse text-center font-mono text-[10px] sm:text-[11px]">
          <thead>
            <tr>
              <th className="p-1 text-sz-mist/40" />
              {UP_COLS.map((up) => (
                <th key={up} className="p-1 font-medium text-sz-mist/45">
                  {up}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rowLabels.map((label) => (
              <tr key={label}>
                <th className="p-1 text-left font-medium text-sz-mist/45">
                  {label}
                </th>
                {UP_COLS.map((up) => {
                  const cell = rows[label as keyof typeof rows]?.[up] ?? "H";
                  return (
                    <td
                      key={up}
                      className={`p-1 ${cellClass(chart, label, up, highlight)}`}
                    >
                      {cell}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function StrategyPanel({ recommend, highlight }: StrategyPanelProps) {
  return (
    <aside className="space-y-5 border border-sz-jade/20 bg-sz-panel/60 p-4">
      <div>
        <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-jade/80">
          Basic strategy
        </p>
        <p className="mt-1 text-sm text-sz-mist/65">
          Multi-deck S17 · DAS · late surrender
          {recommend ? (
            <span className="ml-2 text-sz-jade">→ {recommend}</span>
          ) : null}
        </p>
      </div>
      <MiniChart
        title="Hard"
        chart="hard"
        rowLabels={HARD_ROWS.map(String)}
        rows={HARD_CHART}
        highlight={highlight}
      />
      <MiniChart
        title="Soft"
        chart="soft"
        rowLabels={SOFT_ROWS.map(String)}
        rows={SOFT_CHART}
        highlight={highlight}
      />
      <MiniChart
        title="Pairs"
        chart="pairs"
        rowLabels={[...PAIR_ROWS]}
        rows={PAIRS_CHART}
        highlight={highlight}
      />
      <p className="border-t border-white/10 pt-3 text-[11px] leading-relaxed text-sz-mist/45">
        Educational approximation of standard multi-deck S17 DAS LS charts
        (Wizard of Odds / Blackjack Apprentice–equivalent). Not gambling advice.
      </p>
    </aside>
  );
}
