type ConfettiOptions = {
  count?: number;
  /** Starkizard / atelier palette by default. */
  colors?: string[];
};

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rot: number;
  vr: number;
  w: number;
  h: number;
  color: string;
  life: number;
  ttl: number;
};

const DEFAULT_COLORS = [
  "#3dff9a",
  "#f0c45c",
  "#ff6b2c",
  "#1f4f7a",
  "#d7e7df",
  "#ffffff",
];

/**
 * Lightweight DOM canvas confetti — no dependency.
 * Safe to call from guess settles, race PBs, casino wins.
 */
export function fireConfetti(options: ConfettiOptions = {}) {
  if (typeof window === "undefined" || typeof document === "undefined") return;
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

  const count = options.count ?? 96;
  const colors = options.colors ?? DEFAULT_COLORS;
  const canvas = document.createElement("canvas");
  canvas.setAttribute("aria-hidden", "true");
  canvas.style.cssText =
    "position:fixed;inset:0;width:100%;height:100%;pointer-events:none;z-index:120;";
  document.body.appendChild(canvas);

  const ctx = canvas.getContext("2d");
  if (!ctx) {
    canvas.remove();
    return;
  }

  const dpr = Math.min(window.devicePixelRatio || 1, 2);
  function resize() {
    canvas.width = Math.floor(window.innerWidth * dpr);
    canvas.height = Math.floor(window.innerHeight * dpr);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);
  }
  resize();

  const originX = window.innerWidth / 2;
  const originY = window.innerHeight * 0.28;
  const particles: Particle[] = [];
  for (let i = 0; i < count; i += 1) {
    const angle = (-Math.PI / 2) + (Math.random() - 0.5) * Math.PI * 1.15;
    const speed = 7 + Math.random() * 11;
    particles.push({
      x: originX + (Math.random() - 0.5) * 80,
      y: originY + (Math.random() - 0.5) * 24,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      rot: Math.random() * Math.PI * 2,
      vr: (Math.random() - 0.5) * 0.35,
      w: 5 + Math.random() * 6,
      h: 3 + Math.random() * 4,
      color: colors[Math.floor(Math.random() * colors.length)],
      life: 0,
      ttl: 55 + Math.random() * 35,
    });
  }

  let raf = 0;
  const gravity = 0.22;
  const drag = 0.992;

  function tick() {
    const w = window.innerWidth;
    const h = window.innerHeight;
    ctx!.clearRect(0, 0, w, h);
    let alive = 0;
    for (const p of particles) {
      p.life += 1;
      if (p.life > p.ttl) continue;
      alive += 1;
      p.vx *= drag;
      p.vy = p.vy * drag + gravity;
      p.x += p.vx;
      p.y += p.vy;
      p.rot += p.vr;
      const alpha = Math.max(0, 1 - p.life / p.ttl);
      ctx!.save();
      ctx!.translate(p.x, p.y);
      ctx!.rotate(p.rot);
      ctx!.globalAlpha = alpha;
      ctx!.fillStyle = p.color;
      ctx!.fillRect(-p.w / 2, -p.h / 2, p.w, p.h);
      ctx!.restore();
    }
    if (alive > 0) {
      raf = requestAnimationFrame(tick);
    } else {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
      canvas.remove();
    }
  }

  window.addEventListener("resize", resize);
  raf = requestAnimationFrame(tick);
}
