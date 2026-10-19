/** PartyServer worker host (no protocol). Override via NEXT_PUBLIC_PARTY_HOST. */
export function getPartyHost(): string {
  const fromEnv = process.env.NEXT_PUBLIC_PARTY_HOST?.trim();
  if (fromEnv) {
    return fromEnv
      .replace(/^(https?|wss?):\/\//, "")
      .replace(/\/$/, "");
  }
  // Deployed default for this project (safe fallback if env missing in client).
  return "starkizard-play.mail2prabalkalia.workers.dev";
}

export function getPartyPartyName(): string {
  return process.env.NEXT_PUBLIC_PARTY_NAME?.trim() || "lobby";
}
