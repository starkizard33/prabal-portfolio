import { profile } from "@/data/profile";

export function Projects() {
  return (
    <section id="projects" className="section-pad scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
          Projects
        </p>
        <h2 className="display mt-3 max-w-xl text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Things I&apos;ve built and broken in.
        </h2>
        <div className="mt-12 divide-y divide-ink/10 border-y border-ink/10">
          {profile.projects.map((project) => (
            <a
              key={project.name}
              href={project.href}
              target="_blank"
              rel="noreferrer"
              className="group grid gap-3 py-7 transition md:grid-cols-[1fr_1.4fr_auto] md:items-center"
            >
              <h3 className="display text-2xl font-bold text-ink transition group-hover:text-signal">
                {project.name}
              </h3>
              <p className="text-ink-soft">{project.description}</p>
              <div className="flex flex-wrap gap-2 md:justify-end">
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
