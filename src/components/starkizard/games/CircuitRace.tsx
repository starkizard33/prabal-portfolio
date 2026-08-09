"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { fireConfetti } from "@/components/fx/confetti";
import {
  densifySmoothPath,
  ensureClosed,
  samplePath,
  nearestOnTrack,
  buildGates,
  initialLapState,
  updateLapGates,
  isWrongWay,
  type TrackPt,
  type Gate,
  type LapState,
} from "@/components/starkizard/games/circuitTrack";

const W = 860;
const H = 560;
const LAPS = 3;
const TRACK_HALF = 42;
const ACCEL = 0.098;
const COAST = 0.991;
const BRAKE = 0.2;
const MAX_SPEED = 5.85;
const LIGHT_INTERVAL_MS = 700;

type Pt = TrackPt;

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
    blurb: "Fast oval — then a tight left-right-left chicane before the exit.",
    points: [
      { x: 180, y: 420 },
      { x: 300, y: 460 },
      { x: 430, y: 470 },
      { x: 560, y: 460 },
      { x: 680, y: 420 },
      { x: 760, y: 340 },
      { x: 780, y: 260 },
      { x: 760, y: 185 },
      { x: 700, y: 140 },
      { x: 640, y: 122 },
      // Twistier chicane (travel is right → left along the top)
      { x: 600, y: 120 },
      { x: 575, y: 175, label: "Chi 1" },
      { x: 545, y: 185 },
      { x: 515, y: 120, label: "Chi 2" },
      { x: 485, y: 110 },
      { x: 455, y: 175, label: "Chi 3" },
      { x: 425, y: 185 },
      { x: 395, y: 125 },
      { x: 360, y: 118 },
      { x: 280, y: 125 },
      { x: 190, y: 150 },
      { x: 105, y: 205 },
      { x: 70, y: 290 },
      { x: 100, y: 370 },
      { x: 180, y: 420 },
    ],
  },
];

type Phase = "select" | "draw" | "race";

type GhostSample = { t: number; x: number; y: number; angle: number };

function drawPolylineTrack(
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
  for (let i = 1; i < pts.length; i += 1) {
    draw.lineTo(pts[i].x, pts[i].y);
  }
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
  controlPts: Pt[],
  gates: Gate[] = [],
  nextGate = 1,
  showLabels = true,
) {
  drawBackdrop(draw);
  if (controlPts.length < 2) return;

  const road = densifySmoothPath(controlPts);
  draw.shadowColor = "rgba(255,107,44,0.22)";
  draw.shadowBlur = 18;
  drawPolylineTrack(draw, road, TRACK_HALF * 2 + 12, "rgba(255,107,44,0.55)");
  draw.shadowBlur = 0;
  drawPolylineTrack(draw, road, TRACK_HALF * 2, "rgba(28, 32, 36, 0.98)");
  drawPolylineTrack(draw, road, 1.5, "rgba(240,196,92,0.4)", [7, 9]);

  for (const gate of gates) {
    const isNext = gate.index === nextGate;
    const isSf = gate.index === 0;
    draw.beginPath();
    draw.arc(gate.x, gate.y, isSf ? 10 : 7, 0, Math.PI * 2);
    draw.strokeStyle = isNext
      ? "rgba(61,255,154,0.95)"
      : isSf
        ? "rgba(243,245,248,0.55)"
        : "rgba(240,196,92,0.28)";
    draw.lineWidth = isNext ? 2.5 : 1.25;
    draw.stroke();
    if (isNext && !isSf) {
      draw.fillStyle = "rgba(61,255,154,0.85)";
      draw.font = "bold 11px ui-monospace, monospace";
      draw.fillText(`S${gate.index}`, gate.x + 10, gate.y - 8);
    }
  }

  // Chequered SF: thin along travel, extend across the track (perpendicular).
  const sf = samplePath(road, 0);
  draw.save();
  draw.translate(sf.x, sf.y);
  draw.rotate(sf.angle);
  const cell = 5;
  for (let row = -6; row < 6; row += 1) {
    for (let col = 0; col < 2; col += 1) {
      draw.fillStyle = (row + col) % 2 === 0 ? "#f3f5f8" : "#12151c";
      draw.fillRect(col * cell - cell, row * cell, cell, cell);
    }
  }
  draw.restore();

  if (showLabels) {
    draw.fillStyle = "rgba(215,231,223,0.55)";
    draw.font = "10px ui-monospace, monospace";
    for (const p of controlPts) {
      if (p.label) draw.fillText(p.label, p.x + 8, p.y - 8);
    }
  }
}

/** Top-down formula car. Local +X = nose / travel direction. */
function drawFormulaCar(
  draw: CanvasRenderingContext2D,
  opts?: { ghost?: boolean },
) {
  const ghost = opts?.ghost ?? false;
  draw.save();
  if (ghost) {
    draw.globalAlpha = 0.55;
  } else {
    draw.shadowColor = "rgba(30, 65, 255, 0.55)";
    draw.shadowBlur = 10;
  }

  // Rear wing
  draw.fillStyle = ghost ? "rgba(61,255,154,0.85)" : "#0b1020";
  draw.fillRect(-16, -9, 3.5, 18);
  draw.fillRect(-17.5, -10.5, 6, 2.2);
  draw.fillRect(-17.5, 8.3, 6, 2.2);

  // Rear tires
  draw.fillStyle = ghost ? "rgba(20,40,30,0.9)" : "#1a1d24";
  draw.fillRect(-12, -11, 7, 4);
  draw.fillRect(-12, 7, 7, 4);

  // Sidepods + floor
  draw.fillStyle = ghost ? "rgba(61,255,154,0.55)" : "#1e41ff";
  draw.beginPath();
  draw.moveTo(-10, -7);
  draw.lineTo(2, -6.5);
  draw.lineTo(6, -4);
  draw.lineTo(6, 4);
  draw.lineTo(2, 6.5);
  draw.lineTo(-10, 7);
  draw.closePath();
  draw.fill();

  // Halo / cockpit
  draw.fillStyle = ghost ? "rgba(10,20,16,0.8)" : "#0a0e18";
  draw.beginPath();
  draw.ellipse(-1, 0, 4.5, 3.2, 0, 0, Math.PI * 2);
  draw.fill();
  draw.strokeStyle = ghost ? "rgba(240,196,92,0.7)" : "#c0c6d4";
  draw.lineWidth = 1.2;
  draw.beginPath();
  draw.arc(1.5, 0, 3.2, -Math.PI * 0.55, Math.PI * 0.55);
  draw.stroke();

  // Nose
  draw.fillStyle = ghost ? "rgba(61,255,154,0.9)" : "#2550ff";
  draw.beginPath();
  draw.moveTo(6, -3.2);
  draw.lineTo(17, -1.4);
  draw.lineTo(17, 1.4);
  draw.lineTo(6, 3.2);
  draw.closePath();
  draw.fill();

  // Front wing
  draw.fillStyle = ghost ? "rgba(240,196,92,0.85)" : "#ff6b2c";
  draw.fillRect(15, -10, 3, 20);
  draw.fillRect(14, -11, 5, 2);
  draw.fillRect(14, 9, 5, 2);

  // Front tires
  draw.fillStyle = ghost ? "rgba(20,40,30,0.9)" : "#1a1d24";
  draw.fillRect(10, -11, 5.5, 3.5);
  draw.fillRect(10, 7.5, 5.5, 3.5);

  // Starkizard accent stripe
  if (!ghost) {
    draw.fillStyle = "#3dff9a";
    draw.fillRect(-8, -1, 12, 2);
  }

  draw.restore();
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
    wrongWay: false,
  });

  const keys = useRef({ up: false, down: false, left: false, right: false });
  const controlsRef = useRef<{
    startOrRestart: () => void;
    setThrottle: (up: boolean, down: boolean) => void;
  } | null>(null);
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
      ctx.fillText("Tap or click to place centerline points (min 6)", 24, 36);
      return;
    }
    const preview =
      pts.length >= 2 ? densifySmoothPath(ensureClosed(pts)) : pts;
    ctx.strokeStyle = "rgba(255,107,44,0.85)";
    ctx.lineWidth = 3;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.setLineDash([8, 6]);
    ctx.beginPath();
    ctx.moveTo(preview[0].x, preview[0].y);
    for (let i = 1; i < preview.length; i += 1) {
      ctx.lineTo(preview[i].x, preview[i].y);
    }
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.strokeStyle = "rgba(255,107,44,0.18)";
    ctx.lineWidth = TRACK_HALF * 2;
    ctx.lineJoin = "round";
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.moveTo(preview[0].x, preview[0].y);
    for (let i = 1; i < preview.length; i += 1) {
      ctx.lineTo(preview[i].x, preview[i].y);
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
    const controlPts = activeLayout.points;
    const path = densifySmoothPath(controlPts);
    const gates = buildGates(path, 5, 54);
    const layoutKey = activeLayout.id;

    type RaceStage = "awaiting" | "lights" | "racing" | "finished";

    const startPose = samplePath(path, 0.02);
    const car = {
      x: startPose.x,
      y: startPose.y,
      angle: startPose.angle,
      speed: 0,
      start: 0,
    };
    let lapState: LapState = initialLapState();
    let wrongWay = false;
    const recording: GhostSample[] = [];
    const sparks: { x: number; y: number; life: number; vx: number; vy: number }[] =
      [];
    let stage: RaceStage = "awaiting";
    let lightsOn = 0;
    let lightTimer = 0;
    let goFlash = 0;
    const best = bestByLayout.current[layoutKey] ?? null;
    const ghostReady = (ghostByLayout.current[layoutKey]?.length ?? 0) > 1;

    function lapDisplay() {
      return Math.min(lapState.completedLaps + 1, LAPS);
    }

    function hudExtras() {
      return { wrongWay };
    }

    setHud({
      lap: 1,
      time: 0,
      finished: false,
      status: ghostReady
        ? "Ghost on track · Press Enter — five red lights"
        : "Press Enter — five red lights, then lights out",
      best,
      lights: 0,
      dimmed: true,
      awaitingEnter: true,
      ...hudExtras(),
    });

    function resetOnGrid() {
      const pose = samplePath(path, 0.02);
      car.x = pose.x;
      car.y = pose.y;
      car.angle = pose.angle;
      car.speed = 0;
      car.start = 0;
      lapState = initialLapState();
      wrongWay = false;
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
        ...hudExtras(),
      });
    }

    function returnToGrid() {
      stage = "awaiting";
      resetOnGrid();
      const hasGhost = (ghostByLayout.current[layoutKey]?.length ?? 0) > 1;
      setHud({
        lap: 1,
        time: 0,
        finished: false,
        status: hasGhost
          ? "Ghost ready · Press Enter for lights"
          : "Press Enter — five red lights, then lights out",
        best: bestByLayout.current[layoutKey] ?? null,
        lights: 0,
        dimmed: true,
        awaitingEnter: true,
        ...hudExtras(),
      });
    }

    function startOrRestart() {
      if (stage === "awaiting") beginLights();
      else if (stage === "finished") returnToGrid();
    }

    controlsRef.current = {
      startOrRestart,
      setThrottle: (up, down) => {
        keys.current.up = up;
        keys.current.down = down;
      },
    };

    function onKey(e: KeyboardEvent, down: boolean) {
      if (down && (e.key === "Enter" || e.code === "Enter" || e.code === "NumpadEnter")) {
        if (stage === "awaiting" || stage === "finished") {
          e.preventDefault();
          startOrRestart();
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
            status: `Lap 1 / ${LAPS} · next S1`,
            best: bestByLayout.current[layoutKey] ?? null,
            lights: 0,
            dimmed: false,
            awaitingEnter: false,
            ...hudExtras(),
          });
        }
      }

      if (stage === "racing") {
        if (keys.current.up) car.speed += ACCEL * dt;
        if (keys.current.down) car.speed -= BRAKE * dt;
        if (keys.current.left) {
          car.angle -= 0.052 * dt * (0.5 + car.speed * 0.12);
        }
        if (keys.current.right) {
          car.angle += 0.052 * dt * (0.5 + car.speed * 0.12);
        }
        car.speed *= COAST;
        car.speed = Math.max(0, Math.min(MAX_SPEED, car.speed));
        car.x += Math.cos(car.angle) * car.speed * dt;
        car.y += Math.sin(car.angle) * car.speed * dt;

        const near = nearestOnTrack(path, car.x, car.y);
        wrongWay = isWrongWay(car.speed, car.angle, near.tx, near.ty);

        const edge = TRACK_HALF;
        if (near.dist > edge) {
          const overflow = near.dist - edge;
          const inv = 1 / near.dist;
          const nx = (car.x - near.x) * inv;
          const ny = (car.y - near.y) * inv;
          const spring = Math.min(0.1, 0.025 + overflow * 0.003);
          car.x -= nx * overflow * spring;
          car.y -= ny * overflow * spring;
          car.speed *= Math.max(0.92, 1 - overflow * 0.006);
          if (overflow > 14 && car.speed > 1.5) {
            spawnSparks(car.x, car.y, car.angle);
          }
        }

        const lap = updateLapGates(lapState, gates, car.x, car.y);
        lapState = lap.state;

        if (
          lap.lapCompleted &&
          now - car.start > 900 &&
          lapState.completedLaps >= LAPS
        ) {
          stage = "finished";
          const elapsed = (now - car.start) / 1000;
          const prevBest = bestByLayout.current[layoutKey] ?? null;
          const isPersonalBest = prevBest === null || elapsed < prevBest;
          if (isPersonalBest) {
            bestByLayout.current[layoutKey] = elapsed;
            ghostByLayout.current[layoutKey] = [...recording];
          }
          setHud({
            lap: LAPS,
            time: elapsed,
            best: bestByLayout.current[layoutKey] ?? null,
            finished: true,
            status: isPersonalBest
              ? `New PB ${elapsed.toFixed(2)}s · Ghost updated · Press Enter`
              : `Chequered — ${elapsed.toFixed(2)}s · Press Enter`,
            lights: 0,
            dimmed: true,
            awaitingEnter: true,
            ...hudExtras(),
          });
          if (isPersonalBest) {
            fireConfetti({ count: 110 });
          }
        }

        recording.push({
          t: now - car.start,
          x: car.x,
          y: car.y,
          angle: car.angle,
        });

        hudTick += 1;
        if (stage === "racing" && hudTick % 6 === 0) {
          const next = lapState.nextIndex;
          const nextLabel = next === 0 ? "SF" : `S${next}`;
          setHud({
            lap: lapDisplay(),
            time: (now - car.start) / 1000,
            best: bestByLayout.current[layoutKey] ?? null,
            finished: false,
            status: wrongWay
              ? "WRONG WAY"
              : `Lap ${lapDisplay()} / ${LAPS} · next ${nextLabel}`,
            lights: 0,
            dimmed: false,
            awaitingEnter: false,
            ...hudExtras(),
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

      drawTrackScene(draw, controlPts, gates, lapState.nextIndex);

      const ghostTrack = ghostByLayout.current[layoutKey] ?? [];
      if (ghostTrack.length > 1 && stage === "racing") {
        const elapsed = Math.max(0, now - car.start);
        let gi = 0;
        while (gi < ghostTrack.length - 1 && ghostTrack[gi + 1].t < elapsed) {
          gi += 1;
        }
        const a = ghostTrack[gi];
        const b = ghostTrack[Math.min(gi + 1, ghostTrack.length - 1)];
        const span = Math.max(1, b.t - a.t);
        const u = Math.min(1, Math.max(0, (elapsed - a.t) / span));
        const gx = a.x + (b.x - a.x) * u;
        const gy = a.y + (b.y - a.y) * u;
        let ga = a.angle;
        let diff = b.angle - a.angle;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        ga += diff * u;

        draw.save();
        draw.translate(gx, gy);
        draw.rotate(ga);
        drawFormulaCar(draw, { ghost: true });
        draw.restore();
        draw.globalAlpha = 1;
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
      drawFormulaCar(draw);
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
      controlsRef.current = null;
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
            Three presets or sketch your own — 3 laps, lights-out start, ghost.
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
              Tap or click to add points · undo / clear · close &amp; race
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
      <div className="grid grid-cols-3 gap-2 md:hidden select-none">
        <button
          type="button"
          className="min-h-14 rounded-2xl border border-sz-mist/25 bg-sz-void/90 text-sm font-semibold"
          onPointerDown={(e) => {
            e.preventDefault();
            controlsRef.current?.setThrottle(false, true);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            controlsRef.current?.setThrottle(false, false);
          }}
          onPointerLeave={() => controlsRef.current?.setThrottle(false, false)}
          onPointerCancel={() => controlsRef.current?.setThrottle(false, false)}
          style={{ touchAction: "none" }}
        >
          Brake
        </button>
        <button
          type="button"
          disabled={!hud.awaitingEnter && !hud.finished}
          className="min-h-14 rounded-2xl bg-sz-ember text-sm font-semibold text-sz-void disabled:opacity-40"
          onClick={() => controlsRef.current?.startOrRestart()}
        >
          Start
        </button>
        <button
          type="button"
          className="min-h-14 rounded-2xl border border-sz-jade/40 bg-sz-jade/15 text-sm font-semibold text-sz-jade"
          onPointerDown={(e) => {
            e.preventDefault();
            controlsRef.current?.setThrottle(true, false);
          }}
          onPointerUp={(e) => {
            e.preventDefault();
            controlsRef.current?.setThrottle(false, false);
          }}
          onPointerLeave={() => controlsRef.current?.setThrottle(false, false)}
          onPointerCancel={() => controlsRef.current?.setThrottle(false, false)}
          style={{ touchAction: "none" }}
        >
          Gas
        </button>
      </div>
      <p className="text-xs text-sz-mist/40 md:hidden">
        {hud.awaitingEnter
          ? "Tap Start for lights (timer begins on lights out)."
          : "Free drive · soft walls · pass green gates in order · no reverse."}
      </p>
      <p className="hidden text-xs text-sz-mist/40 md:block">
        {hud.awaitingEnter
          ? "Screen dims · Press Enter for the five-light start."
          : "Free drive · soft walls · pass green gates in order · ▲/W gas · ▼/S brake · no reverse."}
      </p>
    </div>
  );
}
