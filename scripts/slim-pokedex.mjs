/**
 * Compact public/data/pokedex.json for the Guess Pokémon game.
 * Strips redundant aliases/URLs and shortens flavor text.
 * Run: node scripts/slim-pokedex.mjs
 */
import { readFile, writeFile } from "node:fs/promises";
import path from "node:path";

const dest = path.join(process.cwd(), "public", "data", "pokedex.json");
const raw = JSON.parse(await readFile(dest, "utf8"));

function truncateFact(text, max = 140) {
  const clean = String(text || "")
    .replace(/\s+/g, " ")
    .trim();
  if (clean.length <= max) return clean;
  const cut = clean.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

const slim = raw.map((entry) => ({
  id: entry.id,
  name: entry.name,
  types: entry.types,
  generation: entry.generation,
  funFact: truncateFact(entry.funFact),
}));

await writeFile(dest, JSON.stringify(slim));
const bytes = Buffer.byteLength(JSON.stringify(slim));
console.log(`Wrote ${slim.length} entries (${(bytes / 1024).toFixed(1)} KB) → ${dest}`);
