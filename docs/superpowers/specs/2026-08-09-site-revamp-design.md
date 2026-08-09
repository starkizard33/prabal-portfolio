# Site Revamp Design — Prabal Portfolio + Starkizard Casino

**Date:** 2026-08-09  
**Status:** Approved for planning  
**Stack:** Next.js App Router, TypeScript, Tailwind, client-side casino engines

## Goals

1. Fix misleading hero copy; present **SDE II at Zeta** + primary tech stack.
2. Make the professional site visually dense and premium (**Blueprint Atelier**).
3. Rebuild Starkizard hangar (**Neon Void**) with real Pokémon sprite assets; remove board games.
4. Ship a **Casino** with session buy-in, Blackjack (full actions + helpers), and Roulette.
5. Keep casino logic in pure, testable engines separate from UI.

## Non-goals

- Server-side persistence, accounts, real-money gambling.
- More table games beyond Blackjack + Roulette in this pass.
- Pixel-perfect reproduction of copyrighted Blackjack Apprentice chart images (encode equivalent strategy data; footnote sources).

## Decisions locked

| Topic | Choice |
|--------|--------|
| Pro hero look | Blueprint Atelier (light grid, frosted stack plaque, high typography) |
| Hangar/casino look | Neon Void (dark, jade neon, sprite as light source) |
| Wallet | Session-only 1000 Zard on enter; leave anytime; refresh resets |
| BJ rules | 6-deck shoe, **S17**, DAS, late surrender, BJ 3:2, split up to 3 hands |
| Count helpers | Hi-Lo + **Illustrious 18**; gold = deviation, jade = basic strategy |
| Roulette | European single-zero |
| Architecture | Modular pure-TS engines + React UI |

---

## Information architecture

```
/                              Professional portfolio
/starkizard                    Hangar (sprites, interests, casino CTA)
/starkizard/casino             Buy-in lobby + session HUD + game doors
/starkizard/casino/blackjack   Full blackjack table
/starkizard/casino/roulette    European roulette

REMOVED: /starkizard/games (board games)
```

Nav: Professional ↔ Starkizard; inside hangar → Casino; casino subnav BJ / Roulette / Leave.

---

## Professional site

### Hero (first viewport)

- Eyebrow: `SDE II at Zeta`
- Brand: **Prabal Kalia** (large, Atelier typography)
- One line of substance (systems / clearing — no chess rating claim)
- Stack plaque: `Java · Spring Boot · Microservices · Kafka · AWS`
- Atmosphere: cool paper gradient + blueprint grid + restrained signal accent
- Motion: rise-in on load; subtle grid parallax or plaque float (2–3 intentional motions)
- CTAs: `View work` · `Enter Starkizard`

### BetaZero / chess wording

- Anywhere BetaZero appears: credit the **engine** (e.g. “C++ engine, 2500+ Lichess”) — never imply Prabal personally plays at that rating.

### Rest of page

Keep existing resume-backed sections; tighten visual rhythm:

- Experience timeline with stronger vertical presence
- Projects as dense linked rows
- Skills as labeled clusters
- Achievements condensed grid
- Contact closing slab

Tone stays semi-professional; playfulness stays in Starkizard.

---

## Starkizard hangar

### Visual

- Neon Void shell: near-black base, jade/ember gradients, neon borders
- Replace SVG Mega Rayquaza with **animated sprites** (Charizard + Rayquaza GIF/APNG or sprite-sheet animation)
- Prefer vendoring a small sprite set under `public/sprites/` when redistribution is allowed; otherwise load from a documented public sprite CDN with a static fallback image
- Attribute sprite source in Starkizard footer (fan / non-commercial personal site)
- Interests: Linkin Park, TT, Max Verstappen, Pokémon, Casino — **no board games**
- Primary CTA: Enter Casino

### Content cleanup

- Delete games route and nav links
- Remove “custom board games” interest copy

---

## Casino session

### Wallet / lifecycle

1. Enter `/starkizard/casino` → confirm buy-in → **1000 Zard** credited in memory.
2. `CasinoSessionProvider` holds: `bankroll`, `startedAt`, `handsPlayed`, `spinsPlayed`, `net` (derived), optional hand history summary counters.
3. Shared bankroll across Blackjack and Roulette.
4. **Leave** → show session stats modal/page fragment → clear session → return hangar.
5. Tab refresh or navigation away from site ends session (no localStorage).
6. If bankroll &lt; table minimum → prompt leave or new buy-in (new session 1000).

### Lobby HUD

Bankroll, net P/L, hands, spins, elapsed time; doors to Blackjack / Roulette; Leave.

---

## Blackjack

### Rules (explicit)

- **6-deck** shoe, Fisher–Yates shuffle at shoe creation
- Cut card / reshuffle when remaining ≤ ~75 cards (or after hand when penetration hit)
- Dealer **stands on soft 17 (S17)**
- Blackjack pays **3:2**
- **Double** any two-card hard/soft (common internet rule; DAS allowed)
- **Split** pairs up to **3 hands** total; split Aces receive one card each (no re-hit); no re-splitting Aces
- **Late surrender** available vs dealer upcard on first two cards
- Insurance offered when dealer shows Ace (even money optional UX later; insurance in v1)
- Dealer peeks for BJ when showing Ace or Ten-value (US-style) — simplifies EV vs helpers

### UI / animation

- Full playmat: oval neon-edged felt, chip stack, bet rail
- Cards deal with CSS/JS transitions: slide from shoe → seat, stagger 80–120ms, slight rotation settle
- Reveal hidden dealer card with flip
- Controls: Deal, Hit, Stand, Double, Split, Surrender; chip bet selector before deal
- Session bankroll always visible

### Helper toggles

1. **Basic strategy** (off by default)  
   - Panel with multi-deck **S17 + DAS + late surrender** charts (hard / soft / pairs)  
   - Highlight recommended action for current hand + dealer upcard in **jade**  
   - Data tables in `src/casino/strategy/` coded from public basic-strategy references (Wizard of Odds / Apprentice-equivalent); UI footnote: “Educational approximation of standard multi-deck S17 DAS LS charts”

2. **Count coach** (off by default)  
   - Hi-Lo running count; true count = RC / decksRemaining (decksRemaining = cardsLeft/52)  
   - Display RC, TC, decks remaining  
   - **Illustrious 18** deviation table; when TC meets threshold for current spot, highlight that action in **gold** (takes priority over jade basic highlight)  
   - If no deviation: gold off; jade basic still applies if basic toggle on

Both toggles independent; gold wins when both apply to different actions… actually: if deviation applies, gold on deviation action; if only basic, jade on basic action.

---

## Roulette

### Rules

- European wheel: single **0** + 1–36
- Standard payouts: straight 35:1, dozen/column 2:1, even-money 1:1
- Chip denominations from bankroll; clear / rebet helpers

### UI

- Neon Void table + spinning wheel/ball animation (CSS or canvas)
- Outside bets prominent; straight number grid
- Result banner + P/L flash

---

## Engine architecture

```
src/casino/
  session/types.ts          # Wallet + stats types
  engine/
    cards.ts                # Rank, suit, value helpers
    shoe.ts                 # 6-deck shoe, shuffle, draw, penetration
    blackjack.ts            # Pure state machine: deal, hit, stand, double, split, surrender, settle
    roulette.ts             # Spin, bet evaluation
    hilo.ts                 # Running count updates, true count
    strategy/basic.ts       # Chart lookup → action
    strategy/illustrious18.ts
  ui/                       # React table components (optional co-locate under components/casino)
```

**Invariants**

- Engines are pure (input state + action → next state); no DOM, no React
- UI may animate between states but must not invent outcomes outside the engine
- Unit tests for shoe size, BJ payouts, split edges, strategy lookups, Illustrious 18 thresholds

---

## Asset notes

- Pokémon sprites: personal/non-commercial fan display; attribute source in Starkizard footer
- Do not hotlink unstable URLs without fallback; vendoring a small set of sprites under `public/sprites/` preferred if license allows redistribution — otherwise runtime load from a documented CDN with offline placeholder

---

## Success criteria

- [ ] Hero never implies personal 2500+ chess rating; title + stack clear
- [ ] Pro hero feels Atelier-dense (not empty)
- [ ] Hangar uses sprite animation; board games gone
- [ ] Casino buy-in 1000 → play BJ + roulette → leave with stats; refresh resets
- [ ] BJ supports double/split/surrender + deal animations + 6D shoe
- [ ] Basic strategy jade highlight + chart; count coach RC/TC + Illustrious 18 gold
- [ ] Engines covered by unit tests for critical paths

## Out of scope / later

- Multi-hand seats, side bets (Perfect Pairs, etc.)
- American roulette
- Persistent bankroll / leaderboards
- Mobile landscape poker-table perfection (must be usable, not AAA)
