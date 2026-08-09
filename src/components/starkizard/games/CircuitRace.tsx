"use client";

import { useEffect, useRef, useState } from "react";

const W = 860;
const H = 560;
const LAPS = 2;
const TRACK_HALF = 22;

/**
 * Red Bull Ring (Spielberg) — fan recreation from published layout proportions.
 * Clockwise, S/F along the south, T3 hairpin at the north-east high point.
 * Not licensed; geometry approximated for a personal game.
 */
const PATH: { x: number; y: number; label?: string }[] = [
  // Start/finish → run to T1 (east along south)
  { x: 200, y: 468 },
  { x: 310, y: 470 },
  { x: 430, y: 468 },
  { x: 540, y: 458 },
  { x: 620, y: 440, label: "T1 · Lauda" },
  // T1 right → north, T2 left kink
  { x: 655, y: 400 },
  { x: 665, y: 350 },
  { x: 655, y: 300, label: "T2 · Münzer" },
  // Long steep climb to T3
  { x: 670, y: 240 },
  { x: 700, y: 175 },
  { x: 730, y: 125 },
  { x: 745, y: 88, label: "T3" },
  // Hairpin right → short to T4 Rauch
  { x: 700, y: 68 },
  { x: 640, y: 72 },
  { x: 585, y: 95, label: "T4 · Rauch" },
  // Mid-sector downhill complex T5–T8
  { x: 530, y: 130 },
  { x: 490, y: 165, label: "T5" },
  { x: 445, y: 195 },
  { x: 390, y: 210, label: "T6" },
  { x: 330, y: 200 },
  { x: 280, y: 175, label: "T7 · Graz" },
  { x: 235, y: 175 },
  { x: 195, y: 205, label: "T8" },
  // T9 Rindt → T10 → S/F
  { x: 160, y: 255 },
  { x: 140, y: 320, label: "T9 · Rindt" },
  { x: 145, y: 380 },
  { x: 165, y: 430, label: "T10" },
  { x: 200, y: 468 },
];

function polylineLength(pts: { x: number; y: number }[]) {
  let len = 0;
  for (let i = 1; i < pts.length; i += 1) {
    len += Math.hypot(pts[i].x - pts[i - 1].x, pts[i].y - pts[i - 1].y);
  }
  return len;
}

function samplePath(t: number) {
  const total = polylineLength(PATH);
  let dist = ((((t % 1) + 1) % 1) * total);
  for (let i = 1; i < PATH.length; i += 1) {
    const a = PATH[i - 1];
    const b = PATH[i];
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
  const last = PATH[PATH.length - 1];
  return { x: last.x, y: last.y, angle: 0 };
}

function closestProgress(px: number, py: number) {
  let best = 0;
  let bestDist = Infinity;
  const steps = 320;
  for (let i = 0; i < steps; i += 1) {
    const t = i / steps;
    const p = samplePath(t);
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
  width: number,
  color: string,
  dash?: number[],
) {
  draw.strokeStyle = color;
  draw.lineWidth = width;
  draw.lineJoin = "round";
  draw.lineCap = "round";
  if (dash) draw.setLineDash(dash);
  draw.beginPath();
  draw.moveTo(PATH[0].x, PATH[0].y);
  for (let i = 1; i < PATH.length - 1; i += 1) {
    const midX = (PATH[i].x + PATH[i + 1].x) / 2;
    const midY = (PATH[i].y + PATH[i + 1].y) / 2;
    draw.quadraticCurveTo(PATH[i].x, PATH[i].y, midX, midY);
  }
  const last = PATH[PATH.length - 1];
  draw.lineTo(last.x, last.y);
  draw.stroke();
  draw.setLineDash([]);
}

export function CircuitRace() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [runId, setRunId] = useState(0);
  const [hud, setHud] = useState({
    lap: 1,
    time: 0,
    best: null as number | null,
    status: "Ready — WASD / arrows",
    finished: false,
  });

  const keys = useRef({ up: false, down: false, left: false, right: false });
  const ghost = useRef<{ t: number; x: number; y: number; angle: number }[]>([]);
  const bestRef = useRef<number | null>(null);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const maybeCtx = canvasEl.getContext("2d");
    if (!maybeCtx) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const draw: CanvasRenderingContext2D = maybeCtx;

    const startPose = samplePath(0.01);
    const car = {
      x: startPose.x,
      y: startPose.y,
      angle: startPose.angle,
      speed: 0,
      lastProgress: 0.01,
      lap: 1,
      start: performance.now(),
    };
    const recording: { t: number; x: number; y: number; angle: number }[] = [];
    let done = false;

    setHud((h) => ({
      ...h,
      lap: 1,
      time: 0,
      finished: false,
      status: "Red Bull Ring fan layout — WASD / arrows",
      best: bestRef.current,
    }));

    function onKey(e: KeyboardEvent, down: boolean) {
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

    function drawScene() {
      // Styrian hills backdrop
      draw.fillStyle = "#0a1210";
      draw.fillRect(0, 0, W, H);
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

      draw.shadowColor = "rgba(255,107,44,0.2)";
      draw.shadowBlur = 16;
      drawSmoothTrack(draw, TRACK_HALF * 2 + 10, "rgba(255,107,44,0.55)");
      draw.shadowBlur = 0;
      drawSmoothTrack(draw, TRACK_HALF * 2, "rgba(28, 32, 36, 0.98)");
      drawSmoothTrack(draw, 1.5, "rgba(240,196,92,0.4)", [7, 9]);

      // S/F stripe
      const sf = samplePath(0.01);
      draw.save();
      draw.translate(sf.x, sf.y);
      draw.rotate(sf.angle);
      for (let i = -4; i < 5; i += 1) {
        draw.fillStyle = i % 2 === 0 ? "#f3f5f8" : "#12151c";
        draw.fillRect(-6, i * 4 - 2, 12, 4);
      }
      draw.restore();

      draw.fillStyle = "rgba(215,231,223,0.55)";
      draw.font = "10px ui-monospace, monospace";
      for (const p of PATH) {
        if (p.label) draw.fillText(p.label, p.x + 8, p.y - 8);
      }
    }

    function frame(now: number) {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;

      if (!done) {
        if (keys.current.up) car.speed += 0.15 * dt;
        if (keys.current.down) car.speed -= 0.2 * dt;
        if (keys.current.left) {
          car.angle -= 0.048 * dt * (0.55 + Math.abs(car.speed) * 0.13);
        }
        if (keys.current.right) {
          car.angle += 0.048 * dt * (0.55 + Math.abs(car.speed) * 0.13);
        }
        car.speed *= 0.986;
        car.speed = Math.max(-2.4, Math.min(5.8, car.speed));
        car.x += Math.cos(car.angle) * car.speed * dt;
        car.y += Math.sin(car.angle) * car.speed * dt;

        const near = closestProgress(car.x, car.y);
        if (near.dist > TRACK_HALF + 6) {
          const snap = samplePath(near.t);
          car.x += (snap.x - car.x) * 0.16;
          car.y += (snap.y - car.y) * 0.16;
          car.speed *= 0.88;
        }

        const delta = near.t - car.lastProgress;
        if (delta < -0.55) {
          car.lap += 1;
          if (car.lap > LAPS) {
            done = true;
            const elapsed = (now - car.start) / 1000;
            bestRef.current =
              bestRef.current === null
                ? elapsed
                : Math.min(bestRef.current, elapsed);
            ghost.current = [...recording];
            setHud({
              lap: LAPS,
              time: elapsed,
              best: bestRef.current,
              finished: true,
              status: `Chequered — ${elapsed.toFixed(2)}s`,
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
        if (!done && hudTick % 6 === 0) {
          setHud({
            lap: Math.min(car.lap, LAPS),
            time: (now - car.start) / 1000,
            best: bestRef.current,
            finished: false,
            status: `Lap ${Math.min(car.lap, LAPS)} / ${LAPS}`,
          });
        }
      }

      drawScene();

      if (ghost.current.length > 1) {
        const elapsed = now - car.start;
        let gi = 0;
        while (
          gi < ghost.current.length - 1 &&
          ghost.current[gi + 1].t < elapsed
        ) {
          gi += 1;
        }
        const gh = ghost.current[gi];
        draw.save();
        draw.translate(gh.x, gh.y);
        draw.rotate(gh.angle);
        draw.globalAlpha = 0.35;
        draw.fillStyle = "#3dff9a";
        draw.fillRect(-10, -5, 20, 10);
        draw.restore();
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

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
    };
  }, [runId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-ember/80">
            Red Bull Ring · fan recreation
          </p>
          <p className="mt-1 text-sm text-sz-mist/70">{hud.status}</p>
        </div>
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
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full rounded-2xl border border-sz-ember/30 bg-sz-void shadow-[0_0_40px_rgba(255,107,44,0.1)]"
        aria-label="Red Bull Ring fan track"
      />
      {hud.finished ? (
        <button
          type="button"
          onClick={() => setRunId((n) => n + 1)}
          className="rounded-full bg-sz-ember px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
        >
          Another run (ghost on)
        </button>
      ) : null}
      <p className="text-xs text-sz-mist/40">
        Layout follows published Red Bull Ring proportions (S/F south, T3 NE
        hairpin, T1 Lauda → T10). Unofficial fan recreation — not licensed by
        Red Bull Ring / F1.
      </p>
    </div>
  );
}
