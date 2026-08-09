export function MegaRayquaza() {
  return (
    <div
      className="relative mx-auto aspect-[16/10] w-full max-w-4xl overflow-hidden"
      aria-hidden
    >
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_55%,rgba(61,255,154,0.16),transparent_55%)]" />
      <div className="orbit absolute left-1/2 top-1/2 h-[78%] w-[78%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sz-jade/15" />
      <div className="orbit absolute left-1/2 top-1/2 h-[58%] w-[58%] -translate-x-1/2 -translate-y-1/2 rounded-full border border-sz-ember/20 [animation-direction:reverse] [animation-duration:12s]" />

      <svg
        viewBox="0 0 800 500"
        className="serpent absolute inset-0 h-full w-full"
        fill="none"
      >
        <defs>
          <linearGradient id="bodyGrad" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#1fa86a" />
            <stop offset="45%" stopColor="#3dff9a" />
            <stop offset="100%" stopColor="#147a4d" />
          </linearGradient>
          <linearGradient id="accentGrad" x1="0%" y1="50%" x2="100%" y2="50%">
            <stop offset="0%" stopColor="#ff6b2c" />
            <stop offset="100%" stopColor="#f0c45c" />
          </linearGradient>
          <filter id="softGlow" x="-20%" y="-20%" width="140%" height="140%">
            <feGaussianBlur stdDeviation="6" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          className="ribbon"
          d="M60 280 C140 140, 220 390, 320 250 S500 110, 560 230 S680 360, 760 210"
          stroke="url(#accentGrad)"
          strokeWidth="3"
          opacity="0.55"
          filter="url(#softGlow)"
        />

        <path
          d="M80 300 C160 170, 230 400, 330 270 S510 130, 570 250 S690 370, 740 230"
          stroke="url(#bodyGrad)"
          strokeWidth="28"
          strokeLinecap="round"
          filter="url(#softGlow)"
        />
        <path
          d="M80 300 C160 170, 230 400, 330 270 S510 130, 570 250 S690 370, 740 230"
          stroke="#071018"
          strokeWidth="8"
          strokeLinecap="round"
          opacity="0.35"
        />

        {[180, 280, 390, 500, 610].map((x, i) => (
          <g key={x} className="float-soft" style={{ animationDelay: `${i * 0.35}s` }}>
            <path
              d={`M${x} ${210 + (i % 2) * 40} l18 -42 l18 42`}
              stroke="url(#accentGrad)"
              strokeWidth="4"
              fill="none"
              opacity="0.9"
            />
          </g>
        ))}

        <g transform="translate(700 200)">
          <ellipse
            cx="40"
            cy="20"
            rx="56"
            ry="28"
            fill="url(#bodyGrad)"
            filter="url(#softGlow)"
          />
          <path
            d="M70 -10 L120 -40 L95 8 Z"
            fill="#f0c45c"
            opacity="0.95"
          />
          <path d="M70 50 L118 78 L92 28 Z" fill="#ff6b2c" opacity="0.9" />
          <circle cx="62" cy="12" r="5" fill="#071018" />
          <circle cx="63.5" cy="11" r="1.6" fill="#3dff9a" />
        </g>

        <g opacity="0.7">
          <circle cx="220" cy="120" r="2" fill="#3dff9a" />
          <circle cx="480" cy="80" r="1.5" fill="#f0c45c" />
          <circle cx="640" cy="140" r="2" fill="#ff6b2c" />
          <circle cx="150" cy="380" r="1.5" fill="#3dff9a" />
        </g>
      </svg>

      <p className="absolute bottom-3 left-1/2 -translate-x-1/2 font-mono text-[10px] uppercase tracking-[0.35em] text-sz-mist/40">
        Mega Rayquaza online
      </p>
    </div>
  );
}
