/**
 * Builds a compact national-dex JSON from PokeAPI.
 * Stores: id, name, types, generation, short funFact.
 * Sprites / region / aliases are derived client-side.
 * Run: node scripts/build-pokedex.mjs
 * Optional: node scripts/slim-pokedex.mjs (re-compact an existing file)
 */
import { writeFile, mkdir } from "node:fs/promises";
import path from "node:path";

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

async function fetchJson(url, retries = 4) {
  for (let i = 0; i < retries; i += 1) {
    try {
      const res = await fetch(url);
      if (!res.ok) throw new Error(`${res.status} ${url}`);
      return await res.json();
    } catch (err) {
      if (i === retries - 1) throw err;
      await sleep(400 * (i + 1));
    }
  }
}

function pickFlavor(entries, max = 140) {
  const en = (entries || [])
    .filter((e) => e.language?.name === "en")
    .map((e) => e.flavor_text.replace(/\f|\n|\r/g, " ").replace(/\s+/g, " ").trim());
  const best = en.sort((a, b) => b.length - a.length)[0] || "A mysterious Pokémon.";
  if (best.length <= max) return best;
  const cut = best.slice(0, max);
  const lastSpace = cut.lastIndexOf(" ");
  return `${(lastSpace > 80 ? cut.slice(0, lastSpace) : cut).trim()}…`;
}

const list = await fetchJson("https://pokeapi.co/api/v2/pokemon-species?limit=2000");
const species = list.results;
console.log(`Species count: ${species.length}`);

const out = [];
for (let i = 0; i < species.length; i += 1) {
  const s = await fetchJson(species[i].url);
  const id = s.id;
  const name = s.name
    .split("-")
    .map((p) => p.charAt(0).toUpperCase() + p.slice(1))
    .join(" ");
  // Prefer default variety for types
  const defaultVar =
    s.varieties?.find((v) => v.is_default)?.pokemon?.url ||
    `https://pokeapi.co/api/v2/pokemon/${id}/`;
  const poke = await fetchJson(defaultVar);
  const types = poke.types
    .sort((a, b) => a.slot - b.slot)
    .map((t) => t.type.name.charAt(0).toUpperCase() + t.type.name.slice(1));
  const genNum = Number(String(s.generation?.url || "").match(/\/(\d+)\/?$/)?.[1] || 1);
  out.push({
    id,
    name,
    types,
    generation: genNum,
    funFact: pickFlavor(s.flavor_text_entries),
  });
  if ((i + 1) % 25 === 0) console.log(`… ${i + 1}/${species.length}`);
  await sleep(40);
}

out.sort((a, b) => a.id - b.id);
const dir = path.join(process.cwd(), "public", "data");
await mkdir(dir, { recursive: true });
const dest = path.join(dir, "pokedex.json");
await writeFile(dest, JSON.stringify(out));
console.log(`Wrote ${out.length} to ${dest}`);
