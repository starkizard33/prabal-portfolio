import { profile } from "@/data/profile";

export function Experience() {
  return (
    <section id="experience" className="section-pad scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
          Experience
        </p>
        <h2 className="display mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Work that has to be right at scale.
        </h2>
        <ol className="mt-12 space-y-0">
          {profile.experience.map((job, index) => (
            <li
              key={`${job.company}-${job.role}-${job.period}`}
              className="grid gap-4 border-t border-ink/10 py-8 md:grid-cols-[220px_1fr] md:gap-10"
            >
              <div>
                <p className="font-mono text-xs tracking-wide text-steel">
                  {job.period}
                </p>
                <p className="mt-2 text-lg font-semibold text-ink">
                  {job.role}
                </p>
                <p className="text-ink-soft">{job.company}</p>
                {index === 0 ? (
                  <span className="mt-3 inline-block rounded-full bg-signal/10 px-3 py-1 text-xs font-medium text-signal-deep">
                    Current
                  </span>
                ) : null}
              </div>
              <ul className="space-y-2.5 text-[15px] leading-relaxed text-ink-soft">
                {job.highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-signal"
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
