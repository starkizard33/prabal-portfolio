/**
 * Truth Comes Out prompts.
 * Use {name} and optionally {name2} — at most two spotlight players.
 * Wording pushes short, punchy answers (not essays).
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
    template: "If {name} were a celebrity, what's the scandal headline?",
  },
  {
    id: "useless-superpower",
    template: "What useless superpower would {name} somehow make cool?",
  },
  {
    id: "reality-show",
    template: "Which reality show would {name} win?",
  },
  {
    id: "hot-take",
    template: "What's {name}'s hottest take they'd deny in public?",
  },
  {
    id: "zombie-role",
    template: "In a zombie apocalypse, what's {name}'s actual job?",
  },
  {
    id: "lied-about",
    template: "What has {name} definitely lied about?",
  },
  {
    id: "search-history",
    template: "Top of {name}'s search history right now?",
  },
  {
    id: "wedding-speech",
    template: "First line of {name}'s disastrous wedding speech?",
  },
  {
    id: "petty-crime",
    template: "What petty crime would {name} commit then confess?",
  },
  {
    id: "chatgpt-2am",
    template: "What would {name} ask ChatGPT at 2am?",
  },
  {
    id: "roommate-habit",
    template: "Worst roommate habit {name} definitely has?",
  },
  {
    id: "autobiography",
    template: "{name}'s autobiography title?",
  },
  {
    id: "first-date-ruin",
    template: "How does {name} ruin a first date in under 10 minutes?",
  },
  {
    id: "karaoke-destroy",
    template: "What song would {name} destroy at karaoke?",
  },
  {
    id: "villain-catchphrase",
    template: "If {name} were a movie villain, what's the catchphrase?",
  },
  {
    id: "time-travel-ban",
    template: "What year should {name} be banned from time-traveling to?",
  },
  {
    id: "group-chat-energy",
    template: "{name}'s group-chat energy in three words?",
  },
  {
    id: "cancel-excuse",
    template: "{name}'s most creative last-minute cancel excuse?",
  },
  {
    id: "autocorrect",
    template: "Cursed autocorrect {name} has definitely sent?",
  },
  {
    id: "childish-habit",
    template: "Most childish thing {name} still does?",
  },
  {
    id: "guilty-playlist",
    template: "Most embarrassing song on {name}'s playlist?",
  },
  {
    id: "alone-weird",
    template: "Weirdest thing {name} does alone?",
  },
  {
    id: "impress-fail",
    template: "Most ridiculous thing {name} did to impress someone?",
  },
  {
    id: "hangry-denial",
    template: "What does hangry {name} say while claiming they're fine?",
  },
  {
    id: "main-character",
    template: "{name}'s LinkedIn bio if fully unhinged?",
  },
  {
    id: "last-drink",
    template: "How many times has {name} said \"this is my last one\" tonight?",
  },
  {
    id: "phone-lock",
    template: "What's on {name}'s lock screen that shouldn't be?",
  },
  {
    id: "shower-argument",
    template: "What argument does {name} rehearse in the shower?",
  },
  {
    id: "vending-machine",
    template: "What would {name} yell at a self-checkout?",
  },
  {
    id: "meme-origin",
    template: "How does {name} become a meme?",
  },
  {
    id: "horoscope-lie",
    template: "Fake horoscope {name} would 100% believe?",
  },
  {
    id: "podcast-guest",
    template: "Podcast episode title that is just {name}?",
  },
  {
    id: "cooking-disaster",
    template: "Kitchen crime {name} calls \"cooking\"?",
  },
  {
    id: "fitness-era",
    template: "{name}'s shortest-lived fitness era?",
  },
  {
    id: "browser-tabs",
    template: "What's open in {name}'s 47 browser tabs?",
  },
  {
    id: "voice-note",
    template: "First 5 seconds of {name}'s typical voice note?",
  },
  {
    id: "airport-energy",
    template: "{name}'s airport personality in three words?",
  },
  {
    id: "netflix-crime",
    template: "Show {name} rewatches and pretends is new?",
  },
  {
    id: "birthday-gift",
    template: "Worst gift {name} was excited to receive?",
  },
  {
    id: "conspiracy",
    template: "Conspiracy theory {name} would fall for immediately?",
  },

  // —— two people ——
  {
    id: "duo-reality",
    template: "Reality show title if {name} and {name2} co-hosted?",
  },
  {
    id: "duo-crime",
    template: "What heist would {name} and {name2} botch?",
  },
  {
    id: "duo-argument",
    template: "Petty 1am fight between {name} and {name2}?",
  },
  {
    id: "duo-roadtrip",
    template: "What ends the {name} + {name2} road trip?",
  },
  {
    id: "duo-startup",
    template: "Worst startup name from {name} and {name2}?",
  },
  {
    id: "duo-escape-room",
    template: "Why are {name} and {name2} banned from escape rooms?",
  },
  {
    id: "duo-dating-show",
    template: "On a dating show, {name}'s red flag about {name2}?",
  },
  {
    id: "duo-group-project",
    template: "In a group project, what does {name} do to {name2}?",
  },
  {
    id: "duo-wedding",
    template: "Toast line {name} ruins {name2}'s wedding with?",
  },
  {
    id: "duo-survival",
    template: "Stranded: what chore does {name} dump on {name2}?",
  },
  {
    id: "duo-podcast",
    template: "Toxic podcast name for {name} and {name2}?",
  },
  {
    id: "duo-text",
    template: "Last text {name} sends {name2} before blocking?",
  },
  {
    id: "duo-costume",
    template: "Worst couples costume for {name} and {name2}?",
  },
  {
    id: "duo-ikea",
    template: "How does the {name} + {name2} IKEA trip end?",
  },
  {
    id: "duo-therapy",
    template: "One-word diagnosis for {name} and {name2}'s friendship?",
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
