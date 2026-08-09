import Link from "next/link";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section className="section-pad relative overflow-hidden">
      <div
        aria-hidden
        className="reactor pointer-events-none absolute -right-16 top-10 h-72 w-72 rounded-full bg-[radial-gradient(circle,var(--glow),transparent_65%)]"
      />
      <div className="relative mx-auto grid min-h-[78vh] max-w-6xl items-end gap-10 pb-16 pt-20 md:grid-cols-[1.2fr_0.8fr] md:pb-24 md:pt-28">
        <div>
          <p className="animate-rise font-mono text-xs uppercase tracking-[0.28em] text-steel">
            {profile.title}
          </p>
          <h1 className="display animate-rise-delay-1 mt-4 text-[clamp(3.4rem,10vw,6.4rem)] leading-[0.92] font-extrabold tracking-tight text-ink">
            Prabal
            <br />
            Kalia
          </h1>
          <p className="animate-rise-delay-2 mt-6 max-w-xl text-lg leading-relaxed text-ink-soft md:text-xl">
            {profile.tagline}
          </p>
          <div className="animate-rise-delay-3 mt-9 flex flex-wrap gap-3">
            <a
              href="#experience"
              className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white transition hover:bg-signal-deep"
            >
              View work
            </a>
            <Link
              href="/starkizard"
              className="rounded-full border border-ink/20 bg-white/40 px-6 py-3 text-sm font-semibold text-ink transition hover:border-ink/40"
            >
              Starkizard hangar
            </Link>
          </div>
        </div>
        <div className="animate-rise-delay-2 relative hidden min-h-72 md:block">
          <div className="absolute inset-0 rounded-[2rem] border border-ink/10 bg-white/35 shadow-[0_30px_80px_rgba(18,21,28,0.08)] backdrop-blur-sm" />
          <div className="relative flex h-full flex-col justify-between p-8">
            <div>
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
                Currently
              </p>
              <p className="display mt-3 text-3xl font-bold text-ink">
                Clearing systems @ Zeta
              </p>
              <p className="mt-3 text-sm leading-relaxed text-ink-soft">
                Matching, rule engines, and network onboarding — built to stay
                correct when volume spikes.
              </p>
            </div>
            <dl className="grid grid-cols-2 gap-4 border-t border-ink/10 pt-5 text-sm">
              <div>
                <dt className="text-steel">Handle</dt>
                <dd className="font-medium text-ink">{profile.handle}</dd>
              </div>
              <div>
                <dt className="text-steel">Education</dt>
                <dd className="font-medium text-ink">IIIT Kottayam · 9.33</dd>
              </div>
            </dl>
          </div>
        </div>
      </div>
    </section>
  );
}
