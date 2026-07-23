"use client";

import { type ReactNode, useEffect } from "react";
import { usePathname } from "next/navigation";
import Lenis from "lenis";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { on, emit } from "@/lib/site-events";

let lenisInstance: Lenis | null = null;
export function getLenis(): Lenis | null {
  return lenisInstance;
}

export default function LenisProvider({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Lenis + every ScrollTrigger outlive client-side navigations (this provider
  // sits in the root layout), so without this the new page inherits the old
  // page's scroll offset and stale trigger positions — content gated behind
  // scroll-reveal animations stays hidden until a hard refresh. On each route
  // change: snap back to the top (unless deep-linking to an anchor) and
  // re-measure triggers after the new page has painted.
  useEffect(() => {
    if (!window.location.hash) {
      const lenis = lenisInstance;
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
    }
    const id = window.setTimeout(() => ScrollTrigger.refresh(), 100);
    return () => window.clearTimeout(id);
  }, [pathname]);

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
