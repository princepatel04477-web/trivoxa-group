"use client";

import { useEffect, useState } from "react";
import GrainOverlay from "./GrainOverlay";

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function matches(query: string): boolean {
  return typeof window !== "undefined" ? window.matchMedia(query).matches : false;
}

/**
 * Cinematic atmosphere layer for the hero: animated film grain + a radial
 * vignette, scoped to the hero section (not the full viewport) so it sits
 * over the existing particle globe without introducing a second one.
 */
export default function GrainGlobe() {
  const [isMobile, setIsMobile] = useState(() => matches(MOBILE_QUERY));
  const [reducedMotion, setReducedMotion] = useState(() => matches(REDUCED_MOTION_QUERY));

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

  return (
    <div className="grain-globe" aria-hidden="true">
      <GrainOverlay frameSkip={isMobile ? 4 : 2} reducedMotion={reducedMotion} />
      <div className="grain-globe__vignette" />
    </div>
  );
}
