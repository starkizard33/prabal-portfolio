# Psych Truth Comes Out Implementation Plan

> **For agentic workers:** Implement task-by-task. User waived approval gates.

**Goal:** Ship create/join lobby → Psych panels → Truth Comes Out 7-round answer/vote game on PartyServer.

**Architecture:** Expand Durable Object `Lobby` with a finite state machine; React room UI reacts to broadcast snapshots.

**Tech Stack:** Next.js 16, PartyServer, partysocket, existing play design tokens.

## Global Constraints
- Min 2 players to start; max 8.
- Anonymous answers until voting ends; never reveal authorship during vote.
- Host-only: start Psych, pick deck, return to lobby after final.

---

### Task 1: Shared protocol + Truth Comes Out prompts
- [ ] `shared/playProtocol.ts` + `party/src/psych/truthComesOut.ts`

### Task 2: PartyServer game state machine
- [ ] Expand `party/src/lobby.ts`; deploy

### Task 3: Room UI game panels + Psych client
- [ ] Rewrite `PlayRoom` + Psych components

### Task 4: Verify in browser (2 tabs)
- [ ] Create/join, full round cycle, vote-own blocked
