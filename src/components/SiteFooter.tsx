import Link from "next/link";
import { profile } from "@/data/profile";

export function SiteFooter() {
  return (
    <footer className="section-pad border-t border-ink/10 py-8">
      <div className="mx-auto flex max-w-6xl flex-col gap-3 text-sm text-steel md:flex-row md:items-center md:justify-between">
        <p>
          © {new Date().getFullYear()} {profile.name} · aka {profile.handle}
        </p>
        <div className="flex flex-wrap gap-4">
          <Link href="/starkizard" className="hover:text-signal">
            Starkizard
          </Link>
          <a href={profile.links.codeforces} target="_blank" rel="noreferrer" className="hover:text-signal">
            Codeforces
          </a>
          <a href={profile.links.devpost} target="_blank" rel="noreferrer" className="hover:text-signal">
            Devpost
          </a>
        </div>
      </div>
    </footer>
  );
}
