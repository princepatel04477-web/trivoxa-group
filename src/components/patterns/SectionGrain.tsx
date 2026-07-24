"use client";

import { useEffect, useRef, useState } from "react";
import GrainOverlay from "@/components/hero/GrainOverlay";
import { gsap } from "@/lib/gsap";

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function matches(query: string): boolean {
  return typeof window !== "undefined" ? window.matchMedia(query).matches : false;
}

export interface SectionGrainProps {
  className: string;
  /** Adds the home hero's radial-gradient edge darkening (`.grain-globe__vignette`). */
  vignette?: boolean;
  /** Self-contained GSAP scrub: scales this wrapper 1 → 1.15 as its parent
   * section scrolls past. Independent of any external pinned timeline —
   * unlike the home hero's version (tied into HeroSection's own pin/scrub
   * sequence), this sets up its own ScrollTrigger against its immediate
   * parent element, so it works on any section dropped anywhere. */
  scrollScale?: boolean;
}

/** Scoped film-grain atmosphere layer, following the hero's GrainGlobe
 * matchMedia convention but reusable across sections via `className`. */
export default function SectionGrain({ className, vignette = false, scrollScale = false }: SectionGrainProps) {
  const [isMobile, setIsMobile] = useState(() => matches(MOBILE_QUERY));
  const [reducedMotion, setReducedMotion] = useState(() => matches(REDUCED_MOTION_QUERY));
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const motionQuery = window.matchMedia(REDUCED_MOTION_QUERY);
    const onMobileChange = (e: MediaQueryListEvent) => setIsMobile(e.matches);
    const onMotionChange = (e: MediaQueryListEvent) => setReducedMotion(e.matches);
    mobileQuery.addEventListener("change", onMobileChange);
    motionQuery.addEventListener("change", onMotionChange);
    return () => {
      mobileQuery.removeEventListener("change", onMobileChange);
      motionQuery.removeEventListener("change", onMotionChange);
    };
  }, []);

  useEffect(() => {
    if (!scrollScale || !wrapperRef.current) return;
    const wrapper = wrapperRef.current;
    const trigger = wrapper.parentElement;
    if (!trigger) return;
    const ctx = gsap.context(() => {
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.to(wrapper, {
          scale: 1.15,
          ease: "none",
          scrollTrigger: { trigger, start: "top top", end: "bottom top", scrub: true },
        });
      });
    });
    return () => ctx.revert();
  }, [scrollScale]);

  return (
    <div className={className} ref={wrapperRef} aria-hidden="true">
      <GrainOverlay frameSkip={isMobile ? 4 : 2} reducedMotion={reducedMotion} />
      {vignette && <div className="grain-globe__vignette" />}
    </div>
  );
}
