import Link from "next/link";
import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer
      className="section-pad border-t border-ink/10 py-8"
      data-egg="footnote"
      title="Type charizard (not in a box) for a real dad joke."
    >
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-steel md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name} · aka{" "}
          <span data-egg="handle" className="text-ink/70">
            {profile.handle}
          </span>
          <span className="sr-only">
            {" "}
            · Why wouldn&apos;t Blastoise share with Charizard? He was a shellfish
            Pokémon.
          </span>
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/starkizard" className="hover:text-signal">
            Starkizard
          </Link>
          <Link href="/starkizard/casino" className="hover:text-signal">
            Casino
          </Link>
          <a
            href={profile.links.codeforces}
            target="_blank"
            rel="noreferrer"
            className="hover:text-signal"
            title="Why did the F1 car visit the doctor? Exhausted."
          >
            Codeforces
          </a>
          <a
            href={profile.links.devpost}
            target="_blank"
            rel="noreferrer"
            className="hover:text-signal"
            title="A king and queen walk into a bar… not 21."
          >
            Devpost
          </a>
          <Link
            href="/?egg=joke"
            className="opacity-25 transition hover:opacity-100 hover:text-signal"
            aria-label="Random dad joke egg"
          >
            ·
          </Link>
        </div>
      </div>
    </footer>
  );
}
