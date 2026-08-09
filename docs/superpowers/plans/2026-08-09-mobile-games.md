# Mobile Hangar + Games Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make Starkizard games and hangar chrome phone-usable; remove Table Tennis until a better game replaces it.

**Architecture:** Drive race touch controls through the existing keyboard state object so physics/start logic stay single-path. Layout fixes are Tailwind breakpoint/stacking changes. TT is a product unlink + redirect, not a stub page.

**Tech Stack:** Next.js App Router, React client components, Tailwind CSS v4, existing `CircuitRace` canvas loop.

## Global Constraints

- Scope = Approach A only (no shared `MobileControlPad` abstraction, no blackjack redesign, no `/` résumé pass).
- Race: on-screen Start + hold Gas/Brake below `md`; keyboard remains primary from `md` up.
- Guess inputs: `text-base` (≥16px) to avoid iOS focus zoom.
- Redirect `/starkizard/play/tt` → `/starkizard` (permanent).
- Do not change git config; use existing commit author env if needed.

---

### Task 1: Remove Table Tennis

**Files:**
- Modify: `src/data/profile.ts` (remove `tt` interest)
- Modify: `src/app/starkizard/page.tsx` (metadata + hero copy mentioning rackets/TT)
- Modify: `next.config.ts` (redirect)
- Delete: `src/app/starkizard/play/tt/page.tsx`
- Delete: `src/components/starkizard/games/TableTennis.tsx`
- Optional leave: `src/components/EasterEggs.tsx` / `src/data/dadJokes.ts` egg triggers

**Interfaces:**
- Produces: no `/starkizard/play/tt` page; hangar interests without TT; redirect in Next config

- [ ] **Step 1: Remove TT interest**

In `src/data/profile.ts`, delete the whole object:

```ts
{
  id: "tt",
  name: "Table Tennis",
  blurb: "Spin, timing, and the satisfactions of a clean counter-hit.",
  href: "/starkizard/play/tt",
  cta: "Play vs bot →",
},
```

- [ ] **Step 2: Update hangar copy**

In `src/app/starkizard/page.tsx`:
- metadata description: drop “table tennis”
- hero paragraph: drop “rackets,” (keep music / motorsport / dragons / casino)

- [ ] **Step 3: Redirect + delete TT files**

Add to `next.config.ts` redirects array:

```ts
{
  source: "/starkizard/play/tt",
  destination: "/starkizard",
  permanent: true,
},
```

Delete `src/app/starkizard/play/tt/page.tsx` and `src/components/starkizard/games/TableTennis.tsx`.

- [ ] **Step 4: Verify no imports remain**

Run: `rg -n "TableTennis|/starkizard/play/tt" src next.config.ts`

Expected: only redirect (and optional egg joke strings).

- [ ] **Step 5: Commit**

```bash
git add src/data/profile.ts src/app/starkizard/page.tsx next.config.ts
git add -u src/app/starkizard/play/tt src/components/starkizard/games/TableTennis.tsx
git commit -m "chore(play): remove table tennis until a better game ships"
```

---

### Task 2: Race — on-screen Start / Gas / Brake

**Files:**
- Modify: `src/components/starkizard/games/CircuitRace.tsx`
- Modify: `src/app/starkizard/play/race/page.tsx`

**Interfaces:**
- Consumes: existing `keys.current`, `beginLights`, stage machine (`awaiting` / `lights` / `racing` / `finished`), `hud.awaitingEnter`
- Produces: mobile control strip binding to the same state; dual helper copy

- [ ] **Step 1: Expose imperative start from the effect**

The RAF / key listeners live inside an effect. Lift start/reset into refs so React buttons can call them, OR attach button handlers inside the same effect via DOM refs. Prefer refs held on the component:

```ts
const controlsRef = useRef<{
  startOrRestart: () => void;
  setThrottle: (up: boolean, down: boolean) => void;
} | null>(null);
```

Inside the effect, assign:

```ts
controlsRef.current = {
  startOrRestart: () => {
    if (stage === "awaiting") beginLights();
    else if (stage === "finished") {
      stage = "awaiting";
      resetOnGrid();
      // same setHud as Enter-on-finish path
    }
  },
  setThrottle: (up, down) => {
    keys.current.up = up;
    keys.current.down = down;
  },
};
```

Keep the Enter keyboard path calling the same `beginLights` / finished-reset logic (no duplicated physics).

- [ ] **Step 2: Add mobile control strip under the race canvas**

In the race UI return (not select/draw), after the canvas:

```tsx
<div className="grid grid-cols-3 gap-2 md:hidden select-none">
  <button
    type="button"
    className="min-h-14 rounded-2xl border border-sz-mist/25 bg-sz-void/90 text-sm font-semibold"
    onPointerDown={(e) => {
      e.preventDefault();
      controlsRef.current?.setThrottle(false, true);
    }}
    onPointerUp={(e) => {
      e.preventDefault();
      controlsRef.current?.setThrottle(false, false);
    }}
    onPointerLeave={() => controlsRef.current?.setThrottle(false, false)}
    onPointerCancel={() => controlsRef.current?.setThrottle(false, false)}
    style={{ touchAction: "none" }}
  >
    Brake
  </button>
  <button
    type="button"
    disabled={!hud.awaitingEnter && !hud.finished}
    className="min-h-14 rounded-2xl bg-sz-ember text-sm font-semibold text-sz-void disabled:opacity-40"
    onClick={() => controlsRef.current?.startOrRestart()}
  >
    Start
  </button>
  <button
    type="button"
    className="min-h-14 rounded-2xl border border-sz-jade/40 bg-sz-jade/15 text-sm font-semibold text-sz-jade"
    onPointerDown={(e) => {
      e.preventDefault();
      controlsRef.current?.setThrottle(true, false);
    }}
    onPointerUp={(e) => {
      e.preventDefault();
      controlsRef.current?.setThrottle(false, false);
    }}
    onPointerLeave={() => controlsRef.current?.setThrottle(false, false)}
    onPointerCancel={() => controlsRef.current?.setThrottle(false, false)}
    style={{ touchAction: "none" }}
  >
    Gas
  </button>
</div>
```

Adjust `disabled` so Start is enabled whenever Enter would work (`awaiting` or `finished`). If `hud` does not expose `finished` separately, use `hud.awaitingEnter || hud.finished` consistently with existing fields (`finished` already exists on hud).

- [ ] **Step 3: Dual helper text + page blurb**

Replace Enter-only footer with:

```tsx
<p className="text-xs text-sz-mist/40 md:hidden">
  {hud.awaitingEnter
    ? "Tap Start for lights (timer begins on lights out)."
    : "Hold Gas / Brake · 3 laps · walls dump speed."}
</p>
<p className="hidden text-xs text-sz-mist/40 md:block">
  {hud.awaitingEnter
    ? "Screen dims · Press Enter for the five-light start."
    : "3 laps · ▲/W gas · ▼/S brake · wall hits dump speed."}
</p>
```

Update `src/app/starkizard/play/race/page.tsx` blurb to mention Start on phone / Enter on desktop.

- [ ] **Step 4: Draw-mode label**

Change draw help copy to: `Tap or click to add points · undo / clear · close & race`.

- [ ] **Step 5: Manual smoke + commit**

Run: `npm run build`  
Expected: success.

```bash
git add src/components/starkizard/games/CircuitRace.tsx src/app/starkizard/play/race/page.tsx
git commit -m "feat(race): on-screen Start/Gas/Brake for phones"
```

---

### Task 3: Guess games — stack + no iOS zoom

**Files:**
- Modify: `src/components/starkizard/games/GuessPokemon.tsx`
- Modify: `src/components/starkizard/games/GuessLinkinPark.tsx`
- Modify: `src/components/starkizard/games/GuessLinkinParkAudio.tsx`
- Modify: `src/components/starkizard/games/LinkinParkPlay.tsx`

**Interfaces:**
- Produces: single-column on narrow; full-width actions; `text-base` inputs

- [ ] **Step 1: Pokémon grid**

Change outer grid from `lg:grid-cols-[1.2fr_0.8fr]` pattern to stay `grid-cols-1` until `lg`. Ensure form is `flex-col` on small screens and buttons are `w-full sm:w-auto` (or always full width under `sm`).

Input class must include `text-base`.

- [ ] **Step 2: Linkin Park lyrics + audio**

Same stacking / `text-base` / full-width primary buttons.

- [ ] **Step 3: Mode tabs**

In `LinkinParkPlay.tsx`, make the tablist `w-full` on small screens with `min-h-11` buttons and wrapping.

- [ ] **Step 4: Commit**

```bash
git add src/components/starkizard/games/GuessPokemon.tsx \
  src/components/starkizard/games/GuessLinkinPark.tsx \
  src/components/starkizard/games/GuessLinkinParkAudio.tsx \
  src/components/starkizard/games/LinkinParkPlay.tsx
git commit -m "fix(play): stack guess UIs and avoid iOS input zoom"
```

---

### Task 4: Hangar nav + roulette light touch

**Files:**
- Modify: `src/components/starkizard/StarkizardNav.tsx`
- Modify: `src/components/casino/roulette/RouletteTable.tsx`

**Interfaces:**
- Produces: ~375px nav without horizontal page scroll; roulette grid scrollable

- [ ] **Step 1: Nav wrap**

```tsx
<nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
  ...
  <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-sz-mist/70 sm:gap-x-5">
```

Keep brand left; allow links to wrap under it on very narrow widths.

- [ ] **Step 2: Roulette overflow**

Wrap the number grid container with `overflow-x-auto overscroll-x-contain [-webkit-overflow-scrolling:touch]` and `min-w-0`. Ensure chip/spin controls remain outside the scroll region below (already stacked).

- [ ] **Step 3: Build + commit**

Run: `npm run build`  
Expected: success.

```bash
git add src/components/starkizard/StarkizardNav.tsx src/components/casino/roulette/RouletteTable.tsx
git commit -m "fix(hangar): mobile nav wrap and roulette horizontal scroll"
```

---

### Task 5: Acceptance checklist

- [ ] **Step 1: Automated**

Run: `npm run build`  
Expected: exit 0.

Run: `npm test`  
Expected: existing scoring tests still pass.

- [ ] **Step 2: Manual (~375px)**

1. Hangar: no TT card; nav usable.
2. Race: Start → lights → Gas/Brake complete at least one lap without keyboard.
3. Desktop race: Enter + ▲/▼ still work; mobile strip hidden at `md+`.
4. Pokémon / LP: single column; focusing input does not zoom page on iOS Safari if available.
5. Visit `/starkizard/play/tt` → lands on hangar.
6. Roulette: numbers reachable via horizontal scroll if needed.

- [ ] **Step 3: Commit spec if not already**

```bash
git add docs/superpowers/specs/2026-08-09-mobile-games-design.md \
  docs/superpowers/plans/2026-08-09-mobile-games.md
git commit -m "docs: mobile games design and implementation plan"
```

---

## Spec coverage (self-review)

| Spec section | Task |
|--------------|------|
| Remove TT | Task 1 |
| Race touch Start/Gas/Brake + keyboard desktop | Task 2 |
| Guess stack / text-base | Task 3 |
| Hangar nav | Task 4 |
| Roulette light | Task 4 |
| Acceptance | Task 5 |

No shared control-pad (YAGNI). No blackjack redesign.
