export type MurderRole = "murderer" | "civilian";

export type MurderSeat = {
  name: string;
  role: MurderRole;
  alive: boolean;
};

export const MURDER_MIN_PLAYERS = 4;
export const MURDER_MAX_PLAYERS = 30;

/** Murderers for a table. Zero when the table is too small or too big. */
export function murdererCount(playerCount: number): number {
  if (playerCount < MURDER_MIN_PLAYERS || playerCount > MURDER_MAX_PLAYERS) {
    return 0;
  }
  if (playerCount <= 7) return 1;
  if (playerCount <= 10) return 2;
  if (playerCount <= 16) return 3;
  if (playerCount <= 20) return 4;
  if (playerCount <= 25) return 5;
  return 6;
}

export function dealRoles(
  names: string[],
  random: () => number = Math.random,
): MurderSeat[] {
  const killers = murdererCount(names.length);
  const order = names.map((_, index) => index);
  for (let i = order.length - 1; i > 0; i -= 1) {
    const j = Math.floor(random() * (i + 1));
    const swap = order[i]!;
    order[i] = order[j]!;
    order[j] = swap;
  }
  const murdererIndexes = new Set(order.slice(0, killers));
  return names.map((name, index) => ({
    name,
    role: murdererIndexes.has(index) ? "murderer" : "civilian",
    alive: true,
  }));
}

export function murderWinner(
  seats: Pick<MurderSeat, "role" | "alive">[],
): MurderRole | null {
  const alive = seats.filter((seat) => seat.alive);
  const murderers = alive.filter((seat) => seat.role === "murderer").length;
  const civilians = alive.filter((seat) => seat.role === "civilian").length;
  if (murderers === 0 && civilians > 0) return "civilian";
  if (civilians === 0 && murderers > 0) return "murderer";
  return null;
}
