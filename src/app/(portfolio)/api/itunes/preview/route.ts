import { NextResponse } from "next/server";

type ItunesSong = {
  trackId: number;
  trackName: string;
  artistName: string;
  collectionName?: string;
  previewUrl?: string;
  artworkUrl100?: string;
};

const STOREFRONTS = ["US", "IN", "GB"] as const;

const CACHE_HEADERS = {
  "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=604800",
};

function normalize(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9\s]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function primaryTitle(trackName: string): string {
  return normalize(trackName)
    .replace(/\s*\(.*?\)\s*/g, " ")
    .replace(/\s+featuring\b.*$/, "")
    .replace(/\s+feat\b.*$/, "")
    .replace(/\s+ft\b.*$/, "")
    .replace(/\s+/g, " ")
    .trim();
}

function isLinkinPark(artistName: string): boolean {
  return normalize(artistName).includes("linkin park");
}

function scoreTrack(track: ItunesSong, wantedTitle: string): number {
  if (!track.previewUrl || !isLinkinPark(track.artistName)) return -1;
  const primary = primaryTitle(track.trackName || "");
  const wanted = normalize(wantedTitle);
  if (!primary) return -1;

  const livePenalty = /\blive\b|\bremix\b|\bacoustic\b|\bedit\b/.test(primary)
    ? -20
    : 0;

  if (primary === wanted) return 100 + livePenalty;

  const wantedTokens = wanted.split(" ").filter(Boolean);
  const primaryTokens = primary.split(" ").filter(Boolean);
  if (
    wantedTokens.length > 0 &&
    wantedTokens.length === primaryTokens.length &&
    wantedTokens.every((token, i) => primaryTokens[i] === token)
  ) {
    return 95 + livePenalty;
  }

  return -1;
}

async function searchCountry(title: string, country: string): Promise<ItunesSong[]> {
  const term = `Linkin Park ${title}`;
  const url =
    `https://itunes.apple.com/search?term=${encodeURIComponent(term)}` +
    `&entity=song&limit=15&country=${country}`;
  const res = await fetch(url, {
    next: { revalidate: 60 * 60 * 24 },
    headers: { Accept: "application/json" },
  });
  if (!res.ok) return [];
  const data = (await res.json()) as { results?: ItunesSong[] };
  return data.results || [];
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const title = searchParams.get("title")?.trim();
  if (!title) {
    return NextResponse.json({ error: "Missing title" }, { status: 400 });
  }

  try {
    const batches = await Promise.all(
      STOREFRONTS.map((country) => searchCountry(title, country)),
    );

    let best: ItunesSong | null = null;
    let bestScore = -1;

    for (const results of batches) {
      for (const track of results) {
        const score = scoreTrack(track, title);
        if (score > bestScore) {
          bestScore = score;
          best = track;
        }
      }
    }

    if (!best?.previewUrl || bestScore < 90) {
      return NextResponse.json(
        { error: "No preview found for that track" },
        { status: 404, headers: CACHE_HEADERS },
      );
    }

    return NextResponse.json(
      {
        id: best.trackId,
        title: best.trackName,
        preview: best.previewUrl,
        artist: best.artistName,
        album: best.collectionName || null,
        cover: best.artworkUrl100 || null,
      },
      { headers: CACHE_HEADERS },
    );
  } catch {
    return NextResponse.json({ error: "Failed to reach iTunes" }, { status: 502 });
  }
}
