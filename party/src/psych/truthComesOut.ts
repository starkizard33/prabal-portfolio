/**
 * Truth Comes Out prompts.
 * Open-ended, short creative answers — never A-or-B / multiple choice.
 * {name} / optional {name2} — at most two spotlight players.
 */

export type PromptTemplate = {
  id: string;
  /** {name} required for spotlight; {name2} optional second player */
  template: string;
};

export const TRUTH_COMES_OUT_PROMPTS: PromptTemplate[] = [
  // —— one person ——
  {
    id: "celebrity-scandal",
    template: "Write the tabloid headline if {name} became famous.",
  },
  {
    id: "useless-superpower",
    template: "Invent a useless superpower that somehow fits {name}.",
  },
  {
    id: "reality-show",
    template: "Name the reality show {name} would somehow win.",
  },
  {
    id: "hot-take",
    template: "What's a hot take {name} believes but won't say out loud?",
  },
  {
    id: "zombie-role",
    template: "In a zombie apocalypse, what job would {name} actually get stuck with?",
  },
  {
    id: "lied-about",
    template: "What has {name} definitely lied about before?",
  },
  {
    id: "search-history",
    template: "What is at the top of {name}'s search history right now?",
  },
  {
    id: "wedding-speech",
    template: "Write the opening line of {name}'s disastrous wedding speech.",
  },
  {
    id: "petty-crime",
    template: "What petty crime would {name} commit and then immediately confess?",
  },
  {
    id: "chatgpt-2am",
    template: "What would {name} type into ChatGPT at 2am?",
  },
  {
    id: "roommate-habit",
    template: "What roommate habit does {name} definitely have?",
  },
  {
    id: "autobiography",
    template: "Invent the title of {name}'s autobiography.",
  },
  {
    id: "first-date-ruin",
    template: "What would {name} do to ruin a first date in under 10 minutes?",
  },
  {
    id: "karaoke-destroy",
    template: "What karaoke song would {name} absolutely butcher?",
  },
  {
    id: "villain-catchphrase",
    template: "If {name} were a movie villain, what catchphrase would they use?",
  },
  {
    id: "time-travel-ban",
    template: "Name a year {name} should never be allowed to time-travel to.",
  },
  {
    id: "group-chat-energy",
    template: "Sum up {name}'s group-chat energy in three words.",
  },
  {
    id: "cancel-excuse",
    template: "Invent {name}'s most creative excuse for canceling last minute.",
  },
  {
    id: "autocorrect",
    template: "What cursed autocorrect has {name} definitely sent?",
  },
  {
    id: "childish-habit",
    template: "What childish thing does {name} still do?",
  },
  {
    id: "guilty-playlist",
    template: "What embarrassing song is secretly on {name}'s playlist?",
  },
  {
    id: "alone-weird",
    template: "What weird thing does {name} do when nobody's watching?",
  },
  {
    id: "impress-fail",
    template: "What ridiculous thing has {name} done just to impress someone?",
  },
  {
    id: "hangry-denial",
    template: "What does {name} say when they're hangry but swear they're fine?",
  },
  {
    id: "main-character",
    template: "Write {name}'s LinkedIn headline if they were fully unhinged.",
  },
  {
    id: "last-drink",
    template: "How many times has {name} said \"this is my last one\" tonight?",
  },
  {
    id: "phone-lock",
    template: "What's on {name}'s lock screen that they hope nobody notices?",
  },
  {
    id: "shower-argument",
    template: "What argument does {name} practice winning in the shower?",
  },
  {
    id: "vending-machine",
    template: "What would {name} yell at a broken self-checkout?",
  },
  {
    id: "meme-origin",
    template: "How would {name} accidentally become a meme?",
  },
  {
    id: "horoscope-lie",
    template: "Invent a fake horoscope that {name} would fully believe.",
  },
  {
    id: "podcast-guest",
    template: "Invent a podcast episode title that is just {name}'s personality.",
  },
  {
    id: "cooking-disaster",
    template: "What kitchen disaster does {name} still call \"cooking\"?",
  },
  {
    id: "fitness-era",
    template: "Name {name}'s shortest-lived fitness phase.",
  },
  {
    id: "browser-tabs",
    template: "Name one tab open in {name}'s chaos of 47 browser tabs.",
  },
  {
    id: "voice-note",
    template: "What are the first few words of {name}'s typical voice note?",
  },
  {
    id: "airport-energy",
    template: "Sum up {name}'s airport personality in three words.",
  },
  {
    id: "netflix-crime",
    template: "What show does {name} rewatch and pretend they've never seen?",
  },
  {
    id: "birthday-gift",
    template: "What's the worst gift {name} was weirdly excited to receive?",
  },
  {
    id: "conspiracy",
    template: "What conspiracy theory would {name} fall for immediately?",
  },

  // —— two people ——
  {
    id: "duo-reality",
    template: "Invent a reality-show title for {name} and {name2} as co-hosts.",
  },
  {
    id: "duo-crime",
    template: "What heist would {name} and {name2} attempt and immediately mess up?",
  },
  {
    id: "duo-argument",
    template: "What petty thing would {name} and {name2} argue about at 1am?",
  },
  {
    id: "duo-roadtrip",
    template: "What would make {name} and {name2} stop speaking on a road trip?",
  },
  {
    id: "duo-startup",
    template: "Invent the worst startup name pitched by {name} and {name2}.",
  },
  {
    id: "duo-escape-room",
    template: "Why did an escape room ban {name} and {name2}?",
  },
  {
    id: "duo-dating-show",
    template: "On a dating show, what red flag would {name} call out about {name2}?",
  },
  {
    id: "duo-group-project",
    template: "In a group project, what annoying thing does {name} do to {name2}?",
  },
  {
    id: "duo-wedding",
    template: "What toast line would {name} say that ruins {name2}'s wedding?",
  },
  {
    id: "duo-survival",
    template: "Stranded on an island, what chore does {name} dump on {name2}?",
  },
  {
    id: "duo-podcast",
    template: "Invent a toxic podcast name for {name} and {name2}.",
  },
  {
    id: "duo-text",
    template: "Write the last text {name} sends {name2} before blocking them over nothing.",
  },
  {
    id: "duo-costume",
    template: "Invent the worst couples costume for {name} and {name2}.",
  },
  {
    id: "duo-ikea",
    template: "How does an IKEA trip end for {name} and {name2}?",
  },
  {
    id: "duo-therapy",
    template: "In one word, what would a therapist call {name} and {name2}'s friendship?",
  },
];

export function pickPrompts(
  count: number,
  seed: number,
  pool: PromptTemplate[] = TRUTH_COMES_OUT_PROMPTS,
): PromptTemplate[] {
  const shuffled = [...pool];
  let s = seed || 1;
  for (let i = shuffled.length - 1; i > 0; i -= 1) {
    s = (s * 16807) % 2147483647;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, Math.min(count, shuffled.length));
}

/** Pick up to two distinct names; fill {name} / {name2}. Never invents a third. */
export function fillPrompt(
  template: string,
  playerNames: string[],
  salt: number,
): string {
  if (playerNames.length === 0) return template;

  const needsSecond = template.includes("{name2}");
  const a = playerNames[Math.abs(salt) % playerNames.length]!;

  let b = a;
  if (needsSecond && playerNames.length >= 2) {
    const others = playerNames.filter((n) => n !== a);
    const pool =
      others.length > 0 ? others : playerNames.filter((_, i) => i > 0);
    b = pool[Math.abs(salt * 31 + 7) % pool.length]!;
  }

  return template.replaceAll("{name2}", b).replaceAll("{name}", a);
}
