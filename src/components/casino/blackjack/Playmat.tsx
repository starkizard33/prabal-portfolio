import type { BjState } from "@/casino/engine/blackjack";
import { handTotal } from "@/casino/engine/blackjack";
import { CardView } from "./CardView";

type PlaymatProps = {
  state: BjState | null;
  bet: number;
};

function dealOrderIndex(
  handIndex: number,
  cardIndex: number,
  playerHandCount: number,
): number {
  // Initial deal interleaves player/dealer; later hits continue the sequence.
  if (handIndex === -1) {
    // dealer
    return cardIndex === 0 ? 1 : cardIndex === 1 ? 3 : 4 + playerHandCount + cardIndex;
  }
  if (cardIndex < 2 && handIndex === 0) {
    return cardIndex === 0 ? 0 : 2;
  }
  return 4 + handIndex * 4 + cardIndex;
}

export function Playmat({ state, bet }: PlaymatProps) {
  const hideHole =
    !!state &&
    !state.holeRevealed &&
    (state.phase === "player" || state.phase === "insurance");

  const dealerTotal =
    state && state.dealer.length > 0
      ? hideHole
        ? handTotal([state.dealer[0]]).total
        : handTotal(state.dealer).total
      : null;

  return (
    <div className="relative overflow-hidden rounded-[2rem] border border-sz-jade/35 bg-[radial-gradient(ellipse_at_50%_40%,#163528_0%,#0c1814_55%,#07100e_100%)] px-4 py-8 shadow-[0_0_60px_rgba(61,255,154,0.08),inset_0_0_80px_rgba(0,0,0,0.35)] sm:px-8 sm:py-10">
      <div className="pointer-events-none absolute inset-3 rounded-[1.6rem] border border-sz-jade/15" />
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-sz-ember/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-8 left-1/4 h-32 w-40 rounded-full bg-sz-jade/10 blur-3xl" />

      <div className="relative mx-auto flex max-w-3xl flex-col gap-10">
        <section>
          <div className="mb-3 flex items-center justify-between text-sm text-sz-mist/55">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em]">
              Dealer
            </span>
            <span className="tabular-nums">
              {dealerTotal === null ? "—" : hideHole ? `${dealerTotal}+?` : dealerTotal}
            </span>
          </div>
          <div className="flex min-h-28 flex-wrap justify-center gap-2 sm:gap-3">
            {!state || state.dealer.length === 0 ? (
              <>
                <CardView />
                <CardView />
              </>
            ) : (
              state.dealer.map((card, index) => (
                <CardView
                  key={`${card.id}-${index}`}
                  card={card}
                  hidden={hideHole && index === 1}
                  dealIndex={dealOrderIndex(-1, index, state.playerHands.length)}
                  settleRot={index % 2 === 0 ? -2 : 2}
                  flipReveal={state.holeRevealed && index === 1}
                />
              ))
            )}
          </div>
        </section>

        <div className="mx-auto flex flex-col items-center gap-1">
          <div className="h-px w-40 bg-gradient-to-r from-transparent via-sz-jade/50 to-transparent" />
          <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-sz-gold/80">
            Bet {bet} · Blackjack pays 3:2
          </p>
        </div>

        <section>
          <div className="mb-3 flex items-center justify-between text-sm text-sz-mist/55">
            <span className="font-mono text-[11px] uppercase tracking-[0.24em]">
              You
            </span>
            <span className="tabular-nums">
              {state && state.playerHands.length > 0
                ? state.playerHands
                    .map((h) => {
                      const t = handTotal(h.cards);
                      return t.soft ? `${t.total}s` : `${t.total}`;
                    })
                    .join(" · ")
                : "—"}
            </span>
          </div>
          <div className="flex flex-col items-center gap-5">
            {!state || state.playerHands.length === 0 ? (
              <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                <CardView />
                <CardView />
              </div>
            ) : (
              state.playerHands.map((hand, handIndex) => {
                const active =
                  state.phase === "player" && state.activeHand === handIndex;
                return (
                  <div
                    key={handIndex}
                    className={`rounded-xl px-2 py-2 transition ${
                      active
                        ? "ring-1 ring-sz-jade/60 shadow-[0_0_24px_rgba(61,255,154,0.15)]"
                        : ""
                    }`}
                  >
                    {state.playerHands.length > 1 ? (
                      <p className="mb-2 text-center font-mono text-[10px] uppercase tracking-[0.2em] text-sz-mist/45">
                        Hand {handIndex + 1}
                        {hand.surrendered
                          ? " · surrender"
                          : hand.doubled
                            ? " · doubled"
                            : ""}
                      </p>
                    ) : null}
                    <div className="flex flex-wrap justify-center gap-2 sm:gap-3">
                      {hand.cards.map((card, cardIndex) => (
                        <CardView
                          key={`${card.id}-${cardIndex}`}
                          card={card}
                          dealIndex={dealOrderIndex(
                            handIndex,
                            cardIndex,
                            state.playerHands.length,
                          )}
                          settleRot={cardIndex % 2 === 0 ? -1.5 : 1.5}
                        />
                      ))}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </section>
      </div>
    </div>
  );
}
