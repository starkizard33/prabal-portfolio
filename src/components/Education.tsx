import { profile } from "@/data/profile";

export function Education() {
  return (
    <section id="education" className="section-pad scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <div data-animate="fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
            Education
          </p>
          <h2 className="display mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Foundations.
          </h2>
        </div>
        <ul data-animate-stagger className="mt-12 space-y-6">
          {profile.education.map((item) => (
            <li
              key={`${item.school}-${item.degree}`}
              className="grid gap-2 border-l-2 border-signal/50 pl-5 md:grid-cols-[1fr_auto]"
            >
              <div>
                <p className="text-lg font-semibold text-ink">{item.school}</p>
                <p className="text-ink-soft">
                  {item.degree}
                  {item.detail ? ` · ${item.detail}` : null}
                </p>
              </div>
              <p className="font-mono text-xs text-steel md:pt-1">
                {item.period}
              </p>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
