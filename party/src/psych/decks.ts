import type { PsychDeckId } from "../../../shared/playProtocol";
import {
  TRUTH_COMES_OUT_PROMPTS,
  pickPrompts,
  type PromptTemplate,
} from "./truthComesOut";
import { TRUTH_COMES_OUT_NSFW_PROMPTS } from "./truthComesOutNsfw";

export type DeckDefinition = {
  id: PsychDeckId;
  title: string;
  prompts: PromptTemplate[];
};

export const PSYCH_DECKS: Record<PsychDeckId, DeckDefinition> = {
  "truth-comes-out": {
    id: "truth-comes-out",
    title: "Truth Comes Out",
    prompts: TRUTH_COMES_OUT_PROMPTS,
  },
  "truth-comes-out-nsfw": {
    id: "truth-comes-out-nsfw",
    title: "Truth Comes Out · NSFW",
    prompts: TRUTH_COMES_OUT_NSFW_PROMPTS,
  },
};

export function resolveDeck(deckId: string): DeckDefinition | null {
  if (deckId in PSYCH_DECKS) {
    return PSYCH_DECKS[deckId as PsychDeckId];
  }
  return null;
}

export function pickDeckPrompts(
  deckId: PsychDeckId,
  count: number,
  seed: number,
): PromptTemplate[] {
  return pickPrompts(count, seed, PSYCH_DECKS[deckId].prompts);
}
