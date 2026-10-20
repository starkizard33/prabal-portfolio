export function votersByAnswer(
  votes: { voterName: string; answerId: string }[],
): Map<string, string[]> {
  const grouped = new Map<string, string[]>();
  for (const vote of votes) {
    if (!vote.answerId) continue;
    const names = grouped.get(vote.answerId) ?? [];
    names.push(vote.voterName);
    grouped.set(vote.answerId, names);
  }
  return grouped;
}
