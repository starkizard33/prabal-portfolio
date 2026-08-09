# Mobile hangar + games pass

**Date:** 2026-08-09  
**Status:** Approved design (Approach A)  
**Goal:** Phone-usable Starkizard games and hangar chrome; remove Table Tennis until a better game replaces it.

## Scope

**In**
- Remove TT (nav, interests, route, component); redirect stub URL
- Race: on-screen Start + hold Gas/Brake on phones; keep keyboard on desktop
- Guess games (Pokémon / Linkin Park): single-column stack, no zoom-on-focus inputs, full-width actions
- Hangar / PlayShell / StarkizardNav: no horizontal overflow on narrow viewports
- Casino light touch: roulette grid scrolls if needed; bet/spin controls reachable

**Out**
- New TT or replacement mini-game
- Tilt / half-screen race schemes
- Full blackjack redesign
- Pro résumé (`/`) redesign
- Friendslop beyond existing WIP card

## Decisions

| Topic | Choice |
|-------|--------|
| Race mobile controls | On-screen **Start**, holdable **Gas** / **Brake** |
| Desktop race | Keyboard primary; buttons hidden from `md` up |
| Pass width | Games + hangar nav/layouts + light casino (not full site) |
| Approach | Targeted (A), not shared control-pad abstraction |

## Design

### 1. Remove Table Tennis

- Remove interest entry `id: "tt"` from `src/data/profile.ts`.
- Delete `src/app/starkizard/play/tt/page.tsx` and `src/components/starkizard/games/TableTennis.tsx`.
- Add permanent redirect `/starkizard/play/tt` → `/starkizard` in `next.config.ts`.
- Update hangar metadata / copy that lists table tennis as a current playable.
- Easter-egg joke triggers for `tt` / `tabletennis` may remain (harmless typing eggs); no product link.

### 2. Race — phone-playable

Files: `CircuitRace.tsx`, `play/race/page.tsx` blurb.

**Behavior**
- Reuse existing key-state (`keys.current.up` / `.down`) and Enter handlers (`beginLights` / reset after finish).
- Below `md`: show control strip under canvas:
  - **Start** — same as Enter when `awaitingEnter` / after finish; disabled while lights/racing unless finished.
  - **Gas** / **Brake** — `pointerdown` / `pointerup` / `pointerleave` / `pointercancel` set throttle keys; `touch-action: none` to avoid scroll-stealing.
- From `md` up: hide Gas/Brake/Start strip; copy mentions keyboard.
- Helper text is dual: phone (“Tap Start · hold Gas/Brake”) vs desktop (“Enter · ▲/▼”).
- Canvas remains `w-full`; fixed internal resolution unchanged.
- Draw mode: label “Tap to add points” on narrow screens (click handlers already work for taps).

### 3. Guess games layout

Files: `GuessPokemon.tsx`, `GuessLinkinPark.tsx`, `GuessLinkinParkAudio.tsx`, `LinkinParkPlay.tsx`.

- Grid: `grid-cols-1` by default; side-by-side scoreboard only from `lg`.
- Primary buttons and text inputs `w-full` on small screens; form stacks vertically.
- Inputs use `text-base` (16px) to prevent iOS focus zoom.
- LP mode tabs: wrap comfortably; larger tap targets (`min-h-11` or equivalent padding).

### 4. Hangar + Play chrome

- `StarkizardNav`: prevent overflow — smaller gaps, wrapping nav, or slightly smaller type under `sm`; brand stays left, links don’t force horizontal scroll.
- `PlayShell`: already mostly fine; ensure padding and title clamp remain readable.
- Race page blurb: remove Enter-only language.
- Hangar hero/copy: drop “rackets” / TT from the one-liner if present.

### 5. Casino (light)

- `RouletteTable`: wrap number grid in `overflow-x-auto` with touch scrolling; chip/spin row stays below and tappable.
- Blackjack: only fix obvious overflow if encountered while touching nav; no action-bar redesign.

## Acceptance

1. No TT card, route 404s redirect to hangar.
2. Phone: can start race and complete a lap with only thumbs (no keyboard).
3. Desktop race unchanged for keyboard users.
4. Pokémon / LP playable in portrait without sideways scroll or auto-zoom on focus.
5. Hangar nav usable at ~375px width.
6. Roulette numbers reachable on ~375px (scroll if needed).

## Non-goals / follow-ups

- Better racket game (future).
- Deeper casino mobile UX (Approach B leftovers).
- Compress hangar GIFs further.

## Spec self-review

- No unresolved placeholders.
- Scope matches Approach A only (no shared MobileControlPad).
- TT removal is product unlink + redirect, not leaving a dead interest card.
- Race dual-input path clear: same state as keys, not a second physics path.
