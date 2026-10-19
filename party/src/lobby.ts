import type { Connection, ConnectionContext } from "partyserver";
import { Server } from "partyserver";
import {
  MAX_ANSWER_LEN,
  MAX_PLAYERS,
  MIN_PLAYERS_TO_START,
  PSYCH_TOTAL_ROUNDS,
  type ClientMessage,
  type Player,
  type PsychDeckId,
  type PsychPublicState,
  type RoomPhase,
  type RoomState,
  type ServerMessage,
} from "../../shared/playProtocol";
import { pickDeckPrompts, resolveDeck } from "./psych/decks";
import { fillPrompt, type PromptTemplate } from "./psych/truthComesOut";

type InternalAnswer = {
  answerId: string;
  authorId: string;
  text: string;
};

type PsychInternal = {
  deckId: PsychDeckId;
  deckTitle: string;
  prompts: PromptTemplate[];
  roundIndex: number;
  question: string;
  answers: Map<string, InternalAnswer>;
  votes: Map<string, string>;
  /** Active player connection ids for this match */
  activeIds: Set<string>;
};

function parseMessage(raw: string | ArrayBuffer): ClientMessage | null {
  if (typeof raw !== "string") return null;
  try {
    const data = JSON.parse(raw) as ClientMessage;
    if (!data || typeof data !== "object" || !("type" in data)) return null;
    return data;
  } catch {
    return null;
  }
}

function shuffleInPlace<T>(items: T[], salt: number): T[] {
  let s = salt || 1;
  for (let i = items.length - 1; i > 0; i -= 1) {
    s = (s * 48271) % 2147483647;
    const j = s % (i + 1);
    [items[i], items[j]] = [items[j]!, items[i]!];
  }
  return items;
}

function newAnswerId(): string {
  return crypto.randomUUID().slice(0, 8);
}

export class Lobby extends Server {
  // Keep lobby state in memory while sockets are connected. Hibernation was
  // wiping seats and making host actions fail against a stale client UI.
  static options = { hibernate: false };

  /** keyed by current connection id */
  players = new Map<string, Player>();
  clientToConn = new Map<string, string>();
  hostClientId: string | null = null;
  phase: RoomPhase = "lobby";
  spectatorIds = new Set<string>();
  psych: PsychInternal | null = null;
  orphanTimers = new Map<string, ReturnType<typeof setTimeout>>();

  private get hostId(): string | null {
    if (!this.hostClientId) return null;
    return this.clientToConn.get(this.hostClientId) ?? null;
  }

  async onStart() {
    const saved = await this.ctx.storage.get<{
      hostClientId: string | null;
      phase: RoomPhase;
      players: Player[];
    }>("lobby");
    if (saved) {
      this.hostClientId = saved.hostClientId;
      this.phase = saved.phase === "lobby" || saved.phase === "psych_decks"
        ? saved.phase
        : "lobby";
      // Seats are re-bound on hello; keep scoreboard names only for lobby.
      if (this.phase === "lobby" || this.phase === "psych_decks") {
        this.psych = null;
      }
    }
  }

  private async persistLobby() {
    await this.ctx.storage.put("lobby", {
      hostClientId: this.hostClientId,
      phase: this.phase,
      players: [...this.players.values()],
    });
  }

  onConnect(connection: Connection, _ctx: ConnectionContext) {
    this.send(connection, {
      type: "welcome",
      connectionId: connection.id,
      state: this.snapshotFor(connection.id),
    });
  }

  onMessage(connection: Connection, message: string | ArrayBuffer) {
    const msg = parseMessage(message);
    if (!msg) {
      this.sendError(connection, "Invalid message");
      return;
    }

    switch (msg.type) {
      case "ping":
        this.send(connection, { type: "pong" });
        return;
      case "hello":
        this.handleHello(connection, msg.name, msg.clientId);
        return;
      case "open_psych":
        this.handleOpenPsych(connection, msg.clientId);
        return;
      case "back_to_lobby":
        this.handleBackToLobby(connection, msg.clientId);
        return;
      case "start_deck":
        this.handleStartDeck(connection, msg.deckId, msg.clientId);
        return;
      case "submit_answer":
        this.bindClient(connection, msg.clientId);
        this.handleSubmitAnswer(connection, msg.text);
        return;
      case "submit_vote":
        this.bindClient(connection, msg.clientId);
        this.handleSubmitVote(connection, msg.answerId);
        return;
      case "advance":
        this.handleAdvance(connection, msg.clientId);
        return;
      default:
        this.sendError(connection, "Unknown message type");
    }
  }

  onClose(connection: Connection) {
    const id = connection.id;
    this.spectatorIds.delete(id);
    const player = this.players.get(id);
    if (!player?.clientId) {
      this.players.delete(id);
      this.broadcastAll();
      return;
    }

    const clientId = player.clientId;
    if (this.clientToConn.get(clientId) === id) {
      this.clientToConn.delete(clientId);
    }

    const existing = this.orphanTimers.get(clientId);
    if (existing) clearTimeout(existing);

    const timer = setTimeout(() => {
      this.orphanTimers.delete(clientId);
      if (this.clientToConn.has(clientId)) return; // reclaimed

      // Find seat still keyed by old conn (or any seat with this clientId)
      for (const [pid, p] of this.players) {
        if (p.clientId === clientId || pid === id) {
          this.players.delete(pid);
          if (this.psych?.activeIds.has(pid)) {
            this.psych.activeIds.delete(pid);
            this.maybeProgressAfterDisconnect();
          }
        }
      }

      if (this.hostClientId === clientId) {
        this.pickNewHost();
      }
      this.broadcastAll();
    }, 1600);

    this.orphanTimers.set(clientId, timer);
    this.broadcastAll();
  }

  private pickNewHost() {
    const remaining = [...this.players.values()].sort(
      (a, b) => a.joinedAt - b.joinedAt,
    );
    this.hostClientId = remaining[0]?.clientId ?? null;
  }

  private handleHello(
    connection: Connection,
    rawName: string,
    clientIdRaw?: string,
  ) {
    const name = sanitizeName(rawName);
    if (!name) {
      this.sendError(connection, "Enter a display name (2–16 characters).");
      return;
    }

    const clientId =
      typeof clientIdRaw === "string" && clientIdRaw.trim().length >= 8
        ? clientIdRaw.trim().slice(0, 64)
        : `anon-${connection.id}`;

    const orphan = this.orphanTimers.get(clientId);
    if (orphan) {
      clearTimeout(orphan);
      this.orphanTimers.delete(clientId);
    }

    // Reclaim seat after reconnect (Strict Mode remount).
    let prevConn: string | null = null;
    for (const [pid, p] of this.players) {
      if (p.clientId === clientId) {
        prevConn = pid;
        break;
      }
    }

    if (prevConn && prevConn !== connection.id) {
      const seat = this.players.get(prevConn)!;
      this.players.delete(prevConn);
      seat.id = connection.id;
      seat.name = name;
      seat.clientId = clientId;
      this.players.set(connection.id, seat);
      this.clientToConn.set(clientId, connection.id);
      this.remapPsychIds(prevConn, connection.id);
      this.broadcastAll();
      return;
    }

    if (this.players.has(connection.id)) {
      const seat = this.players.get(connection.id)!;
      seat.name = name;
      seat.clientId = clientId;
      this.clientToConn.set(clientId, connection.id);
      this.broadcastAll();
      return;
    }

    const midGame = this.phase !== "lobby" && this.phase !== "psych_decks";
    if (midGame) {
      this.spectatorIds.add(connection.id);
      this.broadcastAll();
      return;
    }

    if (this.players.size >= MAX_PLAYERS) {
      this.sendError(connection, `This room is full (${MAX_PLAYERS} players).`);
      return;
    }

    this.players.set(connection.id, {
      id: connection.id,
      name,
      joinedAt: Date.now(),
      score: 0,
      clientId,
    });
    this.clientToConn.set(clientId, connection.id);
    if (!this.hostClientId) this.hostClientId = clientId;
    this.broadcastAll();
  }

  private remapPsychIds(from: string, to: string) {
    const psych = this.psych;
    if (!psych) return;
    if (psych.activeIds.has(from)) {
      psych.activeIds.delete(from);
      psych.activeIds.add(to);
    }
    const ans = psych.answers.get(from);
    if (ans) {
      psych.answers.delete(from);
      ans.authorId = to;
      psych.answers.set(to, ans);
    }
    if (psych.votes.has(from)) {
      const v = psych.votes.get(from)!;
      psych.votes.delete(from);
      psych.votes.set(to, v);
    }
  }

  /** Bind this websocket to a known client seat (handles PartySocket reconnect). */
  private bindClient(connection: Connection, clientId?: string): Player | null {
    if (!clientId || clientId.length < 8) {
      return this.players.get(connection.id) ?? null;
    }

    // Already seated on this connection
    const here = this.players.get(connection.id);
    if (here?.clientId === clientId) {
      this.clientToConn.set(clientId, connection.id);
      return here;
    }

    // Move existing seat onto this connection
    for (const [pid, p] of this.players) {
      if (p.clientId === clientId) {
        if (pid !== connection.id) {
          this.players.delete(pid);
          p.id = connection.id;
          this.players.set(connection.id, p);
          this.remapPsychIds(pid, connection.id);
        }
        this.clientToConn.set(clientId, connection.id);
        return p;
      }
    }

    return this.players.get(connection.id) ?? null;
  }

  private requireHost(
    connection: Connection,
    clientId?: string,
  ): boolean {
    this.bindClient(connection, clientId);
    const ok =
      Boolean(clientId) &&
      clientId === this.hostClientId &&
      this.players.has(connection.id);
    if (!ok) {
      this.sendError(connection, "Only the host can do that.");
      return false;
    }
    return true;
  }

  private handleOpenPsych(connection: Connection, clientId?: string) {
    if (!this.requireHost(connection, clientId)) return;
    if (this.phase !== "lobby") {
      this.sendError(connection, "Finish the current game first.");
      return;
    }
    if (this.players.size < MIN_PLAYERS_TO_START) {
      this.sendError(
        connection,
        `Need at least ${MIN_PLAYERS_TO_START} players to play.`,
      );
      return;
    }
    this.phase = "psych_decks";
    this.psych = null;
    this.broadcastAll();
  }

  private handleBackToLobby(connection: Connection, clientId?: string) {
    if (!this.requireHost(connection, clientId)) return;
    this.phase = "lobby";
    this.psych = null;
    this.spectatorIds.clear();
    for (const p of this.players.values()) p.score = 0;
    this.broadcastAll();
  }

  private handleStartDeck(
    connection: Connection,
    deckId: PsychDeckId,
    clientId?: string,
  ) {
    if (!this.requireHost(connection, clientId)) return;
    if (this.phase !== "psych_decks" && this.phase !== "lobby") {
      this.sendError(connection, "Can't start a deck right now.");
      return;
    }
    const deck = resolveDeck(deckId);
    if (!deck) {
      this.sendError(connection, "Unknown deck.");
      return;
    }
    if (this.players.size < MIN_PLAYERS_TO_START) {
      this.sendError(
        connection,
        `Need at least ${MIN_PLAYERS_TO_START} players.`,
      );
      return;
    }

    for (const p of this.players.values()) p.score = 0;

    const seed = Date.now() % 2147483647;
    const prompts = pickDeckPrompts(deck.id, PSYCH_TOTAL_ROUNDS, seed);
    const activeIds = new Set([...this.players.keys()]);
    const names = [...this.players.values()].map((p) => p.name);
    const question = fillPrompt(prompts[0]!.template, names, seed + 1);

    this.psych = {
      deckId: deck.id,
      deckTitle: deck.title,
      prompts,
      roundIndex: 0,
      question,
      answers: new Map(),
      votes: new Map(),
      activeIds,
    };
    this.phase = "psych_answer";
    this.broadcastAll();
  }

  private handleSubmitAnswer(connection: Connection, raw: string) {
    const psych = this.psych;
    if (!psych || this.phase !== "psych_answer") {
      this.sendError(connection, "Not accepting answers right now.");
      return;
    }
    if (!psych.activeIds.has(connection.id)) {
      this.sendError(connection, "You're spectating this game.");
      return;
    }
    if (psych.answers.has(connection.id)) {
      this.sendError(connection, "You already answered.");
      return;
    }

    const text = sanitizeAnswer(raw);
    if (!text) {
      this.sendError(
        connection,
        `Answer must be 1–${MAX_ANSWER_LEN} characters.`,
      );
      return;
    }

    psych.answers.set(connection.id, {
      answerId: newAnswerId(),
      authorId: connection.id,
      text,
    });

    if (this.allActiveAnswered()) this.phase = "psych_vote";
    this.broadcastAll();
  }

  private handleSubmitVote(connection: Connection, answerId: string) {
    const psych = this.psych;
    if (!psych || this.phase !== "psych_vote") {
      this.sendError(connection, "Not accepting votes right now.");
      return;
    }
    if (!psych.activeIds.has(connection.id)) {
      this.sendError(connection, "You're spectating this game.");
      return;
    }
    if (psych.votes.has(connection.id)) {
      this.sendError(connection, "You already voted.");
      return;
    }

    const own = psych.answers.get(connection.id);
    if (own && own.answerId === answerId) {
      this.sendError(connection, "You can't vote for your own answer.");
      return;
    }

    const target = [...psych.answers.values()].find(
      (a) => a.answerId === answerId,
    );
    if (!target) {
      this.sendError(connection, "That answer isn't on the board.");
      return;
    }

    psych.votes.set(connection.id, answerId);

    if (this.allActiveVoted()) {
      this.applyRoundScores();
      this.phase = "psych_round_result";
    }
    this.broadcastAll();
  }

  private handleAdvance(connection: Connection, clientId?: string) {
    if (!this.requireHost(connection, clientId)) return;
    const psych = this.psych;
    if (!psych) return;

    if (this.phase === "psych_round_result") {
      const next = psych.roundIndex + 1;
      if (next >= PSYCH_TOTAL_ROUNDS) {
        this.phase = "psych_final";
        this.broadcastAll();
        return;
      }
      psych.roundIndex = next;
      psych.answers.clear();
      psych.votes.clear();
      const names = [...psych.activeIds]
        .map((id) => this.players.get(id)?.name)
        .filter((n): n is string => Boolean(n));
      const prompt = psych.prompts[next]!;
      psych.question = fillPrompt(
        prompt.template,
        names,
        Date.now() + next * 97,
      );
      this.phase = "psych_answer";
      this.broadcastAll();
      return;
    }

    if (this.phase === "psych_final") {
      this.phase = "lobby";
      this.psych = null;
      this.spectatorIds.clear();
      for (const p of this.players.values()) p.score = 0;
      this.broadcastAll();
    }
  }

  private applyRoundScores() {
    const psych = this.psych;
    if (!psych) return;

    const voteCounts = new Map<string, number>();
    for (const answerId of psych.votes.values()) {
      if (!answerId) continue;
      voteCounts.set(answerId, (voteCounts.get(answerId) ?? 0) + 1);
    }

    for (const answer of psych.answers.values()) {
      const votes = voteCounts.get(answer.answerId) ?? 0;
      const author = this.players.get(answer.authorId);
      if (author) author.score += votes * 100;
    }

    let maxVotes = 0;
    for (const v of voteCounts.values()) maxVotes = Math.max(maxVotes, v);
    if (maxVotes > 0) {
      const mvps = [...psych.answers.values()].filter(
        (a) => (voteCounts.get(a.answerId) ?? 0) === maxVotes,
      );
      const bonus = Math.floor(50 / mvps.length);
      for (const a of mvps) {
        const author = this.players.get(a.authorId);
        if (author) author.score += bonus;
      }
    }
  }

  private allActiveAnswered(): boolean {
    const psych = this.psych;
    if (!psych || psych.activeIds.size === 0) return false;
    for (const id of psych.activeIds) {
      if (!psych.answers.has(id)) return false;
    }
    return true;
  }

  private allActiveVoted(): boolean {
    const psych = this.psych;
    if (!psych || psych.activeIds.size === 0) return false;
    for (const id of psych.activeIds) {
      if (psych.votes.has(id)) continue;
      const own = psych.answers.get(id);
      const others = [...psych.answers.values()].filter(
        (a) => a.answerId !== own?.answerId,
      );
      if (others.length === 0) {
        psych.votes.set(id, "");
        continue;
      }
      return false;
    }
    return true;
  }

  private maybeProgressAfterDisconnect() {
    if (!this.psych) return;
    if (this.psych.activeIds.size < MIN_PLAYERS_TO_START) {
      this.phase = "lobby";
      this.psych = null;
      return;
    }
    if (this.phase === "psych_answer" && this.allActiveAnswered()) {
      this.phase = "psych_vote";
    } else if (this.phase === "psych_vote" && this.allActiveVoted()) {
      this.applyRoundScores();
      this.phase = "psych_round_result";
    }
  }

  private snapshotFor(viewerId: string): RoomState {
    const psych = this.psych;
    let psychPublic: PsychPublicState | null = null;

    if (psych) {
      const activePlayerCount = psych.activeIds.size;
      const youActive = psych.activeIds.has(viewerId);
      const yourAnswer = psych.answers.get(viewerId);
      const youSubmitted = Boolean(yourAnswer);
      const youVoted = psych.votes.has(viewerId);

      let waitingFor = 0;
      let submittedCount = 0;

      if (this.phase === "psych_answer") {
        submittedCount = psych.answers.size;
        waitingFor = Math.max(0, activePlayerCount - submittedCount);
      } else if (this.phase === "psych_vote") {
        submittedCount = [...psych.votes.values()].filter(Boolean).length;
        for (const id of psych.activeIds) {
          if (!psych.votes.has(id)) waitingFor += 1;
        }
      }

      const voteCounts = new Map<string, number>();
      for (const answerId of psych.votes.values()) {
        if (!answerId) continue;
        voteCounts.set(answerId, (voteCounts.get(answerId) ?? 0) + 1);
      }

      let voteOptions: PsychPublicState["voteOptions"] = null;
      let roundResults: PsychPublicState["roundResults"] = null;

      if (this.phase === "psych_vote") {
        const opts = [...psych.answers.values()].map((a) => ({
          answerId: a.answerId,
          text: a.text,
        }));
        shuffleInPlace(opts, psych.roundIndex * 1009 + psych.answers.size);
        voteOptions = opts;
      }

      if (
        this.phase === "psych_round_result" ||
        this.phase === "psych_final"
      ) {
        roundResults = [...psych.answers.values()]
          .map((a) => ({
            answerId: a.answerId,
            text: a.text,
            authorId: a.authorId,
            authorName: this.players.get(a.authorId)?.name ?? "Someone",
            votes: voteCounts.get(a.answerId) ?? 0,
            isYou: a.authorId === viewerId,
          }))
          .sort((a, b) => b.votes - a.votes);
      }

      psychPublic = {
        deckId: psych.deckId,
        deckTitle: psych.deckTitle,
        round: psych.roundIndex + 1,
        totalRounds: PSYCH_TOTAL_ROUNDS,
        question: psych.question,
        waitingFor,
        submittedCount,
        activePlayerCount,
        answers: null,
        voteOptions,
        roundResults,
        youSubmitted: youActive ? youSubmitted : false,
        youVoted: youActive ? youVoted : false,
        yourAnswerId: yourAnswer?.answerId ?? null,
      };
    }

    const publicPlayers = [...this.players.values()]
      .sort((a, b) => a.joinedAt - b.joinedAt)
      .map(({ clientId: _c, ...rest }) => rest);

    return {
      roomCode: this.name.toUpperCase(),
      hostId: this.hostId,
      hostClientId: this.hostClientId,
      players: publicPlayers,
      phase: this.phase,
      spectatorIds: [...this.spectatorIds],
      psych: psychPublic,
    };
  }

  private broadcastAll() {
    void this.persistLobby();
    for (const conn of this.getConnections()) {
      this.send(conn, {
        type: "state",
        state: this.snapshotFor(conn.id),
      });
    }
  }

  private send(connection: Connection, payload: ServerMessage) {
    connection.send(JSON.stringify(payload));
  }

  private sendError(connection: Connection, message: string) {
    this.send(connection, { type: "error", message });
  }
}

function sanitizeName(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const name = raw.replace(/\s+/g, " ").trim();
  if (name.length < 2 || name.length > 16) return null;
  return name;
}

function sanitizeAnswer(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const text = raw.replace(/\s+/g, " ").trim();
  if (text.length < 1 || text.length > MAX_ANSWER_LEN) return null;
  return text;
}
