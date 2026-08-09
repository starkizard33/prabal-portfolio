import { blackjackValue, type Card } from "./cards";
import { draw, type Shoe } from "./shoe";

export type BjAction =
  | "hit"
  | "stand"
  | "double"
  | "split"
  | "surrender"
  | "insurance"
  | "deal";

export type Hand = {
  cards: Card[];
  bet: number;
  stood: boolean;
  doubled: boolean;
  surrendered: boolean;
  fromSplitAces: boolean;
};

export type BjPhase =
  | "betting"
  | "insurance"
  | "player"
  | "dealer"
  | "settled";

export type BjState = {
  shoe: Shoe;
  playerHands: Hand[];
  activeHand: number;
  dealer: Card[];
  holeRevealed: boolean;
  phase: BjPhase;
  baseBet: number;
  insuranceBet: number;
  message: string;
};

function emptyHand(bet: number, cards: Card[] = []): Hand {
  return {
    cards,
    bet,
    stood: false,
    doubled: false,
    surrendered: false,
    fromSplitAces: false,
  };
}

export function handTotal(cards: Card[]): { total: number; soft: boolean } {
  let total = 0;
  let aces = 0;
  for (const card of cards) {
    total += blackjackValue(card.rank);
    if (card.rank === "A") aces += 1;
  }
  while (total > 21 && aces > 0) {
    total -= 10;
    aces -= 1;
  }
  const soft = aces > 0 && total <= 21;
  return { total, soft };
}

export function isBlackjack(cards: Card[]): boolean {
  return cards.length === 2 && handTotal(cards).total === 21;
}

function isTenValue(card: Card): boolean {
  return blackjackValue(card.rank) === 10;
}

function dealerUpcard(state: BjState): Card | undefined {
  return state.dealer[0];
}

function cloneState(state: BjState): BjState {
  return {
    ...state,
    shoe: {
      ...state.shoe,
      cards: [...state.shoe.cards],
      discard: [...state.shoe.discard],
    },
    playerHands: state.playerHands.map((h) => ({
      ...h,
      cards: [...h.cards],
    })),
    dealer: [...state.dealer],
  };
}

function drawOne(state: BjState): { card: Card; state: BjState } {
  const { cards, shoe } = draw(state.shoe, 1);
  return { card: cards[0], state: { ...state, shoe } };
}

function settleMessage(
  playerHands: Hand[],
  dealer: Card[],
): string {
  if (
    playerHands.length === 1 &&
    isBlackjack(playerHands[0].cards) &&
    !isBlackjack(dealer)
  ) {
    return "Blackjack pays 3:2";
  }
  if (playerHands.every((h) => h.surrendered)) {
    return "Surrender — half bet returned";
  }
  if (isBlackjack(dealer) && !playerHands.some((h) => isBlackjack(h.cards))) {
    return "Dealer blackjack";
  }
  return "Round settled";
}

function finalizeSettlement(state: BjState): BjState {
  return {
    ...state,
    holeRevealed: true,
    phase: "settled",
    message: settleMessage(state.playerHands, state.dealer),
  };
}

function bothHaveBlackjack(player: Card[], dealer: Card[]): boolean {
  return isBlackjack(player) && isBlackjack(dealer);
}

function peekForDealerBlackjack(state: BjState): BjState {
  if (!isBlackjack(state.dealer)) {
    return {
      ...state,
      phase: "player",
      message:
        state.insuranceBet > 0 ? "Insurance lost — your play" : "Your play",
    };
  }

  const tookInsurance = state.insuranceBet > 0;
  const playerBj = isBlackjack(state.playerHands[0].cards);
  return finalizeSettlement({
    ...state,
    holeRevealed: true,
    message: tookInsurance
      ? "Dealer blackjack — insurance pays 2:1"
      : playerBj
        ? "Push — both blackjack"
        : "Dealer blackjack",
  });
}

function resolveDealerPeek(state: BjState): BjState {
  const up = state.dealer[0];
  const hole = state.dealer[1];
  if (!up || !hole) return state;

  // Ace up: offer insurance first; peek only after take/decline.
  if (up.rank === "A") {
    return {
      ...state,
      phase: "insurance",
      message: "Insurance?",
    };
  }

  // Ten-value: peek immediately (no insurance).
  if (isTenValue(up) && isBlackjack(state.dealer)) {
    const playerBj = isBlackjack(state.playerHands[0].cards);
    return finalizeSettlement({
      ...state,
      holeRevealed: true,
      message: playerBj ? "Push — both blackjack" : "Dealer blackjack",
    });
  }

  return { ...state, phase: "player", message: "Your play" };
}

export function createBjRound(shoe: Shoe, bet: number): BjState {
  let state: BjState = {
    shoe,
    playerHands: [emptyHand(bet)],
    activeHand: 0,
    dealer: [],
    holeRevealed: false,
    phase: "betting",
    baseBet: bet,
    insuranceBet: 0,
    message: "",
  };

  for (let i = 0; i < 2; i++) {
    const p = drawOne(state);
    state = p.state;
    state.playerHands[0] = {
      ...state.playerHands[0],
      cards: [...state.playerHands[0].cards, p.card],
    };
    const d = drawOne(state);
    state = d.state;
    state.dealer = [...state.dealer, d.card];
  }

  const playerCards = state.playerHands[0].cards;
  const dealerCards = state.dealer;

  if (isBlackjack(playerCards) && !isBlackjack(dealerCards)) {
    return finalizeSettlement({
      ...state,
      holeRevealed: true,
      message: "Blackjack pays 3:2",
    });
  }

  if (bothHaveBlackjack(playerCards, dealerCards)) {
    return finalizeSettlement({
      ...state,
      holeRevealed: true,
      message: "Push — both blackjack",
    });
  }

  return resolveDealerPeek(state);
}

function active(state: BjState): Hand {
  return state.playerHands[state.activeHand];
}

function canSurrender(state: BjState): boolean {
  const hand = active(state);
  return (
    state.phase === "player" &&
    state.playerHands.length === 1 &&
    hand.cards.length === 2 &&
    !hand.doubled &&
    !hand.fromSplitAces
  );
}

function canDouble(state: BjState): boolean {
  const hand = active(state);
  return (
    state.phase === "player" &&
    hand.cards.length === 2 &&
    !hand.stood &&
    !hand.surrendered &&
    !hand.fromSplitAces
  );
}

function canSplit(state: BjState): boolean {
  const hand = active(state);
  if (state.phase !== "player") return false;
  if (state.playerHands.length >= 3) return false;
  if (hand.cards.length !== 2) return false;
  if (hand.fromSplitAces) return false;
  return blackjackValue(hand.cards[0].rank) === blackjackValue(hand.cards[1].rank);
}

function handFinished(hand: Hand): boolean {
  if (hand.surrendered || hand.stood || hand.doubled) return true;
  if (hand.fromSplitAces && hand.cards.length >= 2) return true;
  return handTotal(hand.cards).total >= 21;
}

function advanceAfterPlayerAction(state: BjState): BjState {
  let next = cloneState(state);

  while (next.activeHand < next.playerHands.length) {
    const hand = next.playerHands[next.activeHand];
    if (!handFinished(hand)) {
      return { ...next, phase: "player", message: "Your play" };
    }
    next.activeHand += 1;
  }

  const allBustOrSurrender = next.playerHands.every(
    (h) => h.surrendered || handTotal(h.cards).total > 21,
  );
  if (allBustOrSurrender) {
    return finalizeSettlement({
      ...next,
      holeRevealed: true,
      message: next.playerHands.every((h) => h.surrendered)
        ? "Surrender — half bet returned"
        : "Bust",
    });
  }

  return playDealer(next);
}

function playDealer(state: BjState): BjState {
  let next: BjState = {
    ...cloneState(state),
    phase: "dealer",
    holeRevealed: true,
    message: "Dealer plays",
  };

  // S17: hit while hard/soft total < 17; stand on soft 17
  let total = handTotal(next.dealer);
  while (total.total < 17) {
    const drawn = drawOne(next);
    next = {
      ...drawn.state,
      dealer: [...next.dealer, drawn.card],
      phase: "dealer",
      holeRevealed: true,
    };
    total = handTotal(next.dealer);
  }

  return finalizeSettlement(next);
}

function declineInsurance(state: BjState): BjState {
  return peekForDealerBlackjack({
    ...state,
    insuranceBet: 0,
  });
}

/** Decline insurance without chaining a player action. */
export function declineInsuranceOffer(state: BjState): BjState {
  if (state.phase !== "insurance") return state;
  return declineInsurance(state);
}

function takeInsurance(state: BjState): BjState {
  const amount = Math.floor(state.baseBet / 2);
  return peekForDealerBlackjack({
    ...cloneState(state),
    insuranceBet: amount,
  });
}

export function applyAction(
  state: BjState,
  action: Exclude<BjAction, "deal">,
): BjState {
  if (state.phase === "settled" || state.phase === "betting") {
    return state;
  }

  if (state.phase === "insurance") {
    if (action === "insurance") return takeInsurance(state);
    // Any other action declines insurance and continues if applicable
    const declined = declineInsurance(state);
    if (action === "stand" || action === "hit" || action === "double" || action === "split" || action === "surrender") {
      return applyAction(declined, action);
    }
    return declined;
  }

  if (state.phase !== "player") return state;

  const hand = active(state);

  if (action === "insurance") return state;

  if (action === "surrender") {
    if (!canSurrender(state)) return state;
    const hands = state.playerHands.map((h, i) =>
      i === state.activeHand ? { ...h, surrendered: true } : h,
    );
    return advanceAfterPlayerAction({ ...state, playerHands: hands });
  }

  if (action === "hit") {
    if (hand.stood || hand.surrendered || hand.fromSplitAces) return state;
    const drawn = drawOne(cloneState(state));
    const cards = [...hand.cards, drawn.card];
    const hands = drawn.state.playerHands.map((h, i) =>
      i === state.activeHand ? { ...h, cards } : h,
    );
    const next = { ...drawn.state, playerHands: hands };
    if (handTotal(cards).total >= 21) {
      return advanceAfterPlayerAction({
        ...next,
        playerHands: hands.map((h, i) =>
          i === state.activeHand ? { ...h, stood: handTotal(cards).total === 21 } : h,
        ),
      });
    }
    return { ...next, message: "Your play" };
  }

  if (action === "stand") {
    const hands = state.playerHands.map((h, i) =>
      i === state.activeHand ? { ...h, stood: true } : h,
    );
    return advanceAfterPlayerAction({ ...state, playerHands: hands });
  }

  if (action === "double") {
    if (!canDouble(state)) return state;
    const drawn = drawOne(cloneState(state));
    const cards = [...hand.cards, drawn.card];
    const hands = drawn.state.playerHands.map((h, i) =>
      i === state.activeHand
        ? { ...h, cards, bet: h.bet * 2, doubled: true, stood: true }
        : h,
    );
    return advanceAfterPlayerAction({ ...drawn.state, playerHands: hands });
  }

  if (action === "split") {
    if (!canSplit(state)) return state;
    let next = cloneState(state);
    const current = next.playerHands[next.activeHand];
    const [first, second] = current.cards;
    const splittingAces = first.rank === "A" && second.rank === "A";

    const handA = emptyHand(current.bet, [first]);
    const handB = emptyHand(current.bet, [second]);
    if (splittingAces) {
      handA.fromSplitAces = true;
      handB.fromSplitAces = true;
    }

    next.playerHands = [
      ...next.playerHands.slice(0, next.activeHand),
      handA,
      handB,
      ...next.playerHands.slice(next.activeHand + 1),
    ];

    const drawA = drawOne(next);
    next = drawA.state;
    next.playerHands[next.activeHand] = {
      ...next.playerHands[next.activeHand],
      cards: [...next.playerHands[next.activeHand].cards, drawA.card],
      stood: splittingAces,
      fromSplitAces: splittingAces,
    };

    const drawB = drawOne(next);
    next = drawB.state;
    const handBIndex = next.activeHand + 1;
    next.playerHands[handBIndex] = {
      ...next.playerHands[handBIndex],
      cards: [...next.playerHands[handBIndex].cards, drawB.card],
      stood: splittingAces,
      fromSplitAces: splittingAces,
    };

    // Always advance: natural 21 on a split hand must skip finished hands.
    return advanceAfterPlayerAction(next);
  }

  return state;
}

/**
 * Pure player profit/loss for a settled round (positive = player wins).
 *
 * Convention: bets remain on the table — the engine never deducts stakes from
 * bankroll. Session code should apply this delta after deducting/restoring
 * stakes consistently with that model (or treat bankroll as including table
 * stakes and add this delta directly).
 *
 * Payouts: +bet win, +1.5×bet natural BJ, 0 push, −bet loss, −bet/2 surrender;
 * insurance +2×insuranceBet if dealer BJ else −insuranceBet.
 */
export function settlePayouts(state: BjState): number {
  if (state.phase !== "settled") return 0;

  let delta = 0;
  const dealerBj = isBlackjack(state.dealer);
  const dealerTotal = handTotal(state.dealer).total;
  const dealerBust = dealerTotal > 21;

  if (state.insuranceBet > 0) {
    delta += dealerBj ? state.insuranceBet * 2 : -state.insuranceBet;
  }

  for (const hand of state.playerHands) {
    if (hand.surrendered) {
      delta -= hand.bet / 2;
      continue;
    }

    const playerBj =
      isBlackjack(hand.cards) &&
      state.playerHands.length === 1 &&
      !hand.fromSplitAces;
    const playerTotal = handTotal(hand.cards).total;

    if (playerTotal > 21) {
      delta -= hand.bet;
      continue;
    }

    if (dealerBj && playerBj) {
      continue; // push
    }

    if (playerBj) {
      delta += hand.bet * 1.5;
      continue;
    }

    if (dealerBj) {
      delta -= hand.bet;
      continue;
    }

    if (dealerBust || playerTotal > dealerTotal) {
      delta += hand.bet;
    } else if (playerTotal < dealerTotal) {
      delta -= hand.bet;
    }
    // push: 0
  }

  return delta;
}
