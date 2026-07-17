"use client";

import { useVelocitySkew } from "@/hooks/useScrollAnimations";

const DISPLAY_HEADING_SELECTOR = [
  ".title-anim",
  ".home-heading",
  ".arm-panel__title",
  ".industries-folio__title",
  ".industries-folio__name",
  ".values-hover__title",
  ".tvx-hero h1",
  ".tvx-section h2",
  ".sticky-rail__chapter-title h3",
].join(", ");

/** Mounted once site-wide (layout.tsx) to drive scroll-velocity skew on display headings only. */
export default function VelocitySkewHeadings() {
  useVelocitySkew(DISPLAY_HEADING_SELECTOR);
  return null;
}
