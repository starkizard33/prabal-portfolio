/** Shared client ↔ PartyServer protocol for play.starkizard rooms. */

export type Player = {
  id: string;
  name: string;
  joinedAt: number;
  score: number;
  /** Stable browser session id (not shown in UI). */
  clientId?: string;
}

export type RoomPhase =
  | "lobby"
  | "psych_decks"
  | "psych_answer"
  | "psych_vote"
  | "psych_round_result"
  | "psych_final"
  | "ghost_play"
  | "ghost_result"
  | "ghost_final";

export type AnonymousAnswer = {
  answerId: string;
  text: string;
};

export type RoundResultAnswer = {
  answerId: string;
  text: string;
  authorName: string;
  authorId: string;
  votes: number;
  /** Names of players who picked this answer. Present after the vote. */
  voters: string[];
  isYou: boolean;
};

export type RoomState = {
  roomCode: string;
  /** Connection this snapshot was built for. */
  youId: string;
  hostId: string | null;
  /** Stable host browser id — prefer this for host checks on the client. */
  hostClientId: string | null;
  players: Player[];
  phase: RoomPhase;
  /** Spectators (late joiners) — ids only */
  spectatorIds: string[];
  psych: PsychPublicState | null;
  ghost: GhostPublicState | null;
};

export type GhostTapStatus = "idle" | "running" | "done";

export type GhostResultRow = {
  playerId: string;
  name: string;
  errorMs: number;
  /** How long they actually held. Null when they never started. */
  elapsedMs: number | null;
  totalMs: number;
  autoStopped: boolean;
  missed: boolean;
  rank: number;
  isYou: boolean;
};

export type GhostPublicState = {
  round: number;
  totalRounds: number;
  final: boolean;
  targetMs: number;
  targetLabel: string;
  lockedCount: number;
  activeCount: number;
  /** Hidden while the round is open so nobody plays off someone else's miss. */
  results: GhostResultRow[] | null;
  youStatus: GhostTapStatus;
  youElapsedMs: number | null;
  youErrorMs: number | null;
  youAutoStopped: boolean;
};

export const GHOST_TOTAL_ROUNDS = 7;

export type PsychDeckId = "truth-comes-out" | "truth-comes-out-nsfw";

export type PsychPublicState = {
  deckId: PsychDeckId;
  deckTitle: string;
  round: number;
  totalRounds: number;
  question: string | null;
  /** How many active players still need to act this phase */
  waitingFor: number;
  submittedCount: number;
  activePlayerCount: number;
  /** Present in answer phase for you only via personal flags on client */
  answers: AnonymousAnswer[] | null;
  /** Vote phase: shuffled anonymous answers */
  voteOptions: AnonymousAnswer[] | null;
  /** After votes: revealed */
  roundResults: RoundResultAnswer[] | null;
  youSubmitted: boolean;
  youVoted: boolean;
  yourAnswerId: string | null;
};

type WithClient = { clientId?: string };

export type ClientMessage =
  | ({ type: "hello"; name: string } & WithClient)
  | ({ type: "ping" } & WithClient)
  | ({ type: "open_psych" } & WithClient)
  | ({ type: "back_to_lobby" } & WithClient)
  | ({ type: "start_deck"; deckId: PsychDeckId } & WithClient)
  | ({ type: "submit_answer"; text: string } & WithClient)
  | ({ type: "submit_vote"; answerId: string } & WithClient)
  | ({ type: "advance" } & WithClient)
  | ({ type: "open_ghost" } & WithClient)
  | ({ type: "ghost_tap"; elapsedMs?: number } & WithClient)
  | ({ type: "ghost_end" } & WithClient)
  | ({ type: "ghost_again" } & WithClient);

export type ServerMessage =
  | { type: "welcome"; connectionId: string; state: RoomState }
  | { type: "state"; state: RoomState }
  | { type: "error"; message: string }
  | { type: "pong" };

export const PSYCH_TOTAL_ROUNDS = 7;
export const MIN_PLAYERS_TO_START = 2;
export const MAX_PLAYERS = 8;
export const MAX_ANSWER_LEN = 120;
