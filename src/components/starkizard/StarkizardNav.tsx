"use client";

import { useOptionalCasinoSession } from "@/casino/session/CasinoSessionContext";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import type { MouseEvent } from "react";

const links = [
  { href: "/starkizard", label: "Hangar" },
  { href: "/starkizard#interests", label: "Play" },
  { href: "/starkizard/casino", label: "Casino" },
] as const;

function formatNet(net: number): string {
  if (net > 0) return `+${net}`;
  return `${net}`;
}

export function StarkizardNav() {
  const pathname = usePathname();
  const router = useRouter();
  const session = useOptionalCasinoSession();
  const onCasinoFloor =
    !!pathname?.includes("/casino") && !!session?.state.active;

  function confirmLeaveFloor(href: string, event: MouseEvent<HTMLAnchorElement>) {
    if (!onCasinoFloor || !session) return;
    if (href.startsWith("/starkizard/casino")) return;

    event.preventDefault();
    const { bankroll, startBankroll, hands, spins } = session.state;
    const net = bankroll - startBankroll;
    const ok = window.confirm(
      [
        "Leave the casino?",
        `Cash out: ${bankroll} Zard (net ${formatNet(net)})`,
        `Hands ${hands} · Spins ${spins}`,
        "Unsettled table stakes will be returned first.",
      ].join("\n"),
    );
    if (!ok) return;
    session.leaveCasino();
    router.push(href);
  }

  return (
    <header className="section-pad sticky top-0 z-40 border-b border-white/8 bg-sz-void/80 backdrop-blur-md">
      <nav className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-4 gap-y-2 py-3">
        <Link
          href="/starkizard"
          data-egg="brand"
          onClick={(e) => confirmLeaveFloor("/starkizard", e)}
          className="display text-lg font-bold tracking-tight text-sz-mist"
          title="Tony Stark × Charizard. Type numb for a real LP dad joke."
        >
          STARKIZARD
        </Link>
        <ul className="flex flex-wrap items-center gap-x-3 gap-y-2 text-sm text-sz-mist/70 sm:gap-x-5">
          {links.map((link) => (
            <li key={link.href}>
              <Link
                href={link.href}
                onClick={(e) => confirmLeaveFloor(link.href, e)}
                className="transition hover:text-sz-jade"
              >
                {link.label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/"
              onClick={(e) => confirmLeaveFloor("/", e)}
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
