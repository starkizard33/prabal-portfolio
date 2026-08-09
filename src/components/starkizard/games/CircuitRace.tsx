"use client";

import { useEffect, useRef, useState } from "react";

const W = 800;
const H = 520;
const LAPS = 2;

/** Stylized Spielberg-inspired loop (not a licensed map). */
const PATH: { x: number; y: number; label?: string }[] = [
  { x: 120, y: 400 },
  { x: 200, y: 430, label: "T1" },
  { x: 340, y: 400 },
  { x: 480, y: 360, label: "Remus" },
  { x: 620, y: 300 },
  { x: 700, y: 220, label: "Schlossgold" },
  { x: 680, y: 140 },
  { x: 560, y: 100, label: "Rauch" },
  { x: 400, y: 120 },
  { x: 260, y: 160, label: "Würth" },
  { x: 160, y: 220 },
  { x: 100, y: 300, label: "Rindt" },
  { x: 120, y: 400 },
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
  const steps = 240;
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

    const startPose = samplePath(0.02);
    const car = {
      x: startPose.x,
      y: startPose.y,
      angle: startPose.angle,
      speed: 0,
      lastProgress: 0.02,
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
      status: "Ready — WASD / arrows",
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

    function drawTrack() {
      draw.strokeStyle = "rgba(255,107,44,0.55)";
      draw.lineWidth = 46;
      draw.lineJoin = "round";
      draw.lineCap = "round";
      draw.shadowColor = "rgba(255,107,44,0.25)";
      draw.shadowBlur = 18;
      draw.beginPath();
      draw.moveTo(PATH[0].x, PATH[0].y);
      for (let i = 1; i < PATH.length; i += 1) draw.lineTo(PATH[i].x, PATH[i].y);
      draw.stroke();
      draw.shadowBlur = 0;

      draw.strokeStyle = "rgba(15,22,32,0.95)";
      draw.lineWidth = 34;
      draw.beginPath();
      draw.moveTo(PATH[0].x, PATH[0].y);
      for (let i = 1; i < PATH.length; i += 1) draw.lineTo(PATH[i].x, PATH[i].y);
      draw.stroke();

      draw.strokeStyle = "rgba(240,196,92,0.35)";
      draw.lineWidth = 1.5;
      draw.setLineDash([6, 8]);
      draw.beginPath();
      draw.moveTo(PATH[0].x, PATH[0].y);
      for (let i = 1; i < PATH.length; i += 1) draw.lineTo(PATH[i].x, PATH[i].y);
      draw.stroke();
      draw.setLineDash([]);

      draw.fillStyle = "rgba(215,231,223,0.45)";
      draw.font = "10px ui-monospace, monospace";
      for (const p of PATH) {
        if (p.label) draw.fillText(p.label, p.x + 8, p.y - 10);
      }
    }

    function frame(now: number) {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;

      if (!done) {
        if (keys.current.up) car.speed += 0.14 * dt;
        if (keys.current.down) car.speed -= 0.18 * dt;
        if (keys.current.left) {
          car.angle -= 0.045 * dt * (0.6 + Math.abs(car.speed) * 0.12);
        }
        if (keys.current.right) {
          car.angle += 0.045 * dt * (0.6 + Math.abs(car.speed) * 0.12);
        }
        car.speed *= 0.985;
        car.speed = Math.max(-2.2, Math.min(5.4, car.speed));
        car.x += Math.cos(car.angle) * car.speed * dt;
        car.y += Math.sin(car.angle) * car.speed * dt;

        const near = closestProgress(car.x, car.y);
        if (near.dist > 28) {
          const snap = samplePath(near.t);
          car.x += (snap.x - car.x) * 0.12;
          car.y += (snap.y - car.y) * 0.12;
          car.speed *= 0.92;
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

      draw.fillStyle = "#070b10";
      draw.fillRect(0, 0, W, H);
      const g = draw.createRadialGradient(
        W * 0.55,
        H * 0.4,
        40,
        W * 0.5,
        H * 0.5,
        420,
      );
      g.addColorStop(0, "rgba(255,107,44,0.12)");
      g.addColorStop(1, "transparent");
      draw.fillStyle = g;
      draw.fillRect(0, 0, W, H);
      drawTrack();

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
      draw.fillStyle = "#ff6b2c";
      draw.shadowColor = "rgba(255,107,44,0.7)";
      draw.shadowBlur = 12;
      draw.fillRect(-12, -6, 24, 12);
      draw.fillStyle = "#f0c45c";
      draw.fillRect(6, -4, 6, 8);
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
            Spielberg Circuit (fan track)
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
        aria-label="Spielberg Circuit fan track"
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
        Stylized loop with approximate turn names — not an accurate or licensed
        track map. Orange army vibes only.
      </p>
    </div>
  );
}
