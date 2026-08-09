import Link from "next/link";
import { StarkizardNav } from "@/components/starkizard/StarkizardNav";
import type { ReactNode } from "react";

type PlayShellProps = {
  eyebrow: string;
  title: string;
  blurb?: string;
  children: ReactNode;
};

export function PlayShell({ eyebrow, title, blurb, children }: PlayShellProps) {
  return (
    <div className="sz-atmosphere flex min-h-full flex-1 flex-col text-sz-mist">
      <StarkizardNav />
      <main className="section-pad mx-auto w-full max-w-6xl flex-1 pb-20 pt-8 md:pt-12">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/starkizard#interests"
            className="text-sm text-sz-mist/60 transition hover:text-sz-jade"
          >
            ← Hangar
          </Link>
        </div>
        <header data-animate="fade-up">
          <p className="font-mono text-xs uppercase tracking-[0.32em] text-sz-jade/80">
            {eyebrow}
          </p>
          <h1 className="display mt-3 text-[clamp(2rem,5vw,3.2rem)] font-extrabold tracking-tight">
            {title}
          </h1>
          {blurb ? (
            <p className="mt-3 max-w-2xl text-sm text-sz-mist/70 md:text-base">
              {blurb}
            </p>
          ) : null}
        </header>
        <div className="mt-8" data-animate="fade-up">
          {children}
        </div>
      </main>
    </div>
  );
}
