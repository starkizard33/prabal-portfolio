/**
 * Clean race-core helpers.
 * Lap model follows common open-source 2D racers (ordered spatial gates + SF):
 * pass S1→S2→… then cross start/finish. Physics stay free; soft walls only.
 */

export type TrackPt = { x: number; y: number; label?: string };

export type Gate = {
  index: number;
  x: number;
  y: number;
  radius: number;
  /** Unit tangent of ribbon at gate (for optional wrong-way hints). */
  tx: number;
  ty: number;
};

export type LapState = {
  /** Next gate index to hit (0 = SF). */
  nextIndex: number;
  completedLaps: number;
  /** Edge-trigger: must leave SF before it can count again. */
  sfLatched: boolean;
};

export function isClosed(pts: TrackPt[], eps = 4): boolean {
  if (pts.length < 3) return false;
  const a = pts[0];
  const b = pts[pts.length - 1];
  return Math.hypot(a.x - b.x, a.y - b.y) < eps;
}

export function ensureClosed(pts: TrackPt[]): TrackPt[] {
  if (pts.length < 2) return pts;
  if (isClosed(pts)) return pts;
  const first = pts[0];
  return [...pts, { x: first.x, y: first.y }];
}

export function polylineLength(pts: TrackPt[]): number {
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

function lerp(a: TrackPt, b: TrackPt, u: number): TrackPt {
  return { x: a.x + (b.x - a.x) * u, y: a.y + (b.y - a.y) * u };
}

function sampleQuad(p0: TrackPt, cp: TrackPt, p2: TrackPt, t: number): TrackPt {
  const omt = 1 - t;
  return {
    x: omt * omt * p0.x + 2 * omt * t * cp.x + t * t * p2.x,
    y: omt * omt * p0.y + 2 * omt * t * cp.y + t * t * p2.y,
  };
}

/** Smooth paint/physics ribbon from control points. */
export function densifySmoothPath(raw: TrackPt[], samplesPerCurve = 10): TrackPt[] {
  const pts = ensureClosed(raw);
  if (pts.length < 2) return pts.map((p) => ({ x: p.x, y: p.y }));
  if (pts.length === 2) return [{ x: pts[0].x, y: pts[0].y }, { x: pts[1].x, y: pts[1].y }];

  const out: TrackPt[] = [{ x: pts[0].x, y: pts[0].y }];
  let current: TrackPt = out[0];

  for (let i = 1; i < pts.length - 1; i += 1) {
    const end = {
      x: (pts[i].x + pts[i + 1].x) / 2,
      y: (pts[i].y + pts[i + 1].y) / 2,
    };
    for (let s = 1; s <= samplesPerCurve; s += 1) {
      out.push(sampleQuad(current, pts[i], end, s / samplesPerCurve));
    }
    current = end;
  }

  const last = pts[pts.length - 1];
  const straightSteps = Math.max(2, samplesPerCurve);
  for (let s = 1; s <= straightSteps; s += 1) {
    out.push(lerp(current, last, s / straightSteps));
  }

  const cleaned: TrackPt[] = [out[0]];
  for (let i = 1; i < out.length; i += 1) {
    const prev = cleaned[cleaned.length - 1];
    if (Math.hypot(out[i].x - prev.x, out[i].y - prev.y) > 0.4) {
      cleaned.push(out[i]);
    }
  }
  return cleaned;
}

export function samplePath(pts: TrackPt[], t: number) {
  const total = polylineLength(pts);
  if (total <= 0) {
    const p = pts[0] ?? { x: 0, y: 0 };
    return { x: p.x, y: p.y, angle: 0, tx: 1, ty: 0 };
  }
  let dist = ((((t % 1) + 1) % 1) * total);
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist <= seg) {
      const u = seg === 0 ? 0 : dist / seg;
      const tx = seg === 0 ? 1 : (b.x - a.x) / seg;
      const ty = seg === 0 ? 0 : (b.y - a.y) / seg;
      return {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
        angle: Math.atan2(ty, tx),
        tx,
        ty,
      };
    }
    dist -= seg;
  }
  const last = pts[pts.length - 1];
  const prev = pts[pts.length - 2] ?? last;
  const seg = Math.hypot(last.x - prev.x, last.y - prev.y) || 1;
  const tx = (last.x - prev.x) / seg;
  const ty = (last.y - prev.y) / seg;
  return { x: last.x, y: last.y, angle: Math.atan2(ty, tx), tx, ty };
}

/**
 * Nearest point on densified polyline (simple, stable for soft walls).
 * Prefer caching if hot — ribbon length is small (~100–200 pts).
 */
export function nearestOnTrack(
  pts: TrackPt[],
  px: number,
  py: number,
): { x: number; y: number; dist: number; tx: number; ty: number; t: number } {
  let bestDist = Infinity;
  let bestX = px;
  let bestY = py;
  let bestTx = 1;
  let bestTy = 0;
  let bestAlong = 0;
  let along = 0;
  const total = Math.max(1, polylineLength(pts));

  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const abx = b.x - a.x;
    const aby = b.y - a.y;
    const seg = Math.hypot(abx, aby) || 1;
    const u = Math.max(0, Math.min(1, ((px - a.x) * abx + (py - a.y) * aby) / (seg * seg)));
    const cx = a.x + abx * u;
    const cy = a.y + aby * u;
    const d = Math.hypot(px - cx, py - cy);
    if (d < bestDist) {
      bestDist = d;
      bestX = cx;
      bestY = cy;
      bestTx = abx / seg;
      bestTy = aby / seg;
      bestAlong = along + seg * u;
    }
    along += seg;
  }

  return {
    x: bestX,
    y: bestY,
    dist: bestDist,
    tx: bestTx,
    ty: bestTy,
    t: bestAlong / total,
  };
}

/** Ordered gates along the ribbon. Index 0 = start/finish. */
export function buildGates(path: TrackPt[], count = 5, radius = 52): Gate[] {
  const n = Math.max(3, Math.floor(count));
  const gates: Gate[] = [];
  for (let i = 0; i < n; i += 1) {
    const pose = samplePath(path, i / n);
    gates.push({
      index: i,
      x: pose.x,
      y: pose.y,
      radius,
      tx: pose.tx,
      ty: pose.ty,
    });
  }
  return gates;
}

export function initialLapState(): LapState {
  return { nextIndex: 1, completedLaps: 0, sfLatched: true };
}

/**
 * Spatial ordered gates (Speed Racer–style).
 * Only the *next* gate can be cleared. SF (0) needs all sectors first and an edge re-enter.
 */
export function updateLapGates(
  state: LapState,
  gates: Gate[],
  px: number,
  py: number,
): { state: LapState; lapCompleted: boolean; hitIndex: number | null } {
  if (gates.length < 3) {
    return { state, lapCompleted: false, hitIndex: null };
  }

  // Edge-trigger: always clear latch once the car leaves SF, regardless of next gate.
  const sf = gates[0];
  const outsideSf = Math.hypot(sf.x - px, sf.y - py) > sf.radius;
  let cur = state;
  if (cur.sfLatched && outsideSf) {
    cur = { ...cur, sfLatched: false };
  }

  const target = gates[cur.nextIndex];
  const dist = Math.hypot(target.x - px, target.y - py);
  const inside = dist <= target.radius;

  if (target.index === 0) {
    if (!inside) {
      return { state: cur, lapCompleted: false, hitIndex: null };
    }
    if (cur.sfLatched) {
      return { state: cur, lapCompleted: false, hitIndex: null };
    }
    // Crossed SF after leaving it, with all sectors done (next was 0).
    return {
      state: {
        nextIndex: 1,
        completedLaps: cur.completedLaps + 1,
        sfLatched: true,
      },
      lapCompleted: true,
      hitIndex: 0,
    };
  }

  if (!inside) {
    return { state: cur, lapCompleted: false, hitIndex: null };
  }

  const nextIndex = (target.index + 1) % gates.length;
  return {
    state: {
      ...cur,
      nextIndex,
    },
    lapCompleted: false,
    hitIndex: target.index,
  };
}

export function isWrongWay(
  speed: number,
  angle: number,
  tx: number,
  ty: number,
): boolean {
  if (speed < 0.8) return false;
  return Math.cos(angle) * tx + Math.sin(angle) * ty < -0.35;
}
