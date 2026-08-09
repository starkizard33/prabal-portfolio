import { profile } from "@/data/profile";

export function Projects() {
  return (
    <section id="projects" className="section-pad scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-6xl">
        <div data-animate="fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
            Projects
          </p>
          <h2 className="display mt-3 max-w-xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
            Things I&apos;ve built and broken in.
          </h2>
        </div>
        <div data-animate-stagger className="mt-10 border-y-2 border-ink/15">
          {profile.projects.map((project) => (
            <a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-2 border-b border-ink/12 py-5 transition last:border-b-0 md:grid-cols-[1fr_1.5fr_auto] md:items-baseline md:gap-6 md:py-6"
            >
              <h3 className="display text-2xl font-bold text-ink transition group-hover:text-blueprint md:text-[1.65rem]">
                {project.name}
              </h3>
              <p className="text-[15px] leading-relaxed text-ink-soft">
                {project.description}
              </p>
              <div className="flex flex-wrap gap-x-3 gap-y-1 md:justify-end">
                {project.tags.map((tag) => (
                  <span
                    key={tag}
                    className="font-mono text-[11px] uppercase tracking-wider text-steel"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
