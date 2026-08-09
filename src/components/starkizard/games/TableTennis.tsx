"use client";

import { useEffect, useRef, useState } from "react";

const W = 720;
const H = 420;
const PADDLE_W = 14;
const PADDLE_H = 72;
const BALL_R = 8;
const WIN = 11;

type Score = { player: number; bot: number };

export function TableTennis() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matchId, setMatchId] = useState(0);
  const [score, setScore] = useState<Score>({ player: 0, bot: 0 });
  const [status, setStatus] = useState("Move mouse / touch / ↑↓ / W S");
  const [over, setOver] = useState(false);

  const scoreRef = useRef(score);
  const keysRef = useRef({ up: false, down: false });
  const pointerY = useRef(H / 2);

  useEffect(() => {
    scoreRef.current = score;
  }, [score]);

  useEffect(() => {
    const canvasEl = canvasRef.current;
    if (!canvasEl) return;
    const maybeCtx = canvasEl.getContext("2d");
    if (!maybeCtx) return;
    const canvas: HTMLCanvasElement = canvasEl;
    const draw: CanvasRenderingContext2D = maybeCtx;

    setScore({ player: 0, bot: 0 });
    setOver(false);
    setStatus("First to 11");

    const state = {
      playerY: H / 2 - PADDLE_H / 2,
      botY: H / 2 - PADDLE_H / 2,
      ballX: W / 2,
      ballY: H / 2,
      vx: 5.2,
      vy: 2.4,
    };
    let matchOver = false;

    function resetBall(toPlayer: boolean) {
      state.ballX = W / 2;
      state.ballY = H / 2;
      state.vx = toPlayer ? -5.4 : 5.4;
      state.vy = (Math.random() * 2 - 1) * 3.2;
    }

    function onKey(e: KeyboardEvent, down: boolean) {
      if (["ArrowUp", "w", "W"].includes(e.key)) {
        keysRef.current.up = down;
        e.preventDefault();
      }
      if (["ArrowDown", "s", "S"].includes(e.key)) {
        keysRef.current.down = down;
        e.preventDefault();
      }
    }

    function syncPointer(clientY: number) {
      const rect = canvas.getBoundingClientRect();
      pointerY.current = (clientY - rect.top) * (H / rect.height);
    }

    const keyDown = (e: KeyboardEvent) => onKey(e, true);
    const keyUp = (e: KeyboardEvent) => onKey(e, false);
    const onMove = (e: MouseEvent) => syncPointer(e.clientY);
    const onTouch = (e: TouchEvent) => {
      if (e.touches[0]) syncPointer(e.touches[0].clientY);
    };

    window.addEventListener("keydown", keyDown);
    window.addEventListener("keyup", keyUp);
    canvas.addEventListener("mousemove", onMove);
    canvas.addEventListener("touchmove", onTouch, { passive: true });

    let raf = 0;
    let last = performance.now();

    function frame(now: number) {
      const dt = Math.min(32, now - last) / 16.67;
      last = now;

      if (!matchOver) {
        if (keysRef.current.up) state.playerY -= 7.5 * dt;
        if (keysRef.current.down) state.playerY += 7.5 * dt;
        const target = pointerY.current - PADDLE_H / 2;
        state.playerY += (target - state.playerY) * 0.22;
        state.playerY = Math.max(8, Math.min(H - PADDLE_H - 8, state.playerY));

        const botCenter = state.botY + PADDLE_H / 2;
        const lag = 0.085 + Math.min(0.06, scoreRef.current.player * 0.004);
        state.botY += (state.ballY - botCenter) * lag * dt;
        state.botY = Math.max(8, Math.min(H - PADDLE_H - 8, state.botY));

        state.ballX += state.vx * dt;
        state.ballY += state.vy * dt;

        if (state.ballY < BALL_R || state.ballY > H - BALL_R) {
          state.vy *= -1;
          state.ballY = Math.max(BALL_R, Math.min(H - BALL_R, state.ballY));
        }

        if (
          state.vx < 0 &&
          state.ballX - BALL_R < 28 + PADDLE_W &&
          state.ballX > 28 &&
          state.ballY > state.playerY &&
          state.ballY < state.playerY + PADDLE_H
        ) {
          state.vx = Math.abs(state.vx) * 1.04;
          const hit =
            (state.ballY - (state.playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
          state.vy = hit * 5.5;
          state.ballX = 28 + PADDLE_W + BALL_R;
        }

        if (
          state.vx > 0 &&
          state.ballX + BALL_R > W - 28 - PADDLE_W &&
          state.ballX < W - 28 &&
          state.ballY > state.botY &&
          state.ballY < state.botY + PADDLE_H
        ) {
          state.vx = -Math.abs(state.vx) * 1.03;
          const hit =
            (state.ballY - (state.botY + PADDLE_H / 2)) / (PADDLE_H / 2);
          state.vy = hit * 5.2;
          state.ballX = W - 28 - PADDLE_W - BALL_R;
        }

        if (state.ballX < -20) {
          const next = {
            player: scoreRef.current.player,
            bot: scoreRef.current.bot + 1,
          };
          scoreRef.current = next;
          setScore(next);
          if (next.bot >= WIN) {
            matchOver = true;
            setOver(true);
            setStatus("Bot takes it — rematch?");
          } else {
            resetBall(false);
          }
        } else if (state.ballX > W + 20) {
          const next = {
            player: scoreRef.current.player + 1,
            bot: scoreRef.current.bot,
          };
          scoreRef.current = next;
          setScore(next);
          if (next.player >= WIN) {
            matchOver = true;
            setOver(true);
            setStatus("You win — clean counters.");
          } else {
            resetBall(true);
          }
        }
      }

      draw.fillStyle = "#070b10";
      draw.fillRect(0, 0, W, H);
      const glow = draw.createRadialGradient(W / 2, H / 2, 40, W / 2, H / 2, 320);
      glow.addColorStop(0, "rgba(61,255,154,0.08)");
      glow.addColorStop(1, "transparent");
      draw.fillStyle = glow;
      draw.fillRect(0, 0, W, H);

      draw.strokeStyle = "rgba(61,255,154,0.25)";
      draw.lineWidth = 2;
      draw.setLineDash([8, 10]);
      draw.beginPath();
      draw.moveTo(W / 2, 12);
      draw.lineTo(W / 2, H - 12);
      draw.stroke();
      draw.setLineDash([]);

      draw.fillStyle = "#3dff9a";
      draw.shadowColor = "rgba(61,255,154,0.65)";
      draw.shadowBlur = 14;
      draw.fillRect(28, state.playerY, PADDLE_W, PADDLE_H);

      draw.fillStyle = "#ff6b2c";
      draw.shadowColor = "rgba(255,107,44,0.55)";
      draw.fillRect(W - 28 - PADDLE_W, state.botY, PADDLE_W, PADDLE_H);

      draw.beginPath();
      draw.fillStyle = "#f0c45c";
      draw.shadowColor = "rgba(240,196,92,0.8)";
      draw.shadowBlur = 18;
      draw.arc(state.ballX, state.ballY, BALL_R, 0, Math.PI * 2);
      draw.fill();
      draw.shadowBlur = 0;

      raf = requestAnimationFrame(frame);
    }

    raf = requestAnimationFrame(frame);
    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("keydown", keyDown);
      window.removeEventListener("keyup", keyUp);
      canvas.removeEventListener("mousemove", onMove);
      canvas.removeEventListener("touchmove", onTouch);
    };
  }, [matchId]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-sz-mist/45">
            Neon Void TT
          </p>
          <p className="mt-1 text-sm text-sz-mist/70">{status}</p>
        </div>
        <p className="display text-2xl font-bold">
          <span className="text-sz-jade">{score.player}</span>
          <span className="mx-2 text-sz-mist/35">–</span>
          <span className="text-sz-ember">{score.bot}</span>
        </p>
      </div>
      <canvas
        ref={canvasRef}
        width={W}
        height={H}
        className="w-full touch-none rounded-2xl border border-sz-jade/25 bg-sz-void shadow-[0_0_40px_rgba(61,255,154,0.08)]"
        aria-label="Table tennis court"
      />
      {over ? (
        <button
          type="button"
          onClick={() => setMatchId((n) => n + 1)}
          className="rounded-full bg-sz-jade px-5 py-2.5 text-sm font-semibold text-sz-void transition hover:bg-sz-gold"
        >
          Rematch
        </button>
      ) : null}
    </div>
  );
}
