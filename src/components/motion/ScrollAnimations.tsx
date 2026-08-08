"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { usePathname } from "next/navigation";
import { registerGsap } from "./GsapProvider";

function prefersReducedMotion() {
  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

function fromVars(type: string | undefined) {
  if (type === "fade-in") return { opacity: 0 };
  if (type === "fade-left") return { opacity: 0, x: -28 };
  if (type === "fade-right") return { opacity: 0, x: 28 };
  return { opacity: 0, y: 36 };
}

export function ScrollAnimations() {
  registerGsap();
  const pathname = usePathname();

  useGSAP(
    () => {
      if (prefersReducedMotion()) return;

      gsap.utils.toArray<HTMLElement>("[data-animate]").forEach((el) => {
        gsap.fromTo(el, fromVars(el.dataset.animate), {
          opacity: 1,
          x: 0,
          y: 0,
          duration: 0.85,
          ease: "power2.out",
          clearProps: "transform",
          scrollTrigger: {
            trigger: el,
            start: "top 88%",
            toggleActions: "play none none none",
          },
        });
      });

      gsap.utils
        .toArray<HTMLElement>("[data-animate-stagger]")
        .forEach((parent) => {
          const items = Array.from(parent.children) as HTMLElement[];
          if (items.length === 0) return;

          gsap.fromTo(
            items,
            { opacity: 0, y: 24 },
            {
              opacity: 1,
              y: 0,
              duration: 0.65,
              stagger: 0.08,
              ease: "power2.out",
              clearProps: "transform",
              scrollTrigger: {
                trigger: parent,
                start: "top 88%",
                toggleActions: "play none none none",
              },
            },
          );
        });
    },
    { dependencies: [pathname], revertOnUpdate: true },
  );

  return null;
}
