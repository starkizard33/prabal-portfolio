# Psych · Truth Comes Out — Design

## Goal
Multiplayer party game on `play.starkizard.com`: create/join room → pick Psych → Truth Comes Out deck → 7 anonymous answer+vote rounds.

## Flow
1. Lobby: name + create/join (exists).
2. Room: player list + game panels. Host starts **Psych**.
3. Psych: deck picker (Truth Comes Out live; others “soon”).
4. Per round (×7): question → all submit → anonymous answers → vote (not own) → score → next.
5. Final scoreboard → return to room lobby.

## Scoring
- **+100** per vote your answer receives.
- **+50** round MVP bonus (most votes; ties split the 50).
- Exactly one vote required; cannot vote yourself.
- Fair for 2–8 players; recommend ≥3.

## Edge cases
- Mid-game disconnect: drop from waiting sets; keep submitted answers.
- Late join mid-game: join as spectator until next lobby.
- Host disconnect: promote oldest remaining player.
- Empty / too-long answers rejected.
