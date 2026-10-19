const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** Short room codes that are easy to shout across a table. */
export function generateRoomCode(length = 4): string {
  let out = "";
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  for (let i = 0; i < length; i += 1) {
    out += ALPHABET[bytes[i]! % ALPHABET.length];
  }
  return out;
}

export function normalizeRoomCode(raw: string): string {
  return raw
    .toUpperCase()
    .replace(/[^A-Z0-9]/g, "")
    .slice(0, 6);
}
