"use client";

import {
  applyAction,
  createBjRound,
  declineInsuranceOffer,
  handTotal,
  settlePayouts,
  type BjAction,
  type BjState,
} from "@/casino/engine/blackjack";
import type { Card } from "@/casino/engine/cards";
import { blackjackValue } from "@/casino/engine/cards";
import { hiLoDelta, trueCount } from "@/casino/engine/hilo";
import {
  cardsRemaining,
  createShoe,
  needsShuffle,
  reshuffle,
  type Shoe,
} from "@/casino/engine/shoe";
import {
  basicStrategy,
  pairKey,
  upCol,
  type StrategyAction,
  type StrategyInput,
} from "@/casino/engine/strategy/basic";
import {
  illustriousDeviation,
  shouldTakeInsurance,
} from "@/casino/engine/strategy/illustrious18";
import { useCasinoSession } from "@/casino/session/CasinoSessionContext";
import { useEffect, useMemo, useRef, useState } from "react";
import { CountPanel } from "./CountPanel";
import { Playmat } from "./Playmat";
import {
  StrategyPanel,
  type StrategyHighlight,
} from "./StrategyPanel";

const CHIP_STEPS = [10, 25, 50, 100, 200] as const;

/** Persist shoe + RC across remounts within the browser tab / casino session. */
let sessionShoe: Shoe | null = null;
let sessionRunningCount = 0;
const sessionCountedIds = new Set<string>();

function ensureShoe(): Shoe {
  if (!sessionShoe) sessionShoe = createShoe(6);
  return sessionShoe;
}

function publishShoe(shoe: Shoe) {
  sessionShoe = shoe;
}

function stakesOnTable(state: BjState): number {
  return (
    state.playerHands.reduce((sum, hand) => sum + hand.bet, 0) +
    state.insuranceBet
  );
}

function visibleCards(state: BjState): Card[] {
  const player = state.playerHands.flatMap((h) => h.cards);
  if (!state.holeRevealed && state.dealer.length > 0) {
    return [...player, state.dealer[0]];
  }
  return [...player, ...state.dealer];
}

function absorbCount(state: BjState): number {
  let delta = 0;
  for (const card of visibleCards(state)) {
    if (sessionCountedIds.has(card.id)) continue;
    sessionCountedIds.add(card.id);
    delta += hiLoDelta(card.rank);
  }
  if (delta !== 0) sessionRunningCount += delta;
  return sessionRunningCount;
}

function discardRound(state: BjState): Shoe {
  const played = [
    ...state.playerHands.flatMap((h) => h.cards),
    ...state.dealer,
  ];
  return {
    ...state.shoe,
    discard: [...state.shoe.discard, ...played],
  };
}

function maybeReshuffle(shoe: Shoe): Shoe {
  if (!needsShuffle(shoe)) return shoe;
  sessionCountedIds.clear();
  sessionRunningCount = 0;
  return reshuffle(shoe);
}

function canSurrenderHand(state: BjState): boolean {
  const hand = state.playerHands[state.activeHand];
  return (
    state.phase === "player" &&
    state.playerHands.length === 1 &&
    hand.cards.length === 2 &&
    !hand.doubled &&
    !hand.fromSplitAces
  );
}

function canDoubleHand(state: BjState): boolean {
  const hand = state.playerHands[state.activeHand];
  return (
    state.phase === "player" &&
    hand.cards.length === 2 &&
    !hand.stood &&
    !hand.surrendered &&
    !hand.fromSplitAces
  );
}

function canSplitHand(state: BjState): boolean {
  const hand = state.playerHands[state.activeHand];
  if (state.phase !== "player") return false;
  if (state.playerHands.length >= 3) return false;
  if (hand.cards.length !== 2) return false;
  if (hand.fromSplitAces) return false;
  return (
    blackjackValue(hand.cards[0].rank) === blackjackValue(hand.cards[1].rank)
  );
}

function strategyInputFor(
  state: BjState,
  bankroll: number,
): StrategyInput | null {
  if (state.phase !== "player") return null;
  const hand = state.playerHands[state.activeHand];
  const up = state.dealer[0];
  if (!up || hand.cards.length === 0) return null;
  const { total, soft } = handTotal(hand.cards);
  const pair =
    hand.cards.length === 2 &&
    blackjackValue(hand.cards[0].rank) === blackjackValue(hand.cards[1].rank);
  return {
    playerTotal: total,
    soft,
    pairRank: pair ? hand.cards[0].rank : undefined,
    dealerUp: up.rank,
    canDouble: canDoubleHand(state) && bankroll >= hand.bet,
    canSplit: canSplitHand(state) && bankroll >= hand.bet,
    canSurrender: canSurrenderHand(state),
  };
}

function actionKey(
  action: StrategyAction,
): Exclude<BjAction, "deal" | "insurance"> {
  switch (action) {
    case "H":
      return "hit";
    case "S":
      return "stand";
    case "D":
      return "double";
    case "P":
      return "split";
    case "R":
      return "surrender";
  }
}

function buttonHighlight(
  action: Exclude<BjAction, "deal">,
  basic: StrategyAction | null,
  deviation: StrategyAction | null,
  basicOn: boolean,
  countOn: boolean,
): "gold" | "jade" | null {
  if (countOn && deviation && actionKey(deviation) === action) return "gold";
  if (basicOn && basic && actionKey(basic) === action) {
    if (countOn && deviation && actionKey(deviation) === action) return "gold";
    return "jade";
  }
  if (countOn && action === "insurance" && deviation === null) {
    // insurance cue handled separately via insuranceCue
  }
  return null;
}

function strategyHighlightFor(
  input: StrategyInput | null,
): StrategyHighlight | null {
  if (!input) return null;
  const up = upCol(input.dealerUp);
  if (input.pairRank !== undefined) {
    const key = pairKey(input.pairRank);
    if (key !== null) return { chart: "pairs", row: key, up };
  }
  if (input.soft) return { chart: "soft", row: String(input.playerTotal), up };
  const total = Math.min(21, Math.max(4, input.playerTotal));
  return { chart: "hard", row: String(total), up };
}

function isUnresolvedPhase(phase: BjState["phase"]): boolean {
  return phase === "insurance" || phase === "player" || phase === "dealer";
}

export function BlackjackTable() {
  const {
    state: session,
    adjustBankroll,
    recordHand,
    registerTableAbandon,
  } = useCasinoSession();
  const [bet, setBet] = useState(50);
  const [round, setRound] = useState<BjState | null>(null);
  const [basicOn, setBasicOn] = useState(false);
  const [countOn, setCountOn] = useState(false);
  const [runningCount, setRunningCount] = useState(sessionRunningCount);
  const [message, setMessage] = useState("Place a bet and deal.");
  const settledApplied = useRef(false);
  const roundRef = useRef<BjState | null>(null);
  const abandonedRef = useRef(false);

  roundRef.current = round;

  function abandonUnresolvedRound(): number {
    if (abandonedRef.current) return 0;
    const current = roundRef.current;
    if (!current || !isUnresolvedPhase(current.phase)) return 0;
    if (settledApplied.current) return 0;

    abandonedRef.current = true;
    const refund = stakesOnTable(current);
    publishShoe(discardRound(current));
    roundRef.current = null;
    setRound(null);
    setMessage("Hand abandoned — stakes returned.");
    return refund;
  }

  useEffect(() => {
    registerTableAbandon(abandonUnresolvedRound);
    return () => {
      const refund = abandonUnresolvedRound();
      if (refund > 0) adjustBankroll(refund);
      registerTableAbandon(null);
    };
    // Register once; abandon reads latest round via refs.
    // eslint-disable-next-line react-hooks/exhaustive-deps -- intentional mount/unmount lifecycle
  }, []);

  useEffect(() => {
    if (!round) return;
    setRunningCount(absorbCount(round));
  }, [round]);

  const shoeSnapshot = round?.shoe ?? ensureShoe();
  const cardsLeft = cardsRemaining(shoeSnapshot);
  const decksRemaining = cardsLeft / 52;
  const tc = trueCount(runningCount, cardsLeft);

  const stratInput = useMemo(
    () => (round ? strategyInputFor(round, session.bankroll) : null),
    [round, session.bankroll],
  );

  const basicRec = stratInput ? basicStrategy(stratInput) : null;
  const deviation =
    stratInput && countOn
      ? illustriousDeviation({ ...stratInput, trueCount: tc })
      : null;
  const insuranceCue =
    countOn && round?.phase === "insurance" && shouldTakeInsurance(tc);

  /*
   * Bankroll model (chips in hand):
   * - Deduct wagers when placed (deal / insurance / double / split).
   * - settlePayouts() is pure P/L with stakes still “on the table”.
   * - On settle: adjustBankroll(settlePayouts(state) + stakesOnTable(state))
   *   so chips return with profit/loss applied once.
   */
  function settleIfNeeded(next: BjState) {
    if (next.phase !== "settled" || settledApplied.current) return;
    settledApplied.current = true;
    const pl = settlePayouts(next);
    const returned = stakesOnTable(next);
    adjustBankroll(pl + returned);
    recordHand();
    setMessage(`${next.message} · P/L ${pl >= 0 ? "+" : ""}${pl}`);
  }

  function commit(next: BjState, note?: string) {
    publishShoe(next.shoe);
    setRound(next);
    setRunningCount(absorbCount(next));
    if (next.phase === "settled") {
      settleIfNeeded(next);
    } else if (note) {
      setMessage(note);
    } else {
      setMessage(next.message);
    }
  }

  function deal() {
    if (bet < 10 || bet > session.bankroll) {
      setMessage("Bet between 10 and your bankroll.");
      return;
    }
    let shoe = ensureShoe();
    if (round?.phase === "settled") {
      shoe = discardRound(round);
    }
    shoe = maybeReshuffle(shoe);
    publishShoe(shoe);
    settledApplied.current = false;
    abandonedRef.current = false;
    adjustBankroll(-bet);
    const next = createBjRound(shoe, bet);
    commit(next, next.message || "Your play");
  }

  function play(action: Exclude<BjAction, "deal">) {
    if (!round) return;

    if (round.phase === "insurance") {
      if (action === "insurance") {
        const cost = Math.floor(round.baseBet / 2);
        if (cost > session.bankroll) {
          setMessage("Not enough chips for insurance.");
          return;
        }
        adjustBankroll(-cost);
        commit(applyAction(round, "insurance"));
        return;
      }
      return;
    }

    if (round.phase !== "player") return;
    const hand = round.playerHands[round.activeHand];

    if (action === "double") {
      if (!canDoubleHand(round) || session.bankroll < hand.bet) {
        setMessage("Cannot double.");
        return;
      }
      adjustBankroll(-hand.bet);
    }
    if (action === "split") {
      if (!canSplitHand(round) || session.bankroll < hand.bet) {
        setMessage("Cannot split.");
        return;
      }
      adjustBankroll(-hand.bet);
    }
    if (action === "surrender" && !canSurrenderHand(round)) {
      setMessage("Cannot surrender.");
      return;
    }

    commit(applyAction(round, action));
  }

  function noInsurance() {
    if (!round || round.phase !== "insurance") return;
    commit(declineInsuranceOffer(round));
  }

  const phase = round?.phase ?? "betting";
  const showBetControls = !round || phase === "settled" || phase === "betting";
  const chartHighlight =
    basicOn && phase === "player" ? strategyHighlightFor(stratInput) : null;

  function highlight(action: Exclude<BjAction, "deal">) {
    if (action === "insurance" && insuranceCue) return "gold" as const;
    return buttonHighlight(action, basicRec, deviation, basicOn, countOn);
  }

  function actionClass(action: Exclude<BjAction, "deal">, base: string) {
    const h = highlight(action);
    if (h === "gold") {
      return `${base} ring-2 ring-sz-gold shadow-[0_0_18px_rgba(240,196,92,0.35)] border-sz-gold/50`;
    }
    if (h === "jade") {
      return `${base} ring-2 ring-sz-jade shadow-[0_0_18px_rgba(61,255,154,0.3)] border-sz-jade/50`;
    }
    return base;
  }

  const activeBet =
    round && phase === "player"
      ? round.playerHands[round.activeHand].bet
      : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sz-jade/80">
            Neon Void · Six-deck S17
          </p>
          <h2 className="display mt-2 text-3xl font-bold text-sz-mist">
            Blackjack
          </h2>
        </div>
        <div className="flex flex-wrap gap-3 text-sm">
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            <input
              type="checkbox"
              checked={basicOn}
              onChange={(e) => setBasicOn(e.target.checked)}
              className="accent-[var(--sz-jade)]"
            />
            <span className="text-sz-jade">Basic strategy</span>
          </label>
          <label className="flex cursor-pointer items-center gap-2 rounded-full border border-white/10 px-3 py-1.5">
            <input
              type="checkbox"
              checked={countOn}
              onChange={(e) => setCountOn(e.target.checked)}
              className="accent-[var(--sz-gold)]"
            />
            <span className="text-sz-gold">Count coach</span>
          </label>
        </div>
      </div>

      <Playmat state={round} bet={round?.baseBet ?? bet} />

      <p className="text-center text-sm text-sz-mist/75">{message}</p>
      {countOn ? (
        <p className="text-center font-mono text-xs text-sz-gold/80">
          RC {runningCount > 0 ? `+${runningCount}` : runningCount} · TC{" "}
          {tc > 0 ? `+${tc}` : tc} · {decksRemaining.toFixed(1)} decks
        </p>
      ) : null}

      <div className="flex flex-wrap items-center justify-center gap-2 sm:gap-3">
        {phase === "insurance" ? (
          <>
            <button
              type="button"
              onClick={() => play("insurance")}
              className={actionClass(
                "insurance",
                "rounded-full border border-sz-gold/40 px-5 py-2.5 text-sm font-semibold text-sz-gold transition hover:bg-sz-gold/10",
              )}
            >
              Take insurance{insuranceCue ? " ★" : ""}
            </button>
            <button
              type="button"
              onClick={noInsurance}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-jade/50"
            >
              No insurance
            </button>
          </>
        ) : null}

        {phase === "player" ? (
          <>
            <button
              type="button"
              onClick={() => play("hit")}
              className={actionClass(
                "hit",
                "rounded-full border border-transparent bg-sz-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110",
              )}
            >
              Hit
            </button>
            <button
              type="button"
              onClick={() => play("stand")}
              className={actionClass(
                "stand",
                "rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-jade/50",
              )}
            >
              Stand
            </button>
            <button
              type="button"
              disabled={!round || !canDoubleHand(round) || session.bankroll < activeBet}
              onClick={() => play("double")}
              className={actionClass(
                "double",
                "rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-jade/50 disabled:opacity-40",
              )}
            >
              Double
            </button>
            <button
              type="button"
              disabled={!round || !canSplitHand(round) || session.bankroll < activeBet}
              onClick={() => play("split")}
              className={actionClass(
                "split",
                "rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-jade/50 disabled:opacity-40",
              )}
            >
              Split
            </button>
            <button
              type="button"
              disabled={!round || !canSurrenderHand(round)}
              onClick={() => play("surrender")}
              className={actionClass(
                "surrender",
                "rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-ember/50 disabled:opacity-40",
              )}
            >
              Surrender
            </button>
          </>
        ) : null}

        {showBetControls ? (
          <>
            <div className="flex flex-wrap items-center gap-2">
              {CHIP_STEPS.map((chip) => (
                <button
                  key={chip}
                  type="button"
                  disabled={chip > session.bankroll}
                  onClick={() => setBet(chip)}
                  className={`rounded-full px-3 py-1.5 text-xs font-semibold transition disabled:opacity-35 ${
                    bet === chip
                      ? "bg-sz-gold text-sz-void"
                      : "border border-white/15 text-sz-mist hover:border-sz-gold/40"
                  }`}
                >
                  {chip}
                </button>
              ))}
              <label className="flex items-center gap-2 text-sm text-sz-mist/80">
                Bet
                <input
                  type="number"
                  min={10}
                  max={Math.max(10, session.bankroll)}
                  step={5}
                  value={bet}
                  onChange={(e) => setBet(Number(e.target.value))}
                  className="w-20 rounded-lg border border-white/15 bg-sz-void px-2 py-1.5 text-sz-mist outline-none focus:border-sz-jade/60"
                />
              </label>
            </div>
            <button
              type="button"
              onClick={deal}
              disabled={session.bankroll < 10}
              className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold disabled:opacity-40"
            >
              {phase === "settled" ? "Next hand" : "Deal"}
            </button>
          </>
        ) : null}
      </div>

      {basicOn || countOn ? (
        <div className="grid gap-4 lg:grid-cols-2">
          {basicOn ? (
            <StrategyPanel recommend={basicRec} highlight={chartHighlight} />
          ) : null}
          {countOn ? (
            <CountPanel
              runningCount={runningCount}
              tc={tc}
              decksRemaining={decksRemaining}
              cardsLeft={cardsLeft}
              deviation={deviation}
              insuranceCue={!!insuranceCue}
            />
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
