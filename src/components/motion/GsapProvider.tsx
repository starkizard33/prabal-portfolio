"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import type { ReactNode } from "react";

let registered = false;

export function registerGsap() {
  if (registered) return;
  gsap.registerPlugin(ScrollTrigger, useGSAP);
  registered = true;
}

/** Ensures GSAP + ScrollTrigger are registered once for the app tree. */
export function GsapProvider({ children }: { children: ReactNode }) {
  registerGsap();
  return children;
}
