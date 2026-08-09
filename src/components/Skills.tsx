import { profile } from "@/data/profile";

export function Skills() {
  const groups = [
    { label: "Languages", items: profile.skills.languages },
    { label: "Backend", items: profile.skills.backend },
    { label: "Infra", items: profile.skills.infra },
    { label: "Other", items: profile.skills.other },
  ];

  return (
    <section id="skills" className="section-pad scroll-mt-24 py-20 md:py-28">
      <div className="mx-auto max-w-6xl">
        <p className="font-mono text-xs uppercase tracking-[0.28em] text-steel">
          Skills
        </p>
        <h2 className="display mt-3 text-4xl font-bold tracking-tight text-ink md:text-5xl">
          Stack I reach for.
        </h2>
        <div className="mt-12 grid gap-8 md:grid-cols-2">
          {groups.map((group) => (
            <div key={group.label}>
              <h3 className="font-mono text-xs uppercase tracking-[0.22em] text-steel">
                {group.label}
              </h3>
              <p className="mt-3 text-lg leading-relaxed text-ink">
                {group.items.join(" · ")}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
