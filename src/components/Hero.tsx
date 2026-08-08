import Link from "next/link";
import { profile } from "@/data/profile";

export function Hero() {
  return (
    <section
      id="hero"
      className="section-pad relative min-h-[100svh] overflow-hidden bg-transparent"
    >
      <div
        aria-hidden
        className="blueprint-grid pointer-events-none absolute inset-0 opacity-55"
      />
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 bottom-0 h-40 bg-gradient-to-t from-[color-mix(in_oklab,var(--paper)_55%,transparent)] to-transparent"
      />

      <div className="relative mx-auto flex min-h-[100svh] max-w-6xl flex-col justify-end gap-10 pb-16 pt-28 md:justify-center md:pb-24 md:pt-24">
        <div className="grid items-end gap-10 lg:grid-cols-[minmax(0,1.15fr)_minmax(280px,0.85fr)] lg:gap-14">
          <div className="min-w-0">
            <p className="animate-rise font-mono text-xs uppercase tracking-[0.28em] text-steel">
              {profile.title}
            </p>
            <h1
              data-egg="brand"
              className="display animate-rise-delay-1 mt-4 text-[clamp(3.6rem,11vw,7rem)] leading-[0.9] font-extrabold tracking-tight text-ink"
            >
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
                className="bg-ink px-6 py-3 text-sm font-semibold text-mist transition hover:bg-signal"
              >
                View work
              </a>
              <Link
                href="/starkizard"
                className="border border-ink/25 bg-white/35 px-6 py-3 text-sm font-semibold text-ink backdrop-blur-sm transition hover:border-ink/45"
              >
                Enter Starkizard
              </Link>
            </div>
          </div>

          <aside className="animate-rise-delay-2 relative w-full max-w-md self-end lg:max-w-none lg:self-center">
            <div className="relative border border-[color-mix(in_oklab,var(--blueprint)_28%,transparent)] bg-white/55 p-7 shadow-[0_24px_60px_rgba(18,36,58,0.08)] backdrop-blur-md md:p-8">
              <div
                aria-hidden
                className="absolute inset-x-5 top-0 h-px bg-gradient-to-r from-transparent via-[var(--blueprint)] to-transparent opacity-50"
              />
              <p className="font-mono text-[11px] uppercase tracking-[0.24em] text-steel">
                Primary stack
              </p>
              <p className="display mt-4 text-[clamp(1.35rem,2.6vw,1.85rem)] leading-snug font-bold tracking-tight text-ink">
                {profile.stackPlaque}
              </p>
              <dl className="mt-7 grid grid-cols-2 gap-4 border-t border-ink/10 pt-5 text-sm">
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    Focus
                  </dt>
                  <dd className="mt-1.5 font-medium text-ink">Payments clearing</dd>
                </div>
                <div>
                  <dt className="font-mono text-[10px] uppercase tracking-[0.18em] text-steel">
                    Handle
                  </dt>
                  <dd className="mt-1.5 font-medium text-ink">{profile.handle}</dd>
                </div>
              </dl>
            </div>
          </aside>
        </div>

        <div className="animate-rise-delay-3 flex flex-wrap items-center gap-x-6 gap-y-2 border-t border-ink/12 pt-5 font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
          <span>Athens · Clearing</span>
          <span aria-hidden className="hidden text-fog sm:inline">
            /
          </span>
          <span>IIIT Kottayam · 9.33</span>
          <span aria-hidden className="hidden text-fog sm:inline">
            /
          </span>
          <span>{profile.location}</span>
        </div>
      </div>
    </section>
  );
}
