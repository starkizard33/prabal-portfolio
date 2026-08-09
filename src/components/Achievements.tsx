import { profile } from "@/data/profile";

export function Achievements() {
  return (
    <section
      id="achievements"
      className="section-pad scroll-mt-24 py-20 md:py-28"
    >
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
          Achievements
        </p>
        <h2 className="display mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Leaderboards, records, and one Outstanding year.
        </h2>
        <ul className="mt-12 grid gap-x-8 gap-y-6 sm:grid-cols-2">
          {profile.achievements.map((item) => (
            <li key={`${item.title}-${item.detail}`} className="border-t border-ink/10 pt-4">
              <p className="font-mono text-[11px] uppercase tracking-[0.2em] text-steel">
                {item.when}
              </p>
              <p className="display mt-2 text-2xl font-bold text-ink">
                {item.title}
              </p>
              <p className="mt-1 text-ink-soft">{item.detail}</p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
