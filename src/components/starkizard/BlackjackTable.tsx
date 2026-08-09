"use client";

import { useMemo, useState } from "react";

type Suit = "♠" | "♥" | "♦" | "♣";
type Rank =
  | "A"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "10"
  | "J"
  | "Q"
  | "K";

type Card = { suit: Suit; rank: Rank; id: string };

type Phase = "betting" | "player" | "dealer" | "settled";

const suits: Suit[] = ["♠", "♥", "♦", "♣"];
const ranks: Rank[] = [
  "A",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "10",
  "J",
  "Q",
  "K",
];

function createShoe(): Card[] {
  const deck: Card[] = [];
  for (let d = 0; d < 4; d += 1) {
    for (const suit of suits) {
      for (const rank of ranks) {
        deck.push({ suit, rank, id: `${d}-${rank}${suit}` });
      }
    }
  }
  for (let i = deck.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [deck[i], deck[j]] = [deck[j], deck[i]];
  }
  return deck;
}

function handValue(cards: Card[]): number {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    if (card.rank === "A") {
      aces += 1;
      total += 11;
    } else if (["K", "Q", "J"].includes(card.rank)) {
      total += 10;
    } else {
      total += Number(card.rank);
    }
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  return total;
}

function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handValue(cards) === 21;
}

function CardFace({ card, hidden = false }: { card?: Card; hidden?: boolean }) {
  if (!card || hidden) {
    return (
      <div className="flex h-28 w-20 items-center justify-center rounded-xl border border-sz-jade/30 bg-[linear-gradient(145deg,#13221c,#0a1410)] shadow-lg">
        <div className="h-16 w-12 rounded-md border border-sz-ember/40 bg-[repeating-linear-gradient(45deg,rgba(255,107,44,0.15)_0_6px,transparent_6px_12px)]" />
      </div>
    );
  }

  const red = card.suit === "♥" || card.suit === "♦";
  return (
    <div
      className={`flex h-28 w-20 flex-col justify-between rounded-xl border border-white/15 bg-[#f7f3ea] p-2 shadow-lg ${
        red ? "text-[#c23b22]" : "text-[#12151c]"
      }`}
    >
      <span className="text-sm font-semibold">
        {card.rank}
        {card.suit}
      </span>
      <span className="self-center text-3xl">{card.suit}</span>
      <span className="self-end text-sm font-semibold">
        {card.rank}
        {card.suit}
      </span>
    </div>
  );
}

export function BlackjackTable() {
  const [shoe, setShoe] = useState<Card[]>(() => createShoe());
  const [bankroll, setBankroll] = useState(1000);
  const [bet, setBet] = useState(50);
  const [player, setPlayer] = useState<Card[]>([]);
  const [dealer, setDealer] = useState<Card[]>([]);
  const [phase, setPhase] = useState<Phase>("betting");
  const [message, setMessage] = useState("Place a bet and deal.");

  const playerTotal = useMemo(() => handValue(player), [player]);
  const dealerTotal = useMemo(() => handValue(dealer), [dealer]);

  function draw(from: Card[], count: number): { cards: Card[]; rest: Card[] } {
    let deck = from;
    if (deck.length < count + 15) {
      deck = createShoe();
    }
    return { cards: deck.slice(0, count), rest: deck.slice(count) };
  }

  function settle(nextPlayer: Card[], nextDealer: Card[], stake: number) {
    const p = handValue(nextPlayer);
    const d = handValue(nextDealer);
    const playerBj = isBlackjack(nextPlayer);
    const dealerBj = isBlackjack(nextDealer);

    if (playerBj && !dealerBj) {
      setBankroll((b) => b + Math.floor(stake * 2.5));
      setMessage("Blackjack! 3:2 payout.");
    } else if (dealerBj && !playerBj) {
      setMessage("Dealer blackjack. Better luck next hand.");
    } else if (p > 21) {
      setMessage("Bust. Dealer takes the pot.");
    } else if (d > 21 || p > d) {
      setBankroll((b) => b + stake * 2);
      setMessage(d > 21 ? "Dealer busts. You win." : "You win.");
    } else if (p < d) {
      setMessage("Dealer wins.");
    } else {
      setBankroll((b) => b + stake);
      setMessage("Push. Bet returned.");
    }
    setPhase("settled");
  }

  function deal() {
    if (bet < 10 || bet > bankroll) {
      setMessage("Bet between 10 and your bankroll.");
      return;
    }
    const first = draw(shoe, 4);
    const nextPlayer = [first.cards[0], first.cards[2]];
    const nextDealer = [first.cards[1], first.cards[3]];
    setShoe(first.rest);
    setPlayer(nextPlayer);
    setDealer(nextDealer);
    setBankroll((b) => b - bet);

    if (isBlackjack(nextPlayer) || isBlackjack(nextDealer)) {
      settle(nextPlayer, nextDealer, bet);
      return;
    }
    setPhase("player");
    setMessage("Hit or stand.");
  }

  function hit() {
    if (phase !== "player") return;
    const drawn = draw(shoe, 1);
    const nextPlayer = [...player, ...drawn.cards];
    setShoe(drawn.rest);
    setPlayer(nextPlayer);
    if (handValue(nextPlayer) > 21) {
      setPhase("settled");
      setMessage("Bust. Dealer takes the pot.");
    }
  }

  function stand() {
    if (phase !== "player") return;
    let nextDealer = [...dealer];
    let nextShoe = shoe;
    setPhase("dealer");

    while (handValue(nextDealer) < 17) {
      const drawn = draw(nextShoe, 1);
      nextDealer = [...nextDealer, ...drawn.cards];
      nextShoe = drawn.rest;
    }

    setShoe(nextShoe);
    setDealer(nextDealer);
    settle(player, nextDealer, bet);
  }

  function newRound() {
    setPlayer([]);
    setDealer([]);
    setPhase("betting");
    setMessage("Place a bet and deal.");
  }

  return (
    <div className="rounded-[1.75rem] border border-white/10 bg-sz-panel/80 p-5 shadow-[0_30px_80px_rgba(0,0,0,0.35)] md:p-8">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.28em] text-sz-jade/80">
            Felt table
          </p>
          <h2 className="display mt-2 text-3xl font-bold text-sz-mist">
            Blackjack
          </h2>
        </div>
        <div className="text-right text-sm text-sz-mist/80">
          <p>
            Bankroll:{" "}
            <span className="font-semibold text-sz-gold">{bankroll}</span>
          </p>
          <p className="mt-1">{message}</p>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <div>
          <div className="mb-3 flex items-center justify-between text-sm text-sz-mist/60">
            <span>Dealer</span>
            <span>
              {phase === "player" || phase === "betting"
                ? "?"
                : dealerTotal || "—"}
            </span>
          </div>
          <div className="flex flex-wrap gap-3">
            {dealer.length === 0 ? (
              <CardFace />
            ) : (
              dealer.map((card, index) => (
                <CardFace
                  key={card.id}
                  card={card}
                  hidden={phase === "player" && index === 1}
                />
              ))
            )}
          </div>
        </div>

        <div>
          <div className="mb-3 flex items-center justify-between text-sm text-sz-mist/60">
            <span>You</span>
            <span>{player.length ? playerTotal : "—"}</span>
          </div>
          <div className="flex flex-wrap gap-3">
            {player.length === 0 ? (
              <>
                <CardFace />
                <CardFace />
              </>
            ) : (
              player.map((card) => <CardFace key={card.id} card={card} />)
            )}
          </div>
        </div>
      </div>

      <div className="mt-8 flex flex-wrap items-center gap-3">
        {phase === "betting" || phase === "settled" ? (
          <>
            <label className="flex items-center gap-2 text-sm text-sz-mist/80">
              Bet
              <input
                type="number"
                min={10}
                max={bankroll}
                step={10}
                value={bet}
                onChange={(e) => setBet(Number(e.target.value))}
                className="w-24 rounded-lg border border-white/15 bg-sz-void px-3 py-2 text-sz-mist outline-none focus:border-sz-jade/60"
              />
            </label>
            <button
              type="button"
              onClick={phase === "settled" ? newRound : deal}
              className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
            >
              {phase === "settled" ? "Next hand" : "Deal"}
            </button>
            {phase === "settled" ? (
              <button
                type="button"
                onClick={deal}
                className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-jade/50"
              >
                Deal again
              </button>
            ) : null}
          </>
        ) : (
          <>
            <button
              type="button"
              onClick={hit}
              className="rounded-full bg-sz-ember px-5 py-2.5 text-sm font-semibold text-white transition hover:brightness-110"
            >
              Hit
            </button>
            <button
              type="button"
              onClick={stand}
              className="rounded-full border border-white/15 px-5 py-2.5 text-sm font-semibold text-sz-mist transition hover:border-sz-jade/50"
            >
              Stand
            </button>
          </>
        )}
        {bankroll < 10 ? (
          <button
            type="button"
            onClick={() => {
              setBankroll(1000);
              newRound();
              setMessage("Fresh chips. Go again.");
            }}
            className="rounded-full border border-sz-gold/40 px-5 py-2.5 text-sm font-semibold text-sz-gold"
          >
            Rebuy 1000
          </button>
        ) : null}
      </div>
    </div>
  );
}
