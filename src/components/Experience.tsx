import { profile } from "@/data/profile";

export function Experience() {
  return (
    <section id="experience" className="section-pad scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-animate="fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
            Experience
          </p>
          <h2 className="display mt-3 max-w-2xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Work that has to be right at scale.
          </h2>
        </div>
        <ol data-animate-stagger className="mt-10 border-l-2 border-ink/20">
          {profile.experience.map((job, index) => (
            <li
              key={`${job.company}-${job.role}-${job.period}`}
              className="relative grid gap-4 border-b border-ink/15 py-7 pl-6 md:grid-cols-[220px_1fr] md:gap-10 md:pl-8"
            >
              <span
                aria-hidden
                className="absolute top-9 -left-[5px] h-2 w-2 rounded-full bg-blueprint"
              />
              <div>
                <p className="font-mono text-xs tracking-wide text-steel">
                  {job.period}
                </p>
                <p className="display mt-2 text-xl font-bold text-ink md:text-2xl">
                  {job.role}
                </p>
                <p className="text-ink-soft">{job.company}</p>
                {index === 0 ? (
                  <span className="mt-3 inline-block border border-blueprint/30 bg-blueprint/10 px-2.5 py-0.5 text-xs font-medium text-signal-deep">
                    Current
                  </span>
                ) : null}
              </div>
              <ul className="space-y-2 text-[15px] leading-relaxed text-ink-soft">
                {job.highlights.map((item) => (
                  <li key={item} className="flex gap-3">
                    <span
                      aria-hidden
                      className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-blueprint"
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
