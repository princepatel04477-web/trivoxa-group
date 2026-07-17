"use client";

import { type ReactNode, useEffect } from "react";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { on, emit } from "@/lib/site-events";

let lenisInstance: Lenis | null = null;
export function getLenis(): Lenis | null {
  return lenisInstance;
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const lenis = new Lenis({
      lerp: 0.09,
      duration: 1.2,
      smoothWheel: true,
    });
    lenisInstance = lenis;
    emit("lenis:init");

    lenis.on("scroll", ScrollTrigger.update);

    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);

    const unsubOpen = on("modal:open", () => lenis.stop());
    const unsubClose = on("modal:close", () => lenis.start());

    ScrollTrigger.refresh();

    return () => {
      unsubOpen();
      unsubClose();
      gsap.ticker.remove(raf);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);

  return <>{children}</>;
}
