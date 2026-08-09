# Site Revamp + Starkizard Casino Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Revamp the professional portfolio (Blueprint Atelier hero + accurate copy) and rebuild Starkizard into a Neon Void hangar with a session-based Zard Casino featuring full Blackjack helpers and European Roulette.

**Architecture:** Pure TypeScript casino engines under `src/casino/engine/` (shoe, blackjack, roulette, Hi-Lo, basic strategy, Illustrious 18) tested with Vitest; React client UI under `src/components/` consumes engines via a memory-only `CasinoSessionProvider`. Portfolio pages restyled independently of casino logic.

**Tech Stack:** Next.js 16 App Router, React 19, TypeScript, Tailwind CSS 4, Vitest

## Global Constraints

- Hero title/copy: **SDE II at Zeta**; stack plaque **Java · Spring Boot · Microservices · Kafka · AWS**; never imply personal 2500+ chess rating (engine-only for BetaZero).
- Pro visual: **Blueprint Atelier**; hangar/casino visual: **Neon Void**.
- Wallet: **session-only 1000 Zard** buy-in; no localStorage; leave anytime with session stats.
- Blackjack: **6-deck**, **S17**, DAS, late surrender, BJ **3:2**, split up to **3 hands**, dealer peek on Ace/10.
- Helpers: basic strategy highlight **jade**; Hi-Lo + **Illustrious 18** deviation highlight **gold**.
- Roulette: European **single zero**.
- Remove board games route/content.
- Prefer vendored sprites under `public/sprites/` with attribution footer; otherwise documented CDN + fallback.
- Git commits: only if `user.name` / `user.email` are configured (do **not** run `git config`); if commit fails on identity, leave changes staged and continue.
- Follow TDD for engine tasks: failing test → implement → pass.
- Frontend design rules from user: no purple-default AI look; no cream+terracotta; cards only where interactive; hangar hero sprite dominant; motions intentional (2–3).

## File map

| Path | Responsibility |
|------|----------------|
| `vitest.config.ts` | Test runner config |
| `src/casino/engine/cards.ts` | Card types, values, deck builders |
| `src/casino/engine/shoe.ts` | 6-deck shoe shuffle/draw/penetration |
| `src/casino/engine/blackjack.ts` | Pure BJ state machine |
| `src/casino/engine/roulette.ts` | Spin + bet settle |
| `src/casino/engine/hilo.ts` | Running/true count |
| `src/casino/engine/strategy/basic.ts` | S17 DAS LS chart lookup |
| `src/casino/engine/strategy/illustrious18.ts` | Deviation table + lookup |
| `src/casino/session/CasinoSessionContext.tsx` | Buy-in wallet + stats |
| `src/casino/engine/*.test.ts` | Engine unit tests |
| `src/data/profile.ts` | Copy fixes |
| `src/app/globals.css` | Atelier + Neon Void tokens/animations |
| `src/components/Hero.tsx` + pro sections | Portfolio UI |
| `src/app/starkizard/*` | Hangar + casino routes |
| `src/components/starkizard/*` → `src/components/casino/*` | Hangar/casino UI |
| `public/sprites/*` | Charizard / Rayquaza assets |
| Delete `src/app/starkizard/games/*`, old weak BJ/Rayquaza as replaced |

---

### Task 1: Vitest setup

**Files:**
- Create: `vitest.config.ts`
- Modify: `package.json`
- Create: `src/casino/engine/smoke.test.ts`

**Interfaces:**
- Produces: `npm test` runs Vitest

- [ ] **Step 1: Install Vitest**

```bash
npm install -D vitest
```

- [ ] **Step 2: Add config and script**

`vitest.config.ts`:

```ts
import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    environment: "node",
    include: ["src/**/*.test.ts"],
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
```

In `package.json` scripts add: `"test": "vitest run", "test:watch": "vitest"`.

- [ ] **Step 3: Smoke test**

```ts
import { expect, test } from "vitest";

test("vitest runs", () => {
  expect(1 + 1).toBe(2);
});
```

- [ ] **Step 4: Run tests**

Run: `npm test`  
Expected: PASS (1 test)

- [ ] **Step 5: Commit** (if git identity configured)

```bash
git add vitest.config.ts package.json package-lock.json src/casino/engine/smoke.test.ts
git commit -m "chore: add vitest for casino engine tests"
```

---

### Task 2: Cards + 6-deck shoe (TDD)

**Files:**
- Create: `src/casino/engine/cards.ts`
- Create: `src/casino/engine/shoe.ts`
- Create: `src/casino/engine/shoe.test.ts`
- Delete: `src/casino/engine/smoke.test.ts` (optional after shoe tests exist)

**Interfaces:**
- Produces:
  - `type Suit = "S" | "H" | "D" | "C"`
  - `type Rank = "A"|"2"|"3"|"4"|"5"|"6"|"7"|"8"|"9"|"10"|"J"|"Q"|"K"`
  - `type Card = { suit: Suit; rank: Rank; id: string }`
  - `function blackjackValue(rank: Rank): number`
  - `function createShoe(decks?: number, rng?: () => number): Card[]`
  - `type Shoe = { cards: Card[]; discard: Card[]; initialCount: number }`
  - `function draw(shoe: Shoe, n: number): { cards: Card[]; shoe: Shoe }`
  - `function cardsRemaining(shoe: Shoe): number`
  - `function needsShuffle(shoe: Shoe, cutRemaining?: number): boolean` // default cutRemaining=75
  - `function reshuffle(shoe: Shoe, rng?: () => number): Shoe`

- [ ] **Step 1: Write failing tests**

```ts
import { describe, expect, test } from "vitest";
import { createShoe, draw, needsShuffle, cardsRemaining } from "./shoe";

describe("shoe", () => {
  test("6-deck shoe has 312 cards", () => {
    const shoe = createShoe(6, () => 0.5);
    expect(shoe.cards.length).toBe(312);
  });

  test("draw reduces remaining", () => {
    let shoe = createShoe(6, () => 0.1);
    const r = draw(shoe, 2);
    expect(r.cards).toHaveLength(2);
    expect(cardsRemaining(r.shoe)).toBe(310);
  });

  test("needsShuffle at penetration", () => {
    let shoe = createShoe(1, () => 0.2); // 52 cards
    const r = draw(shoe, 40);
    expect(needsShuffle(r.shoe, 15)).toBe(true);
  });
});
```

- [ ] **Step 2: Run tests — expect FAIL**

Run: `npm test -- src/casino/engine/shoe.test.ts`  
Expected: FAIL module not found / exports missing

- [ ] **Step 3: Implement `cards.ts` and `shoe.ts`**

`cards.ts`: ranks/suits, `buildSingleDeck()`, `blackjackValue` (A→11 for raw rank helper; hand totals stay in blackjack.ts).

`shoe.ts`: concatenate `decks` decks with unique `id`s, Fisher–Yates using `rng`, `draw` from front, `needsShuffle` when `cards.length <= cutRemaining`, `reshuffle` combines cards+discard, shuffles, clears discard.

- [ ] **Step 4: Run tests — expect PASS**

Run: `npm test -- src/casino/engine/shoe.test.ts`  
Expected: PASS

- [ ] **Step 5: Commit**

```bash
git add src/casino/engine/cards.ts src/casino/engine/shoe.ts src/casino/engine/shoe.test.ts
git commit -m "feat(casino): add 6-deck shoe engine"
```

---

### Task 3: Blackjack engine (TDD)

**Files:**
- Create: `src/casino/engine/blackjack.ts`
- Create: `src/casino/engine/blackjack.test.ts`

**Interfaces:**
- Produces:
  - `type BjAction = "hit" | "stand" | "double" | "split" | "surrender" | "insurance" | "deal"`
  - `type Hand = { cards: Card[]; bet: number; stood: boolean; doubled: boolean; surrendered: boolean; fromSplitAces: boolean }`
  - `type BjPhase = "betting" | "insurance" | "player" | "dealer" | "settled"`
  - `type BjState = { shoe: Shoe; playerHands: Hand[]; activeHand: number; dealer: Card[]; holeRevealed: boolean; phase: BjPhase; baseBet: number; insuranceBet: number; message: string }`
  - `function handTotal(cards: Card[]): { total: number; soft: boolean }`
  - `function isBlackjack(cards: Card[]): boolean`
  - `function createBjRound(shoe: Shoe, bet: number): BjState` // deals 2+2, handles dealer peek/BJ settle
  - `function applyAction(state: BjState, action: Exclude<BjAction,"deal">): BjState`
  - Settlements: BJ 3:2, surrender returns half bet, double uses 2× bet, dealer S17

- [ ] **Step 1: Write failing tests** (minimum set)

```ts
import { describe, expect, test } from "vitest";
import { createShoe } from "./shoe";
import { applyAction, createBjRound, handTotal, isBlackjack } from "./blackjack";
import type { Card } from "./cards";

const c = (rank: Card["rank"], suit: Card["suit"] = "S"): Card => ({
  rank, suit, id: `${rank}${suit}`,
});

describe("blackjack", () => {
  test("handTotal soft ace", () => {
    expect(handTotal([c("A"), c("6")])).toEqual({ total: 17, soft: true });
  });

  test("detects blackjack", () => {
    expect(isBlackjack([c("A"), c("K")])).toBe(true);
  });

  test("player blackjack pays 3:2 when dealer has none", () => {
    // Build shoe that deals: P A, D 9, P K, D 5
    const cards = [c("A"), c("9"), c("K"), c("5"), ...createShoe(1).cards];
    const shoe = { cards, discard: [], initialCount: cards.length };
    const state = createBjRound(shoe, 100);
    expect(state.phase).toBe("settled");
    // bankroll settlement is owned by session; engine should expose payout delta
    expect(state.message.toLowerCase()).toMatch(/blackjack/);
  });

  test("surrender marks half loss", () => {
    const cards = [c("10"), c("9"), c("6"), c("8"), ...createShoe(1).cards];
    const shoe = { cards, discard: [], initialCount: cards.length };
    let s = createBjRound(shoe, 50);
    s = applyAction(s, "surrender");
    expect(s.playerHands[0].surrendered).toBe(true);
    expect(s.phase).toBe("settled");
  });
});
```

Also add tests: double doubles bet and draws one; split pairs creates two hands; dealer stands on soft 17 (A+6).

- [ ] **Step 2: Run — FAIL**

Run: `npm test -- src/casino/engine/blackjack.test.ts`

- [ ] **Step 3: Implement state machine**

Rules from spec: S17, peek on Ace/10, late surrender, DAS, split to 3 hands, split Aces one card each, BJ 3:2. Export `settlePayouts(state): number` net chip delta for the round (positive = player win).

- [ ] **Step 4: Run — PASS**

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(casino): blackjack state machine with S17 DAS LS"
```

---

### Task 4: Hi-Lo, basic strategy, Illustrious 18 (TDD)

**Files:**
- Create: `src/casino/engine/hilo.ts`
- Create: `src/casino/engine/strategy/basic.ts`
- Create: `src/casino/engine/strategy/illustrious18.ts`
- Create: `src/casino/engine/strategy/strategy.test.ts`
- Create: `src/casino/engine/hilo.test.ts`

**Interfaces:**
- Produces:
  - `function hiLoDelta(rank: Rank): number` // 2-6:+1, 7-9:0, T-A:-1
  - `function trueCount(running: number, cardsRemaining: number): number`
  - `type StrategyAction = "H" | "S" | "D" | "P" | "R"` // hit stand double split surrender (double→hit if not allowed handled by caller)
  - `function basicStrategy(input: { playerTotal: number; soft: boolean; pairRank?: Rank; dealerUp: Rank; canDouble: boolean; canSplit: boolean; canSurrender: boolean }): StrategyAction`
  - `function illustriousDeviation(input: { ...same; trueCount: number }): StrategyAction | null` // null = no deviation

Encode multi-deck **S17 + DAS + late surrender** charts as nested records (hard/soft/pairs). Encode Illustrious 18 thresholds (standard published list: e.g. insurance TC≥3, 16v10 stand TC≥0, 15v10 surrender TC≥0, etc.). Footnote sources in UI later.

- [ ] **Step 1: Failing tests**

```ts
test("hi-lo delta for ten is -1", () => {
  expect(hiLoDelta("K")).toBe(-1);
});

test("basic: 16 vs 10 hits when cannot surrender preference encoded as H or R", () => {
  const a = basicStrategy({
    playerTotal: 16, soft: false, dealerUp: "10",
    canDouble: false, canSplit: false, canSurrender: true,
  });
  expect(["H", "R"]).toContain(a);
});

test("illustrious: 16 vs 10 stands at TC >= 0", () => {
  const d = illustriousDeviation({
    playerTotal: 16, soft: false, dealerUp: "10",
    canDouble: false, canSplit: false, canSurrender: false,
    trueCount: 0,
  });
  expect(d).toBe("S");
});
```

Fill ≥8 assertions covering pair split (11s), soft double, and one insurance deviation helper `shouldTakeInsurance(tc)`.

- [ ] **Step 2–4:** FAIL → implement charts → PASS

- [ ] **Step 5: Commit**

```bash
git commit -am "feat(casino): hi-lo counts and basic/I18 strategy tables"
```

---

### Task 5: Roulette engine (TDD)

**Files:**
- Create: `src/casino/engine/roulette.ts`
- Create: `src/casino/engine/roulette.test.ts`

**Interfaces:**
- Produces:
  - `type RouletteBetKind = "straight" | "red" | "black" | "odd" | "even" | "low" | "high" | "dozen" | "column"`
  - `type RouletteBet = { kind: RouletteBetKind; value?: number; amount: number }` // value = number 0-36, dozen 1-3, column 1-3
  - `function spinEuropean(rng?: () => number): number` // 0–36
  - `function settleRoulette(bets: RouletteBet[], result: number): { payout: number; net: number }`
  - Color map + dozen/column helpers

- [ ] **Step 1:** Tests for red/black, straight 35:1, zero loses even-money
- [ ] **Step 2–4:** FAIL → implement → PASS
- [ ] **Step 5: Commit** `feat(casino): european roulette engine`

---

### Task 6: Casino session context

**Files:**
- Create: `src/casino/session/CasinoSessionContext.tsx`
- Create: `src/app/starkizard/casino/layout.tsx`

**Interfaces:**
- Produces React context:
  - `enterCasino(): void` // sets bankroll=1000, resets stats, startedAt=Date.now()
  - `leaveCasino(): SessionSummary`
  - `adjustBankroll(delta: number): void`
  - `recordHand()` / `recordSpin()`
  - `state: { active: boolean; bankroll: number; startBankroll: number; hands: number; spins: number; startedAt: number | null }`

No localStorage. Provider wraps `casino/layout.tsx` only.

- [ ] **Step 1: Implement provider + layout**
- [ ] **Step 2: Manual check** — temporary log buttons optional; verified in Task 8 UI
- [ ] **Step 3: Commit** `feat(casino): session wallet context with 1000 Zard buy-in`

---

### Task 7: Professional site — Blueprint Atelier + copy

**Files:**
- Modify: `src/data/profile.ts` (tagline, BetaZero wording)
- Modify: `src/app/globals.css` (atelier tokens, grid background, motions)
- Modify: `src/components/Hero.tsx`
- Modify: `src/components/Projects.tsx` (engine credit)
- Modify: other pro sections only as needed for density (spacing, borders)
- Modify: `src/app/layout.tsx` metadata if needed

**Copy requirements:**
- Tagline: technical, no personal chess claim
- Hero eyebrow: `SDE II at Zeta`
- Stack plaque exact: `Java · Spring Boot · Microservices · Kafka · AWS`

- [ ] **Step 1: Update `profile.ts` tagline + project descriptions**
- [ ] **Step 2: Rebuild Hero for Atelier** — full-viewport composition, blueprint grid, frosted stack plaque, rise animations
- [ ] **Step 3: Tighten Experience/Projects visual density** (stronger borders, display headings)
- [ ] **Step 4: Visual check** `npm run dev` → `/` looks premium, not empty
- [ ] **Step 5: Commit** `feat(site): blueprint atelier hero and accurate copy`

---

### Task 8: Hangar Neon Void + sprites; remove board games

**Files:**
- Delete: `src/app/starkizard/games/page.tsx` (and folder)
- Delete or replace: `src/components/starkizard/MegaRayquaza.tsx`
- Create: `src/components/starkizard/SpriteStage.tsx`
- Add: `public/sprites/charizard.gif` and `public/sprites/rayquaza.gif` (download public Showdown-style animated sprites or equivalent; if download blocked, use documented CDN URLs in `SpriteStage` with `<img>` + local PNG fallback)
- Modify: `src/app/starkizard/page.tsx`
- Modify: `src/components/starkizard/StarkizardNav.tsx`
- Modify: `src/data/profile.ts` interests (drop boardgames; add casino)
- Modify: `src/app/globals.css` (`.sz-atmosphere` neon void boost)

- [ ] **Step 1: Remove games route + nav links**
- [ ] **Step 2: Add sprites to `public/sprites/` + `SpriteStage` with float/glow CSS**
- [ ] **Step 3: Rebuild hangar page** — Neon Void, sprites dominant, interests, CTA Enter Casino
- [ ] **Step 4: Footer attribution** for sprite source
- [ ] **Step 5: Commit** `feat(starkizard): neon void hangar with sprites; remove board games`

---

### Task 9: Casino lobby UI

**Files:**
- Create: `src/app/starkizard/casino/page.tsx`
- Create: `src/components/casino/SessionHud.tsx`
- Create: `src/components/casino/BuyInGate.tsx`
- Create: `src/components/casino/LeaveSummary.tsx`

- [ ] **Step 1: Buy-in gate** — if `!active`, show enter → `enterCasino()`
- [ ] **Step 2: Lobby** — HUD + links to `/blackjack` and `/roulette` + Leave flow showing summary then `leaveCasino()` → `/starkizard`
- [ ] **Step 3: Manual test buy-in / leave**
- [ ] **Step 4: Commit** `feat(casino): lobby buy-in and session HUD`

---

### Task 10: Blackjack table UI (playmat, animations, helpers)

**Files:**
- Replace: `src/app/starkizard/blackjack/page.tsx` → redirect or delete; use `src/app/starkizard/casino/blackjack/page.tsx`
- Delete old: `src/components/starkizard/BlackjackTable.tsx` after migration
- Create: `src/components/casino/blackjack/BlackjackTable.tsx`
- Create: `src/components/casino/blackjack/Playmat.tsx`
- Create: `src/components/casino/blackjack/CardView.tsx` (deal animation)
- Create: `src/components/casino/blackjack/StrategyPanel.tsx`
- Create: `src/components/casino/blackjack/CountPanel.tsx`

Behavior:
- Bet from bankroll → `createBjRound` → animate cards
- Actions call `applyAction`; on settle `adjustBankroll(settlePayouts(state))` + `recordHand()`
- Shoe persists in React state for the casino session (module-level or context); reshuffle via `needsShuffle`
- Toggles: Basic strategy (chart + jade highlight); Count coach (RC/TC + gold I18)
- Footnote under charts citing public strategy sources

CSS: `@keyframes deal-in` translate from shoe; stagger delay per card index.

- [ ] **Step 1: Build playmat + CardView animations**
- [ ] **Step 2: Wire engine actions including double/split/surrender**
- [ ] **Step 3: Strategy + count toggles with jade/gold highlights**
- [ ] **Step 4: Manual playthrough** — split, double, helper highlights
- [ ] **Step 5: Commit** `feat(casino): animated blackjack table with strategy coaches`

---

### Task 11: Roulette UI

**Files:**
- Create: `src/app/starkizard/casino/roulette/page.tsx`
- Create: `src/components/casino/roulette/RouletteTable.tsx`
- Create: `src/components/casino/roulette/Wheel.tsx`

- [ ] **Step 1: Betting grid + chip selector**
- [ ] **Step 2: Wheel spin animation then `spinEuropean` + `settleRoulette` + bankroll**
- [ ] **Step 3: Manual test**
- [ ] **Step 4: Commit** `feat(casino): european roulette table`

---

### Task 12: Integration polish + verification

**Files:**
- Modify: redirects from old `/starkizard/blackjack` → `/starkizard/casino/blackjack`
- Modify: `README.md` routes
- Modify: SiteNav / footer links

- [ ] **Step 1: Add redirects in `next.config.ts` or old page `redirect()`**
- [ ] **Step 2: Run `npm test` — all engine tests PASS**
- [ ] **Step 3: Run `npm run build` — PASS**
- [ ] **Step 4: Smoke checklist in browser**
  - `/` hero copy + Atelier look
  - `/starkizard` sprites, no board games
  - Casino buy-in 1000 → BJ → roulette → leave stats → refresh resets
  - Helpers jade/gold
- [ ] **Step 5: Commit** `chore: finalize revamp routes and docs`

---

## Spec coverage check

| Spec requirement | Task |
|------------------|------|
| Hero SDE II + stack, no personal 2500+ | 7 |
| Blueprint Atelier | 7 |
| Neon Void hangar + sprites | 8 |
| Remove board games | 8 |
| Session 1000 Zard, leave stats, no persistence | 6, 9 |
| BJ 6D S17 DAS LS 3:2 split/double/surrender + animations | 2, 3, 10 |
| Basic strategy jade + chart | 4, 10 |
| Hi-Lo + I18 gold | 4, 10 |
| European roulette | 5, 11 |
| Modular engines + tests | 1–5 |
| Build verification | 12 |

## Placeholder / consistency self-review

- No TBDs left; S17 consistent across Tasks 3–4 and 10.
- `settlePayouts` / `adjustBankroll` naming aligned Tasks 3 & 10.
- Old blackjack path redirected in Task 12.
