"use client";

import { fireConfetti } from "@/components/fx/confetti";
import { useEffect, useRef, useState } from "react";

const W = 760;
const H = 440;
const PADDLE_W = 14;
const PADDLE_H = 78;
const BALL_R = 8;
const WIN = 11;
const NET_X = W / 2;

type SpinMode = "flat" | "top" | "back" | "side";

type Score = { player: number; bot: number };

export function TableTennis() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [matchId, setMatchId] = useState(0);
  const [score, setScore] = useState<Score>({ player: 0, bot: 0 });
  const [status, setStatus] = useState("Move paddle · Q top · E back · A/D side on contact");
  const [over, setOver] = useState(false);
  const [spinHud, setSpinHud] = useState("flat");

  const scoreRef = useRef(score);
  const keysRef = useRef({
    up: false,
    down: false,
    top: false,
    back: false,
    sideL: false,
    sideR: false,
  });
  const pointerY = useRef(H / 2);
  const prevPlayerY = useRef(H / 2);

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
    setStatus("First to 11 · impart spin on the hit");
    setSpinHud("flat");

    const state = {
      playerY: H / 2 - PADDLE_H / 2,
      botY: H / 2 - PADDLE_H / 2,
      ballX: W / 2,
      ballY: H / 2,
      vx: 5.4,
      vy: 1.8,
      /** Magnitudes: +topspin dips later, -backspin floats; sidespin curves path. */
      spinTop: 0,
      spinSide: 0,
      rot: 0,
      lastHitter: "bot" as "player" | "bot",
    };
    let matchOver = false;

    function activeSpinMode(): SpinMode {
      if (keysRef.current.top) return "top";
      if (keysRef.current.back) return "back";
      if (keysRef.current.sideL || keysRef.current.sideR) return "side";
      return "flat";
    }

    function resetBall(toPlayer: boolean) {
      state.ballX = W / 2;
      state.ballY = H / 2;
      state.vx = toPlayer ? -5.5 : 5.5;
      state.vy = (Math.random() * 2 - 1) * 2.4;
      state.spinTop = 0;
      state.spinSide = 0;
      state.rot = 0;
      state.lastHitter = toPlayer ? "bot" : "player";
    }

    function applyPlayerSpin(hitOffset: number, paddleVy: number) {
      const mode = activeSpinMode();
      setSpinHud(mode);
      let top = paddleVy * 0.08;
      let side = hitOffset * 1.8;
      if (mode === "top") top += 3.2;
      if (mode === "back") top -= 3.4;
      if (mode === "side") {
        side += keysRef.current.sideL ? -3.2 : 3.2;
      }
      state.spinTop = Math.max(-5, Math.min(5, top));
      state.spinSide = Math.max(-5, Math.min(5, side));
      state.vx = Math.min(9.5, Math.abs(state.vx) * 1.05 + Math.abs(state.spinTop) * 0.12);
      state.vx = Math.abs(state.vx);
      state.vy = hitOffset * 4.8 + state.spinSide * 0.35;
      state.lastHitter = "player";
    }

    function applyBotSpin() {
      const roll = Math.random();
      if (roll < 0.35) {
        state.spinTop = 2.4 + Math.random();
        setSpinHud("bot:top");
      } else if (roll < 0.55) {
        state.spinTop = -2.6 - Math.random();
        setSpinHud("bot:back");
      } else if (roll < 0.75) {
        state.spinSide = (Math.random() < 0.5 ? -1 : 1) * (2.2 + Math.random());
        state.spinTop = 0.4;
        setSpinHud("bot:side");
      } else {
        state.spinTop = 0.2;
        state.spinSide = 0;
        setSpinHud("bot:flat");
      }
      state.vx = -Math.min(9.2, Math.abs(state.vx) * 1.04 + 0.2);
      state.lastHitter = "bot";
    }

    function onKey(e: KeyboardEvent, down: boolean) {
      const map: Record<string, keyof typeof keysRef.current> = {
        ArrowUp: "up",
        ArrowDown: "down",
        w: "up",
        W: "up",
        s: "down",
        S: "down",
        q: "top",
        Q: "top",
        e: "back",
        E: "back",
        a: "sideL",
        A: "sideL",
        d: "sideR",
        D: "sideR",
      };
      const k = map[e.key];
      if (k) {
        keysRef.current[k] = down;
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
        const before = state.playerY;
        if (keysRef.current.up) state.playerY -= 7.8 * dt;
        if (keysRef.current.down) state.playerY += 7.8 * dt;
        const target = pointerY.current - PADDLE_H / 2;
        state.playerY += (target - state.playerY) * 0.24;
        state.playerY = Math.max(10, Math.min(H - PADDLE_H - 10, state.playerY));
        const paddleVy = (state.playerY - before) / Math.max(dt, 0.001);
        prevPlayerY.current = state.playerY;

        // Bot reads spin slightly (anticipates curve)
        const predictY = state.ballY + state.spinSide * 6 + state.vy * 4;
        const botCenter = state.botY + PADDLE_H / 2;
        const lag = 0.07 + Math.min(0.05, scoreRef.current.player * 0.003);
        state.botY += (predictY - botCenter) * lag * dt;
        state.botY = Math.max(10, Math.min(H - PADDLE_H - 10, state.botY));

        // Spin physics: sidespin curves sideways; topspin pulls toward table center-line vertically after net
        state.vy += state.spinSide * 0.012 * dt * Math.sign(state.vx || 1);
        state.vy += state.spinTop * 0.01 * dt * (state.ballX > NET_X ? 1 : -0.35);
        state.vx *= 0.9995;
        state.ballX += state.vx * dt;
        state.ballY += state.vy * dt;
        state.rot += (state.spinTop * 0.35 + state.spinSide * 0.25 + state.vx * 0.08) * dt;
        state.spinTop *= 0.997;
        state.spinSide *= 0.997;

        if (state.ballY < BALL_R + 8 || state.ballY > H - BALL_R - 8) {
          state.vy *= -0.92;
          state.spinSide *= -0.55;
          state.ballY = Math.max(BALL_R + 8, Math.min(H - BALL_R - 8, state.ballY));
        }

        // Net brush (slows + dumps topspin)
        if (
          Math.abs(state.ballX - NET_X) < 6 &&
          state.ballY > H * 0.18 &&
          state.ballY < H * 0.82
        ) {
          if (Math.abs(state.vy) < 1.2 && Math.abs(state.spinTop) < 1) {
            state.vx *= 0.55;
            state.vy += (Math.random() - 0.5) * 2;
            state.spinTop *= 0.3;
          }
        }

        if (
          state.vx < 0 &&
          state.ballX - BALL_R < 32 + PADDLE_W &&
          state.ballX > 24 &&
          state.ballY > state.playerY - 4 &&
          state.ballY < state.playerY + PADDLE_H + 4
        ) {
          const hit =
            (state.ballY - (state.playerY + PADDLE_H / 2)) / (PADDLE_H / 2);
          applyPlayerSpin(hit, paddleVy);
          state.ballX = 32 + PADDLE_W + BALL_R + 1;
        }

        if (
          state.vx > 0 &&
          state.ballX + BALL_R > W - 32 - PADDLE_W &&
          state.ballX < W - 24 &&
          state.ballY > state.botY - 4 &&
          state.ballY < state.botY + PADDLE_H + 4
        ) {
          const hit = (state.ballY - (state.botY + PADDLE_H / 2)) / (PADDLE_H / 2);
          applyBotSpin();
          state.vy = hit * 4.6 + state.spinSide * 0.4;
          state.ballX = W - 32 - PADDLE_W - BALL_R - 1;
        }

        if (state.ballX < -24) {
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
        } else if (state.ballX > W + 24) {
          const next = {
            player: scoreRef.current.player + 1,
            bot: scoreRef.current.bot,
          };
          scoreRef.current = next;
          setScore(next);
          if (next.player >= WIN) {
            matchOver = true;
            setOver(true);
            setStatus("You win — filthy spin.");
            fireConfetti({ count: 100 });
          } else {
            resetBall(true);
          }
        }
      }

      // Table bed
      draw.fillStyle = "#071018";
      draw.fillRect(0, 0, W, H);
      draw.fillStyle = "#0f3d2d";
      draw.fillRect(18, 18, W - 36, H - 36);
      draw.strokeStyle = "rgba(240,196,92,0.35)";
      draw.lineWidth = 3;
      draw.strokeRect(18, 18, W - 36, H - 36);

      draw.strokeStyle = "rgba(215,231,223,0.55)";
      draw.lineWidth = 2;
      draw.beginPath();
      draw.moveTo(NET_X, 22);
      draw.lineTo(NET_X, H - 22);
      draw.stroke();
      draw.fillStyle = "rgba(215,231,223,0.2)";
      draw.fillRect(NET_X - 3, 40, 6, H - 80);

      draw.fillStyle = "#3dff9a";
      draw.shadowColor = "rgba(61,255,154,0.55)";
      draw.shadowBlur = 12;
      draw.fillRect(32, state.playerY, PADDLE_W, PADDLE_H);

      draw.fillStyle = "#ff6b2c";
      draw.shadowColor = "rgba(255,107,44,0.5)";
      draw.fillRect(W - 32 - PADDLE_W, state.botY, PADDLE_W, PADDLE_H);

      draw.save();
      draw.translate(state.ballX, state.ballY);
      draw.rotate(state.rot * 0.2);
      draw.shadowColor = "rgba(240,196,92,0.75)";
      draw.shadowBlur = 16;
      draw.fillStyle = "#f0c45c";
      draw.beginPath();
      draw.arc(0, 0, BALL_R, 0, Math.PI * 2);
      draw.fill();
      draw.strokeStyle = "rgba(18,21,28,0.35)";
      draw.lineWidth = 1.5;
      draw.beginPath();
      draw.moveTo(-BALL_R, 0);
      draw.quadraticCurveTo(0, -BALL_R * 0.6, BALL_R, 0);
      draw.stroke();
      // spin cue
      draw.strokeStyle =
        Math.abs(state.spinTop) > Math.abs(state.spinSide)
          ? "rgba(61,255,154,0.85)"
          : "rgba(255,107,44,0.85)";
      draw.beginPath();
      draw.arc(0, 0, BALL_R + 3, 0, Math.PI * 1.2);
      draw.stroke();
      draw.restore();
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
            Neon Void TT · spin physics
          </p>
          <p className="mt-1 text-sm text-sz-mist/70">{status}</p>
          <p className="mt-1 font-mono text-[11px] text-sz-gold/80">
            Hold on contact: Q topspin · E backspin · A/D sidespin · spin: {spinHud}
          </p>
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
        aria-label="Table tennis court with spin"
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
