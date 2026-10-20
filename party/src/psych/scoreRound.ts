/** Every positive in Psych is worth one point. */
export const PSYCH_POINT = 1;

export const FACT_TRUTH_ID = "fact-truth";

export function pointsFromVotes(input: {
  votes: { voterId: string; answerId: string }[];
  answers: { answerId: string; authorId: string }[];
  truthId?: string | null;
}): Map<string, number> {
  const authors = new Map(
    input.answers.map((answer) => [answer.answerId, answer.authorId]),
  );
  const scores = new Map<string, number>();
  const add = (playerId: string) => {
    scores.set(playerId, (scores.get(playerId) ?? 0) + PSYCH_POINT);
  };

  for (const vote of input.votes) {
    if (!vote.answerId) continue;
    if (input.truthId && vote.answerId === input.truthId) {
      add(vote.voterId);
      continue;
    }
    const authorId = authors.get(vote.answerId);
    if (authorId) add(authorId);
  }

  return scores;
}

export function isOneWordFact(raw: string): boolean {
  const word = raw.trim();
  return /^[A-Za-z0-9]+(?:[-'][A-Za-z0-9]+)*$/.test(word);
}

export function sameFactWord(a: string, b: string): boolean {
  return a.trim().toLowerCase() === b.trim().toLowerCase();
}
