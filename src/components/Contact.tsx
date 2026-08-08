import { profile } from "@/data/profile";

export function Contact() {
  return (
    <section id="contact" className="work-section section-pad scroll-mt-24 py-20 md:py-28">
      <div
        data-animate="fade-up"
        className="mx-auto max-w-6xl overflow-hidden rounded-[2rem] border border-ink/10 bg-ink text-mist"
      >
        <div className="relative px-8 py-14 md:px-14 md:py-16">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-10 -top-16 h-64 w-64 rounded-full bg-[radial-gradient(circle,rgba(194,59,34,0.45),transparent_65%)]"
          />
          <p className="font-mono text-xs uppercase tracking-[0.28em] text-fog">
            Contact
          </p>
          <h2 className="display mt-3 max-w-xl text-4xl font-bold tracking-tight md:text-5xl">
            Let&apos;s talk clearing systems, engines, or scale bugs.
          </h2>
          <div className="mt-8 flex flex-wrap gap-3">
            <a
              href={`mailto:${profile.email}`}
              className="rounded-full bg-signal px-6 py-3 text-sm font-semibold text-white transition hover:bg-signal-deep"
            >
              {profile.email}
            </a>
            <a
              href={profile.links.linkedin}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition hover:border-white/50"
            >
              LinkedIn
            </a>
            <a
              href={profile.links.github}
              target="_blank"
              rel="noreferrer"
              className="rounded-full border border-white/20 px-6 py-3 text-sm font-semibold transition hover:border-white/50"
            >
              GitHub
            </a>
          </div>
          <p className="mt-6 text-sm text-fog">{profile.phone}</p>
        </div>
      </div>
    </section>
  );
}
