import { profile } from "@/data/profile";

export function Achievements() {
  return (
    <section
      id="achievements"
      className="section-pad scroll-mt-24 py-16 md:py-24"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
          Achievements
        </p>
        <h2 className="display mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Leaderboards, records, and one Outstanding year.
        </h2>
        <ul className="mt-10 grid gap-px border border-ink/15 bg-ink/15 sm:grid-cols-2">
          {profile.achievements.map((item) => (
            <li
              key={`${item.title}-${item.detail}`}
              className="bg-[color-mix(in_oklab,var(--paper)_92%,white)] px-5 py-4"
            >
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
                {item.when}
              </p>
              <p className="display mt-1.5 text-xl font-bold text-ink md:text-2xl">
                {item.title}
              </p>
              <p className="mt-1 text-sm text-ink-soft">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
