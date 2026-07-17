"use client";

import { useEffect, useState } from "react";
import GrainOverlay from "@/components/hero/GrainOverlay";

const MOBILE_QUERY = "(max-width: 767px)";
const REDUCED_MOTION_QUERY = "(prefers-reduced-motion: reduce)";

function matches(query: string): boolean {
  return typeof window !== "undefined" ? window.matchMedia(query).matches : false;
}

/** Scoped film-grain atmosphere layer, following the hero's GrainGlobe
 * matchMedia convention but reusable across sections via `className`. */
export default function SectionGrain({ className }: { className: string }) {
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
    <div className={className} aria-hidden="true">
      <GrainOverlay frameSkip={isMobile ? 4 : 2} reducedMotion={reducedMotion} />
    </div>
  );
}
