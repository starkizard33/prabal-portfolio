import Link from "next/link";

const links = [
  { href: "/starkizard", label: "Hangar" },
  { href: "/starkizard/casino", label: "Casino" },
];

export function StarkizardNav() {
  return (
    <header className="section-pad sticky top-0 z-40 border-b border-white/8 bg-sz-void/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-3">
        <Link
          href="/starkizard"
          className="display text-lg font-bold tracking-tight text-sz-mist"
        >
          STARKIZARD
        </Link>
        <ul className="flex items-center gap-4 text-sm text-sz-mist/70 md:gap-6">
          {links.map((link) => (
            <li key={link.href}>
              <Link href={link.href} className="transition hover:text-sz-jade">
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              className="rounded-full border border-white/15 px-3 py-1.5 text-sz-mist transition hover:border-sz-jade/50 hover:text-sz-jade"
            >
              Prabal
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
