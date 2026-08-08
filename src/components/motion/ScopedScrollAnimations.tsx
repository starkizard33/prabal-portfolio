"use client";

import { usePathname } from "next/navigation";
import { ScrollAnimations } from "@/components/motion/ScrollAnimations";

/** Only mount GSAP scroll work on routes that use data-animate / film. */
export function ScopedScrollAnimations() {
  const pathname = usePathname();
  // Casino / other hangar routes skip GSAP entirely.
  const needsScroll =
    pathname === "/" ||
    pathname === "/starkizard" ||
    pathname.startsWith("/starkizard/play/");

  if (!needsScroll) return null;
  return <ScrollAnimations />;
}
