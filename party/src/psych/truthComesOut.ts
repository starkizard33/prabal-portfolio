/**
 * Truth Comes Out prompts.
 * Use {name} and optionally {name2} — at most two spotlight players.
 * No whole-group / “who among us” questions.
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
    template: "If {name} were a celebrity, what would the scandal headline be?",
  },
  {
    id: "useless-superpower",
    template: "What useless superpower would {name} somehow make cool?",
  },
  {
    id: "reality-show",
    template: "Which reality show would {name} win — and by cheating how?",
  },
  {
    id: "hot-take",
    template: "What's {name}'s hottest take that they'd deny in public?",
  },
  {
    id: "zombie-role",
    template: "In a zombie apocalypse, what is {name}'s actual (useless) role?",
  },
  {
    id: "lied-about",
    template: "What is something {name} has definitely lied about?",
  },
  {
    id: "search-history",
    template: "What's sitting at the top of {name}'s search history right now?",
  },
  {
    id: "wedding-speech",
    template: "Write the first line of {name}'s disastrous wedding speech.",
  },
  {
    id: "petty-crime",
    template: "What petty crime would {name} commit and immediately confess to?",
  },
  {
    id: "chatgpt-2am",
    template: "What would {name} ask ChatGPT at 2am?",
  },
  {
    id: "roommate-habit",
    template: "What's the most annoying roommate habit {name} definitely has?",
  },
  {
    id: "autobiography",
    template: "Title of {name}'s autobiography:",
  },
  {
    id: "first-date-ruin",
    template: "How does {name} ruin a first date in under 10 minutes?",
  },
  {
    id: "karaoke-destroy",
    template: "What song would {name} absolutely destroy at karaoke?",
  },
  {
    id: "villain-catchphrase",
    template: "If {name} were a movie villain, what's their catchphrase?",
  },
  {
    id: "time-travel-ban",
    template: "What year should {name} be banned from time-traveling to?",
  },
  {
    id: "group-chat-energy",
    template: "Describe {name}'s group-chat energy in three words.",
  },
  {
    id: "cancel-excuse",
    template: "What's {name}'s most creative excuse for canceling last minute?",
  },
  {
    id: "autocorrect",
    template: "What's the most cursed autocorrect {name} has ever sent?",
  },
  {
    id: "childish-habit",
    template: "What's the most childish thing {name} still does?",
  },
  {
    id: "guilty-playlist",
    template: "What's the most embarrassing song on {name}'s playlist?",
  },
  {
    id: "alone-weird",
    template: "What's the weirdest thing {name} does when nobody's watching?",
  },
  {
    id: "impress-fail",
    template: "What's the most ridiculous thing {name} has done to impress someone?",
  },
  {
    id: "hangry-denial",
    template: "What does {name} say when they're hangry but swearing they're fine?",
  },
  {
    id: "main-character",
    template: "Write {name}'s LinkedIn bio if they were fully unhinged.",
  },
  {
    id: "last-drink",
    template: "How many times has {name} said \"this is my last one\" tonight — be honest.",
  },
  {
    id: "phone-lock",
    template: "What's on {name}'s lock screen that they'd rather you didn't see?",
  },
  {
    id: "shower-argument",
    template: "What argument does {name} rehearse in the shower — and lose?",
  },
  {
    id: "vending-machine",
    template: "How does {name} get into a fight with a self-checkout machine?",
  },
  {
    id: "meme-origin",
    template: "How does {name} accidentally become a meme?",
  },
  {
    id: "horoscope-lie",
    template: "Invent a fake horoscope reading that {name} would 100% believe.",
  },
  {
    id: "podcast-guest",
    template: "What podcast episode title is just {name}'s entire personality?",
  },
  {
    id: "cooking-disaster",
    template: "What's the kitchen crime {name} commits and calls \"cooking\"?",
  },
  {
    id: "fitness-era",
    template: "Describe {name}'s shortest-lived fitness era.",
  },
  {
    id: "browser-tabs",
    template: "What's open in {name}'s 47 browser tabs right now?",
  },
  {
    id: "voice-note",
    template: "Transcribe the chaos of {name}'s typical 3-minute voice note.",
  },
  {
    id: "airport-energy",
    template: "What's {name}'s airport personality — be brutal.",
  },
  {
    id: "netflix-crime",
    template: "What show does {name} rewatch and pretend it's their first time?",
  },
  {
    id: "birthday-gift",
    template: "Worst gift {name} has ever been excited to receive.",
  },
  {
    id: "conspiracy",
    template: "What conspiracy theory would {name} fall for immediately?",
  },

  // —— two people ——
  {
    id: "duo-reality",
    template:
      "If {name} and {name2} co-hosted a reality show, what would it be called?",
  },
  {
    id: "duo-crime",
    template:
      "What heist would {name} and {name2} attempt — and how do they fail?",
  },
  {
    id: "duo-argument",
    template:
      "What petty argument would {name} and {name2} have at 1am in a group chat?",
  },
  {
    id: "duo-roadtrip",
    template:
      "On a road trip, what's the first thing that makes {name} and {name2} stop speaking?",
  },
  {
    id: "duo-startup",
    template:
      "Invent the worst startup pitch from {name} and {name2}.",
  },
  {
    id: "duo-escape-room",
    template:
      "How do {name} and {name2} get banned from an escape room?",
  },
  {
    id: "duo-dating-show",
    template:
      "On a dating show, what's {name}'s red flag about {name2}?",
  },
  {
    id: "duo-group-project",
    template:
      "In a group project, what exact crime does {name} commit against {name2}?",
  },
  {
    id: "duo-wedding",
    template:
      "What toast does {name} give at {name2}'s wedding that ruins the vibe?",
  },
  {
    id: "duo-survival",
    template:
      "Stranded on an island: what does {name} make {name2} do for \"the team\"?",
  },
  {
    id: "duo-podcast",
    template:
      "Name the toxic podcast {name} and {name2} would start together.",
  },
  {
    id: "duo-text",
    template:
      "Write the last text {name} would send {name2} before blocking them over nothing.",
  },
  {
    id: "duo-costume",
    template:
      "Worst couples-costume idea if {name} and {name2} showed up matching.",
  },
  {
    id: "duo-ikea",
    template:
      "How does an IKEA trip end for {name} and {name2}?",
  },
  {
    id: "duo-therapy",
    template:
      "What would a therapist diagnose about {name} and {name2}'s friendship in one sentence?",
  },
];

export function pickPrompts(count: number, seed: number): PromptTemplate[] {
  const shuffled = [...TRUTH_COMES_OUT_PROMPTS];
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
    const pool = others.length > 0 ? others : playerNames.filter((_, i) => i > 0);
    b = pool[Math.abs(salt * 31 + 7) % pool.length]!;
  }

  return template
    .replaceAll("{name2}", b)
    .replaceAll("{name}", a);
}
