"use client";

import { useCallback, useEffect, useRef, useState } from "react";

const W = 860;
const H = 560;
const LAPS = 5;
const TRACK_HALF = 40;
/** Throttle / coast / brake feel — deliberately gradual. */
const ACCEL = 0.085;
const COAST = 0.991;
const BRAKE = 0.2;
const MAX_SPEED = 5.6;
const LIGHT_INTERVAL_MS = 700;

type Pt = { x: number; y: number; label?: string };

type Layout = {
  id: string;
  name: string;
  blurb: string;
  points: Pt[];
};

const LAYOUTS: Layout[] = [
  {
    id: "red-bull-ring",
    name: "Red Bull Ring",
    blurb: "Spielberg fan layout — climb to T3, dive through the complex.",
    points: [
      { x: 200, y: 468 },
      { x: 310, y: 470 },
      { x: 430, y: 468 },
      { x: 540, y: 458 },
      { x: 620, y: 440, label: "T1 · Lauda" },
      { x: 655, y: 400 },
      { x: 665, y: 350 },
      { x: 655, y: 300, label: "T2 · Münzer" },
      { x: 670, y: 240 },
      { x: 700, y: 175 },
      { x: 730, y: 125 },
      { x: 745, y: 88, label: "T3" },
      { x: 700, y: 68 },
      { x: 640, y: 72 },
      { x: 585, y: 95, label: "T4 · Rauch" },
      { x: 530, y: 130 },
      { x: 490, y: 165, label: "T5" },
      { x: 445, y: 195 },
      { x: 390, y: 210, label: "T6" },
      { x: 330, y: 200 },
      { x: 280, y: 175, label: "T7 · Graz" },
      { x: 235, y: 175 },
      { x: 195, y: 205, label: "T8" },
      { x: 160, y: 255 },
      { x: 140, y: 320, label: "T9 · Rindt" },
      { x: 145, y: 380 },
      { x: 165, y: 430, label: "T10" },
      { x: 200, y: 468 },
    ],
  },
  {
    id: "figure-eight",
    name: "Figure Eight",
    blurb: "Overlapping loops with a neon crossing — commit or clip.",
    points: [
      { x: 430, y: 280 },
      { x: 520, y: 200 },
      { x: 640, y: 150 },
      { x: 740, y: 180 },
      { x: 780, y: 260 },
      { x: 750, y: 340 },
      { x: 660, y: 390 },
      { x: 540, y: 370 },
      { x: 430, y: 280, label: "X" },
      { x: 320, y: 200 },
      { x: 200, y: 150 },
      { x: 100, y: 180 },
      { x: 70, y: 260 },
      { x: 100, y: 350 },
      { x: 200, y: 400 },
      { x: 320, y: 370 },
      { x: 430, y: 280 },
    ],
  },
  {
    id: "hairpin-alley",
    name: "Hairpin Alley",
    blurb: "Tight mountain switchbacks — brake late, turn early.",
    points: [
      { x: 120, y: 480 },
      { x: 280, y: 490 },
      { x: 420, y: 470 },
      { x: 520, y: 430, label: "H1" },
      { x: 480, y: 360 },
      { x: 360, y: 340 },
      { x: 260, y: 300, label: "H2" },
      { x: 300, y: 230 },
      { x: 420, y: 210 },
      { x: 540, y: 190, label: "H3" },
      { x: 620, y: 150 },
      { x: 700, y: 120 },
      { x: 760, y: 160, label: "Peak" },
      { x: 720, y: 230 },
      { x: 640, y: 280 },
      { x: 560, y: 340, label: "H4" },
      { x: 620, y: 400 },
      { x: 700, y: 450 },
      { x: 620, y: 500 },
      { x: 480, y: 520 },
      { x: 300, y: 510 },
      { x: 160, y: 490 },
      { x: 120, y: 480 },
    ],
  },
  {
    id: "speed-bowl",
    name: "Speed Bowl",
    blurb: "Fast oval banking vibes with a nasty mid-sector chicane.",
    points: [
      { x: 180, y: 420 },
      { x: 300, y: 460 },
      { x: 430, y: 470 },
      { x: 560, y: 460 },
      { x: 680, y: 420 },
      { x: 760, y: 340 },
      { x: 780, y: 260 },
      { x: 740, y: 180 },
      { x: 640, y: 130 },
      { x: 520, y: 110 },
      { x: 430, y: 140, label: "Chicane" },
      { x: 380, y: 190 },
      { x: 430, y: 230 },
      { x: 500, y: 210 },
      { x: 400, y: 160 },
      { x: 280, y: 120 },
      { x: 160, y: 140 },
      { x: 90, y: 200 },
      { x: 70, y: 290 },
      { x: 100, y: 370 },
      { x: 180, y: 420 },
    ],
  },
];

type Phase = "select" | "draw" | "race";

type GhostSample = { t: number; x: number; y: number; angle: number };

function ensureClosed(pts: Pt[]): Pt[] {
  if (pts.length < 2) return pts;
  const first = pts[0];
  const last = pts[pts.length - 1];
  if (Math.hypot(first.x - last.x, first.y - last.y) < 4) return pts;
  return [...pts, { x: first.x, y: first.y }];
}

function polylineLength(pts: Pt[]) {
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

function samplePath(pts: Pt[], t: number) {
  const total = polylineLength(pts);
  if (total <= 0) {
    const p = pts[0] ?? { x: W / 2, y: H / 2 };
    return { x: p.x, y: p.y, angle: 0 };
  }
  let dist = ((((t % 1) + 1) % 1) * total);
  for (let i = 1; i < pts.length; i += 1) {
    const a = pts[i - 1];
    const b = pts[i];
    const seg = Math.hypot(b.x - a.x, b.y - a.y);
    if (dist <= seg) {
      const u = seg === 0 ? 0 : dist / seg;
      return {
        x: a.x + (b.x - a.x) * u,
        y: a.y + (b.y - a.y) * u,
        angle: Math.atan2(b.y - a.y, b.x - a.x),
      };
    }
    dist -= seg;
  }
  const last = pts[pts.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
}

function closestProgress(pts: Pt[], px: number, py: number) {
  let best = 0;
  let bestDist = Infinity;
  const steps = 360;
  for (let i = 0; i < steps; i += 1) {
    const t = i / steps;
    const p = samplePath(pts, t);
    const d = Math.hypot(p.x - px, p.y - py);
    if (d < bestDist) {
      bestDist = d;
      best = t;
    }
  }
  return { t: best, dist: bestDist };
}

function drawSmoothTrack(
  draw: CanvasRenderingContext2D,
  pts: Pt[],
  width: number,
  color: string,
  dash?: number[],
) {
  if (pts.length < 2) return;
  draw.strokeStyle = color;
  draw.lineWidth = width;
  draw.lineJoin = "round";
  draw.lineCap = "round";
  if (dash) draw.setLineDash(dash);
  draw.beginPath();
  draw.moveTo(pts[0].x, pts[0].y);
  for (let i = 1; i < pts.length - 1; i += 1) {
    const midX = (pts[i].x + pts[i + 1].x) / 2;
    const midY = (pts[i].y + pts[i + 1].y) / 2;
    draw.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
  }
  const last = pts[pts.length - 1];
  draw.lineTo(last.x, last.y);
  draw.stroke();
  draw.setLineDash([]);
}

function drawBackdrop(draw: CanvasRenderingContext2D) {
  const sky = draw.createLinearGradient(0, 0, 0, H);
  sky.addColorStop(0, "#152018");
  sky.addColorStop(0.45, "#0c1412");
  sky.addColorStop(1, "#070b10");
  draw.fillStyle = sky;
  draw.fillRect(0, 0, W, H);

  draw.fillStyle = "rgba(40, 70, 48, 0.35)";
  draw.beginPath();
  draw.moveTo(0, 220);
  draw.quadraticCurveTo(200, 120, 420, 160);
  draw.quadraticCurveTo(640, 90, W, 140);
  draw.lineTo(W, H);
  draw.lineTo(0, H);
  draw.fill();
}

function drawTrackScene(
  draw: CanvasRenderingContext2D,
  pts: Pt[],
  showLabels = true,
) {
  drawBackdrop(draw);
  if (pts.length < 2) return;

  draw.shadowColor = "rgba(255,107,44,0.22)";
  draw.shadowBlur = 18;
  drawSmoothTrack(draw, pts, TRACK_HALF * 2 + 12, "rgba(255,107,44,0.55)");
  draw.shadowBlur = 0;
  drawSmoothTrack(draw, pts, TRACK_HALF * 2, "rgba(28, 32, 36, 0.98)");
  drawSmoothTrack(draw, pts, 1.5, "rgba(240,196,92,0.4)", [7, 9]);

  const sf = samplePath(pts, 0.01);
  draw.save();
  draw.translate(sf.x, sf.y);
  draw.rotate(sf.angle);
  for (let i = -5; i < 6; i += 1) {
    draw.fillStyle = i % 2 === 0 ? "#f3f5f8" : "#12151c";
    draw.fillRect(-7, i * 5 - 2, 14, 5);
  }
  draw.restore();

  if (showLabels) {
    draw.fillStyle = "rgba(215,231,223,0.55)";
    draw.font = "10px ui-monospace, monospace";
    for (const p of pts) {
      if (p.label) draw.fillText(p.label, p.x + 8, p.y - 8);
    }
  }
}

export function CircuitRace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const drawCanvasRef = useRef<HTMLCanvasElement>(null);
  const [phase, setPhase] = useState<Phase>("select");
  const [activeLayout, setActiveLayout] = useState<Layout | null>(null);
  const [runId, setRunId] = useState(0);
  const [drawPts, setDrawPts] = useState<Pt[]>([]);
  const [hud, setHud] = useState({
    lap: 1,
    time: 0,
    best: null as number | null,
    status: "Press Enter for lights out",
    finished: false,
    lights: 0,
    dimmed: true,
    awaitingEnter: true,
  });

  const keys = useRef({ up: false, down: false, left: false, right: false });
  const ghostByLayout = useRef<Record<string, GhostSample[]>>({});
  const bestByLayout = useRef<Record<string, number | null>>({});

  const startPreset = (layout: Layout) => {
    setActiveLayout(layout);
    setPhase("race");
    setRunId((n) => n + 1);
  };

  const startCustom = () => {
    setDrawPts([]);
    setPhase("draw");
  };

  const changeLayout = () => {
    setPhase("select");
    setActiveLayout(null);
  };

  const paintDrawPreview = useCallback((pts: Pt[]) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    drawBackdrop(ctx);
    if (pts.length === 0) {
      ctx.fillStyle = "rgba(215,231,223,0.5)";
      ctx.font = "14px ui-monospace, monospace";
      ctx.fillText("Click to place centerline points (min 6)", 24, 36);
      return;
    }
    ctx.strokeStyle = "rgba(255,107,44,0.85)";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i += 1) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    // preview corridor width
    ctx.strokeStyle = "rgba(255,107,44,0.18)";
    ctx.lineWidth = TRACK_HALF * 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(pts[0].x, pts[0].y);
    for (let i = 1; i < pts.length; i += 1) {
      ctx.lineTo(pts[i].x, pts[i].y);
    }
    ctx.stroke();

    for (let i = 0; i < pts.length; i += 1) {
      const p = pts[i];
      ctx.fillStyle = i === 0 ? "#ff6b2c" : "#f0c45c";
      ctx.beginPath();
      ctx.arc(p.x, p.y, i === 0 ? 6 : 4, 0, Math.PI * 2);
      ctx.fill();
    }

    ctx.fillStyle = "rgba(215,231,223,0.55)";
    ctx.font = "12px ui-monospace, monospace";
    ctx.fillText(`${pts.length} points · min 6 to race`, 24, 36);
  }, []);

  useEffect(() => {
    if (phase === "draw") paintDrawPreview(drawPts);
  }, [phase, drawPts, paintDrawPreview]);

  const onDrawClick = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = drawCanvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    const x = (e.clientX - rect.left) * scaleX;
    const y = (e.clientY - rect.top) * scaleY;
    setDrawPts((prev) => [...prev, { x, y }]);
  };

  const closeAndRace = () => {
    if (drawPts.length < 6) return;
    const closed = ensureClosed(drawPts);
    const custom: Layout = {
      id: `custom-${Date.now()}`,
      name: "Custom Circuit",
      blurb: "Your drawn centerline.",
      points: closed,
    };
    setActiveLayout(custom);
    setPhase("race");
    setRunId((n) => n + 1);
  };

  useEffect(() => {
    if (phase !== "race" || !activeLayout) return;
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const maybeCtx = canvasEl.getContext("2d");
    if (!maybeCtx) return;
    const draw: CanvasRenderingContext2D = maybeCtx;
    const path = activeLayout.points;
    const layoutKey = activeLayout.id;

    type RaceStage = "awaiting" | "lights" | "racing" | "finished";

    const startPose = samplePath(path, 0.01);
    const car = {
      x: startPose.x,
      y: startPose.y,
      angle: startPose.angle,
      speed: 0,
      lastProgress: 0.01,
      lap: 1,
      start: 0,
    };
    const recording: GhostSample[] = [];
    const sparks: { x: number; y: number; life: number; vx: number; vy: number }[] =
      [];
    let stage: RaceStage = "awaiting";
    let lightsOn = 0;
    let lightTimer = 0;
    let goFlash = 0;
    const ghost = ghostByLayout.current[layoutKey] ?? [];
    const best = bestByLayout.current[layoutKey] ?? null;

    setHud({
      lap: 1,
      time: 0,
      finished: false,
      status: "Press Enter — five red lights, then lights out",
      best,
      lights: 0,
      dimmed: true,
      awaitingEnter: true,
    });

    function resetOnGrid() {
      const pose = samplePath(path, 0.01);
      car.x = pose.x;
      car.y = pose.y;
      car.angle = pose.angle;
      car.speed = 0;
      car.lastProgress = 0.01;
      car.lap = 1;
      car.start = 0;
      recording.length = 0;
      sparks.length = 0;
      lightsOn = 0;
      lightTimer = 0;
      goFlash = 0;
      keys.current = { up: false, down: false, left: false, right: false };
    }

    function beginLights() {
      resetOnGrid();
      stage = "lights";
      setHud({
        lap: 1,
        time: 0,
        finished: false,
        status: "Lights…",
        best: bestByLayout.current[layoutKey] ?? null,
        lights: 0,
        dimmed: false,
        awaitingEnter: false,
      });
    }

    function onKey(e: KeyboardEvent, down: boolean) {
      if (down && (e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter")) {
        if (stage === "awaiting") {
          e.preventDefault();
          beginLights();
          return;
        }
        if (stage === "finished") {
          e.preventDefault();
          stage = "awaiting";
          resetOnGrid();
          setHud({
            lap: 1,
            time: 0,
            finished: false,
            status: "Press Enter — five red lights, then lights out",
            best: bestByLayout.current[layoutKey] ?? null,
            lights: 0,
            dimmed: true,
            awaitingEnter: true,
          });
          return;
        }
      }

      const map: Record<string, keyof typeof keys.current> = {
        ArrowUp: "up",
        ArrowDown: "down",
        ArrowLeft: "left",
        ArrowRight: "right",
        w: "up",
        W: "up",
        s: "down",
        S: "down",
        a: "left",
        A: "left",
        d: "right",
        D: "right",
      };
      const k = map[e.key];
      if (k) {
        if (stage !== "racing") {
          if (down) e.preventDefault();
          return;
        }
        keys.current[k] = down;
        e.preventDefault();
      }
    }
    const keyDown = (e: KeyboardEvent) => onKey(e, true);
    const keyUp = (e: KeyboardEvent) => onKey(e, false);
    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);

    let raf = 0;
    let last = performance.now();
    let hudTick = 0;

    function spawnSparks(x: number, y: number, angle: number) {
      for (let i = 0; i < 8; i += 1) {
        const a = angle + Math.PI + (Math.random() - 0.5) * 1.4;
        const sp = 1.5 + Math.random() * 3;
        sparks.push({
          x,
          y,
          life: 10 + Math.random() * 8,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
        });
      }
    }

    function drawLightsOverlay(count: number, extinguishing: boolean) {
      const panelW = 280;
      const panelH = 56;
      const cx = W / 2;
      const cy = H * 0.22;
      draw.fillStyle = "rgba(8,10,14,0.78)";
      draw.beginPath();
      const x0 = cx - panelW / 2;
      const y0 = cy - panelH / 2;
      const r = 12;
      draw.moveTo(x0 + r, y0);
      draw.arcTo(x0 + panelW, y0, x0 + panelW, y0 + panelH, r);
      draw.arcTo(x0 + panelW, y0 + panelH, x0, y0 + panelH, r);
      draw.arcTo(x0, y0 + panelH, x0, y0, r);
      draw.arcTo(x0, y0, x0 + panelW, y0, r);
      draw.closePath();
      draw.fill();
      const gap = 46;
      const startX = cx - gap * 2;
      for (let i = 0; i < 5; i += 1) {
        const lit = !extinguishing && i < count;
        draw.beginPath();
        draw.fillStyle = lit ? "#e10600" : "rgba(60,20,20,0.85)";
        draw.shadowColor = lit ? "rgba(225,6,0,0.85)" : "transparent";
        draw.shadowBlur = lit ? 16 : 0;
        draw.arc(startX + i * gap, cy, 14, 0, Math.PI * 2);
        draw.fill();
      }
      draw.shadowBlur = 0;
    }

    function frame(now: number) {
      const dtMs = Math.min(32, now - last);
      const dt = dtMs / 16.67;
      last = now;

      if (stage === "lights") {
        lightTimer += dtMs;
        while (lightTimer >= LIGHT_INTERVAL_MS && lightsOn < 5) {
          lightTimer -= LIGHT_INTERVAL_MS;
          lightsOn += 1;
          setHud((h) => ({
            ...h,
            lights: lightsOn,
            status: lightsOn < 5 ? `Lights ${lightsOn} / 5` : "Lights out…",
            dimmed: false,
            awaitingEnter: false,
          }));
        }
        if (lightsOn >= 5 && lightTimer >= LIGHT_INTERVAL_MS) {
          stage = "racing";
          car.start = now;
          goFlash = 18;
          setHud({
            lap: 1,
            time: 0,
            finished: false,
            status: `Lap 1 / ${LAPS}`,
            best: bestByLayout.current[layoutKey] ?? null,
            lights: 0,
            dimmed: false,
            awaitingEnter: false,
          });
        }
      }

      if (stage === "racing") {
        if (keys.current.up) car.speed += ACCEL * dt;
        if (keys.current.down) car.speed -= BRAKE * dt;
        if (keys.current.left) {
          car.angle -= 0.048 * dt * (0.48 + Math.abs(car.speed) * 0.11);
        }
        if (keys.current.right) {
          car.angle += 0.048 * dt * (0.48 + Math.abs(car.speed) * 0.11);
        }
        car.speed *= COAST;
        car.speed = Math.max(-2.2, Math.min(MAX_SPEED, car.speed));
        car.x += Math.cos(car.angle) * car.speed * dt;
        car.y += Math.sin(car.angle) * car.speed * dt;

        const near = closestProgress(path, car.x, car.y);
        if (near.dist > TRACK_HALF + 4) {
          const snap = samplePath(path, near.t);
          const factor = 0.28 + Math.random() * 0.08;
          if (Math.abs(car.speed) > 1.2) {
            spawnSparks(car.x, car.y, car.angle);
          }
          car.speed *= factor;
          car.x += (snap.x - car.x) * 0.22;
          car.y += (snap.y - car.y) * 0.22;
        }

        const delta = near.t - car.lastProgress;
        if (delta < -0.55) {
          car.lap += 1;
          if (car.lap > LAPS) {
            stage = "finished";
            const elapsed = (now - car.start) / 1000;
            const prevBest = bestByLayout.current[layoutKey] ?? null;
            bestByLayout.current[layoutKey] =
              prevBest === null ? elapsed : Math.min(prevBest, elapsed);
            ghostByLayout.current[layoutKey] = [...recording];
            setHud({
              lap: LAPS,
              time: elapsed,
              best: bestByLayout.current[layoutKey] ?? null,
              finished: true,
              status: `Chequered — ${elapsed.toFixed(2)}s · Press Enter`,
              lights: 0,
              dimmed: true,
              awaitingEnter: true,
            });
          }
        }
        if (delta > -0.4) car.lastProgress = near.t;

        recording.push({
          t: now - car.start,
          x: car.x,
          y: car.y,
          angle: car.angle,
        });

        hudTick += 1;
        if (stage === "racing" && hudTick % 6 === 0) {
          setHud({
            lap: Math.min(car.lap, LAPS),
            time: (now - car.start) / 1000,
            best: bestByLayout.current[layoutKey] ?? null,
            finished: false,
            status: `Lap ${Math.min(car.lap, LAPS)} / ${LAPS}`,
            lights: 0,
            dimmed: false,
            awaitingEnter: false,
          });
        }
      }

      for (let i = sparks.length - 1; i >= 0; i -= 1) {
        const s = sparks[i];
        s.x += s.vx * dt;
        s.y += s.vy * dt;
        s.life -= dt;
        if (s.life <= 0) sparks.splice(i, 1);
      }

      drawTrackScene(draw, path);

      if (ghost.length > 1 && (stage === "racing" || stage === "finished")) {
        const elapsed =
          stage === "racing" || stage === "finished"
            ? Math.max(0, now - (car.start || now))
            : 0;
        let gi = 0;
        while (gi < ghost.length - 1 && ghost[gi + 1].t < elapsed) {
          gi += 1;
        }
        const gh = ghost[gi];
        draw.save();
        draw.translate(gh.x, gh.y);
        draw.rotate(gh.angle);
        draw.globalAlpha = 0.35;
        draw.fillStyle = "#3dff9a";
        draw.fillRect(-10, -5, 20, 10);
        draw.restore();
      }

      for (const s of sparks) {
        draw.globalAlpha = Math.min(1, s.life / 10);
        draw.fillStyle = "#ffb347";
        draw.beginPath();
        draw.arc(s.x, s.y, 2.2, 0, Math.PI * 2);
        draw.fill();
        draw.globalAlpha = 1;
      }

      draw.save();
      draw.translate(car.x, car.y);
      draw.rotate(car.angle);
      draw.fillStyle = "#1e41ff";
      draw.shadowColor = "rgba(30,65,255,0.55)";
      draw.shadowBlur = 12;
      draw.fillRect(-13, -6, 26, 12);
      draw.fillStyle = "#ff6b2c";
      draw.fillRect(7, -4, 7, 8);
      draw.restore();

      if (stage === "awaiting" || stage === "finished") {
        draw.fillStyle = "rgba(4, 8, 12, 0.62)";
        draw.fillRect(0, 0, W, H);
        draw.fillStyle = "rgba(243,245,248,0.92)";
        draw.font = "600 22px Syne, system-ui, sans-serif";
        draw.textAlign = "center";
        draw.fillText(
          stage === "finished" ? "Chequered flag" : "On the grid",
          W / 2,
          H * 0.42,
        );
        draw.font = "14px ui-monospace, monospace";
        draw.fillStyle = "rgba(240,196,92,0.95)";
        draw.fillText("Press Enter", W / 2, H * 0.42 + 34);
        if (stage === "finished") {
          draw.fillStyle = "rgba(215,231,223,0.65)";
          draw.fillText(
            `Ghost armed · next run is ${LAPS} laps`,
            W / 2,
            H * 0.42 + 58,
          );
        }
        draw.textAlign = "left";
      }

      if (stage === "lights") {
        draw.fillStyle = "rgba(4, 8, 12, 0.28)";
        draw.fillRect(0, 0, W, H);
        drawLightsOverlay(lightsOn, false);
      }

      if (goFlash > 0) {
        goFlash -= dt;
        draw.fillStyle = `rgba(61,255,154,${Math.min(0.35, goFlash / 40)})`;
        draw.fillRect(0, 0, W, H);
        draw.fillStyle = "rgba(243,245,248,0.95)";
        draw.font = "700 28px Syne, system-ui, sans-serif";
        draw.textAlign = "center";
        draw.fillText("LIGHTS OUT", W / 2, H * 0.28);
        draw.textAlign = "left";
      }

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [runId, phase, activeLayout]);

  useEffect(() => {
    if (phase === "race") {
      canvasRef.current?.focus();
    }
  }, [phase, runId]);

  if (phase === "select") {
    return (
      <div className="space-y-5">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-ember/80">
            Choose circuit
          </p>
          <p className="mt-1 text-sm text-sz-mist/70">
            Four presets or sketch your own — 5 laps, lights-out start, ghost.
          </p>
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          {LAYOUTS.map((layout) => (
            <button
              key={layout.id}
              type="button"
              onClick={() => startPreset(layout)}
              className="rounded-2xl border border-sz-ember/25 bg-sz-void/80 p-4 text-left transition hover:border-sz-ember/60 hover:bg-sz-ember/10"
            >
              <p className="font-semibold text-sz-mist">{layout.name}</p>
              <p className="mt-1 text-xs text-sz-mist/55">{layout.blurb}</p>
            </button>
          ))}
          <button
            type="button"
            onClick={startCustom}
            className="rounded-2xl border border-dashed border-sz-gold/40 bg-sz-void/60 p-4 text-left transition hover:border-sz-gold/70 hover:bg-sz-gold/10 sm:col-span-2"
          >
            <p className="font-semibold text-sz-gold">Draw your own</p>
            <p className="mt-1 text-xs text-sz-mist/55">
              Click points on the canvas, close the loop, race the same
              physics.
            </p>
          </button>
        </div>
      </div>
    );
  }

  if (phase === "draw") {
    return (
      <div className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-ember/80">
              Draw centerline
            </p>
            <p className="mt-1 text-sm text-sz-mist/70">
              Click to add points · undo / clear · close &amp; race
            </p>
          </div>
          <button
            type="button"
            onClick={changeLayout}
            className="rounded-full border border-sz-mist/25 px-4 py-2 text-xs text-sz-mist/70 transition hover:border-sz-ember/50 hover:text-sz-ember"
          >
            Change layout
          </button>
        </div>
        <canvas
          ref={drawCanvasRef}
          width={W}
          height={H}
          onClick={onDrawClick}
          className="w-full cursor-crosshair rounded-2xl border border-sz-ember/30 bg-sz-void shadow-[0_0_40px_rgba(255,107,44,0.1)]"
          aria-label="Draw custom track centerline"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setDrawPts((p) => p.slice(0, -1))}
            disabled={drawPts.length === 0}
            className="rounded-full border border-sz-mist/25 px-4 py-2 text-sm text-sz-mist/80 disabled:opacity-40"
          >
            Undo last
          </button>
          <button
            type="button"
            onClick={() => setDrawPts([])}
            disabled={drawPts.length === 0}
            className="rounded-full border border-sz-mist/25 px-4 py-2 text-sm text-sz-mist/80 disabled:opacity-40"
          >
            Clear
          </button>
          <button
            type="button"
            onClick={closeAndRace}
            disabled={drawPts.length < 6}
            className="rounded-full bg-sz-ember px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold disabled:opacity-40"
          >
            Close &amp; race
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-ember/80">
            {activeLayout?.name ?? "Circuit"} · Neon Void
          </p>
          <p className="mt-1 text-sm text-sz-mist/70">{hud.status}</p>
        </div>
        <div className="flex flex-wrap items-end gap-4">
          <div className="text-right font-mono text-sm text-sz-mist/70">
            <div>
              Time <span className="text-sz-gold">{hud.time.toFixed(2)}s</span>
            </div>
            <div>
              Lap{" "}
              <span className="text-sz-jade">
                {hud.lap}/{LAPS}
              </span>
              {hud.best !== null ? (
                <span className="ml-3 text-sz-mist/45">
                  PB {hud.best.toFixed(2)}s
                </span>
              ) : null}
            </div>
          </div>
          <button
            type="button"
            onClick={changeLayout}
            className="rounded-full border border-sz-mist/25 px-4 py-2 text-xs text-sz-mist/70 transition hover:border-sz-ember/50 hover:text-sz-ember"
          >
            Change layout
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        tabIndex={0}
        className="w-full rounded-2xl border border-sz-ember/30 bg-sz-void shadow-[0_0_40px_rgba(255,107,44,0.1)] outline-none focus:border-sz-gold/50"
        aria-label={`${activeLayout?.name ?? "Circuit"} track`}
      />
      <p className="text-xs text-sz-mist/40">
        {hud.awaitingEnter
          ? "Screen dims · Press Enter for the five-light start (timer begins on lights out)."
          : `5 laps · gentler throttle · wall hits dump speed · ▲/W gas · ▼/S brake.`}
      </p>
    </div>
  );
}
