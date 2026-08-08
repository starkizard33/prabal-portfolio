/**
 * Real dad jokes / puns pulled from public joke sites (setup → punchline).
 * Sources (scraped Aug 2026):
 * - naturallyfunny.com (Charizard, Pokémon, table tennis, blackjack, F1)
 * - jokelikeadad.com (orange race)
 * - mediocrejoker.com (king/queen blackjack)
 * - chucklewave.com (blackjack dealer)
 * - jokojokes.com / lemmy dadjokes (Linkin Park “doesn’t even matter” genre)
 * - punspill.com / upjoke.com (Pokémon classics)
 *
 * Kept clean / family-friendly — no death gags.
 */

export type DadJoke = {
  setup: string;
  punchline: string;
};

export const POKEMON_JOKES: DadJoke[] = [
  {
    setup: "Why wouldn't Blastoise share with Charizard?",
    punchline: "He was a shellfish Pokémon.",
  },
  {
    setup: "What do you call a low-fat Pokémon?",
    punchline: "Butterfree.",
  },
  {
    setup: "How do you get a sleeping Pokémon onto a bus?",
    punchline: "You Pokémon.",
  },
  {
    setup: "Why did the Squirtle cross the ocean?",
    punchline: "To get to the other tide.",
  },
  {
    setup: "What do you call a scout that likes Pokémon?",
    punchline: "A Tentacool.",
  },
  {
    setup: "Why did Charizard become a chef?",
    punchline: "Because it wanted to master the flame-grilled cuisine!",
  },
  {
    setup: "How does Charizard order its coffee?",
    punchline: "With a side of ember-spresso!",
  },
  {
    setup: "Why did the Charizard cross the road?",
    punchline: "To roast the other side!",
  },
  {
    setup: "What do you call a Charizard with a great sense of humor?",
    punchline: 'A real "blaze" of comedy!',
  },
  {
    setup: "Why don’t Pokémon ever tell lies?",
    punchline: "Because they hate being caught in Pikachu-lies!",
  },
];

export const LINKIN_PARK_JOKES: DadJoke[] = [
  {
    setup: "My friends keep telling me to stop making Linkin Park jokes.",
    punchline: "But in the end, it doesn't even matter.",
  },
  {
    setup: "Linkin Park couldn't agree where to have dinner.",
    punchline: "Chinese, Mexican, Indian… it doesn't even matter.",
  },
  {
    setup:
      "Did you know Linkin Park is the best band to listen to while waiting in line to meet U2?",
    punchline: "I'm one step closer to the Edge… and I'm about to break.",
  },
  {
    setup: "I wanted to post a Linkin Park joke.",
    punchline: "But in the end, it doesn't even matter.",
  },
  {
    setup: "I've become so numb to these Linkin Park jokes.",
    punchline: "…I've tried so hard and got so far, though.",
  },
];

export const TABLE_TENNIS_JOKES: DadJoke[] = [
  {
    setup: "Why did the table tennis ball go to the doctor?",
    punchline: "It was feeling a bit deflated!",
  },
  {
    setup: "Why did the table tennis player refuse to play with a broken racket?",
    punchline: "Because it just wouldn't serve him well!",
  },
  {
    setup: "Why did the table tennis player bring a ladder to the match?",
    punchline: "Because the ball was out of reach!",
  },
  {
    setup: "Why did the table tennis player go to therapy?",
    punchline: "They had too many ping-pong-issues!",
  },
  {
    setup: "What do you call a table tennis match between two ghosts?",
    punchline: "A paranormal ping-pong showdown!",
  },
  {
    setup: "Why did the table tennis player bring a fishing rod to the match?",
    punchline: "Because he wanted to catch a net winner!",
  },
];

export const F1_JOKES: DadJoke[] = [
  {
    setup: "Why did the F1 car visit the doctor?",
    punchline: 'It was feeling a little "exhausted"!',
  },
  {
    setup: "Why did the orange lose the race?",
    punchline: "It ran out of juice!",
  },
  {
    setup: "How do F1 cars greet each other?",
    punchline: '"Hi-speed!"',
  },
  {
    setup: "What did the tire say to the F1 car at the start of the race?",
    punchline: '"Let\'s roll!"',
  },
  {
    setup: "Why did the F1 car go to therapy?",
    punchline: 'It had too many "racing thoughts!"',
  },
  {
    setup: "Why did the tire go to therapy?",
    punchline: 'It was feeling a little "deflated."',
  },
];

export const BLACKJACK_JOKES: DadJoke[] = [
  {
    setup: "A king and queen walk into a bar.",
    punchline: 'The bartender says, "Sorry, you\'re not 21."',
  },
  {
    setup: "Why did the blackjack dealer go broke?",
    punchline: "Because he kept hitting on everyone!",
  },
  {
    setup: "Why did the dad bring a ladder to the blackjack table?",
    punchline: "He heard it was a high-stakes game!",
  },
  {
    setup: "Why did the blackjack dealer break up with his girlfriend?",
    punchline: "She was always hitting on other guys.",
  },
  {
    setup: "What’s a blackjack player’s favorite snack?",
    punchline: 'A "double down" on chips!',
  },
  {
    setup: "Why did the blackjack player bring a banana to the casino?",
    punchline: "They wanted to split their cards and have a healthy snack too.",
  },
];

export const ALL_DAD_JOKES: DadJoke[] = [
  ...POKEMON_JOKES,
  ...LINKIN_PARK_JOKES,
  ...TABLE_TENNIS_JOKES,
  ...F1_JOKES,
  ...BLACKJACK_JOKES,
];

export function formatDadJoke(joke: DadJoke): { title: string; body: string } {
  return {
    title: joke.setup,
    body: joke.punchline,
  };
}

export function pickJoke(pool: DadJoke[], salt = 0): DadJoke {
  if (pool.length === 0) return { setup: "…", punchline: "…" };
  const index = Math.abs(salt) % pool.length;
  return pool[index];
}
