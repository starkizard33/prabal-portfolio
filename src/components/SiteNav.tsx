import Link from "next/link";

const links = [
  { href: "#about", label: "About" },
  { href: "#experience", label: "Experience" },
  { href: "#projects", label: "Projects" },
  { href: "#achievements", label: "Wins" },
  { href: "#contact", label: "Contact" },
];

export function SiteNav() {
  return (
    <header className="section-pad sticky top-0 z-40 border-b border-ink/8 bg-paper/75 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-4 py-3">
        <Link
          href="/"
          className="display text-lg font-bold tracking-tight text-ink"
        >
          Prabal Kalia
        </Link>
        <ul className="hidden items-center gap-6 text-sm text-ink-soft md:flex">
          {links.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className="transition-colors hover:text-signal"
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
        <Link
          href="/starkizard"
          className="rounded-full bg-ink px-4 py-2 text-sm font-medium text-mist transition hover:bg-signal"
        >
          Enter Starkizard
        </Link>
      </nav>
    </header>
  );
}
