import { profile } from "@/data/profile";

export function About() {
  return (
    <section id="about" className="work-section section-pad scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto grid max-w-6xl gap-10 md:grid-cols-[0.85fr_1.15fr]">
        <div data-animate="fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
            About
          </p>
          <h2 className="display mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Engineer first.
            <br />
            Builder always.
          </h2>
        </div>
        <div
          data-animate-stagger
          className="space-y-5 text-base leading-relaxed text-ink-soft md:text-lg"
        >
          {profile.about.map((paragraph) => (
            <p key={paragraph}>{paragraph}</p>
          ))}
          <p>
            Find me on{" "}
            <a
              className="font-medium text-signal underline-offset-4 hover:underline"
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
            >
              GitHub
            </a>
            ,{" "}
            <a
              className="font-medium text-signal underline-offset-4 hover:underline"
              href={profile.links.codeforces}
              target="_blank"
              rel="noreferrer"
            >
              Codeforces
            </a>
            , and{" "}
            <a
              className="font-medium text-signal underline-offset-4 hover:underline"
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
            >
              LinkedIn
            </a>
            .
          </p>
        </div>
      </div>
    </section>
  );
}
