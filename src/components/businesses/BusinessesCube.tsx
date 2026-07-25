"use client";

import dynamic from "next/dynamic";
import { BUSINESSES } from "@/lib/choreography";

// ssr:false keeps the WebGL scene out of the server render entirely — nothing to
// hydrate, so no mismatch and no mount-gate state.
const ParticleCanvas = dynamic(() => import("@/components/ParticleCanvas"), { ssr: false });

/**
 * The Businesses signature animation: a cube that unfolds into sectors.
 *
 * Owns the BUSINESSES config rather than receiving it as a prop — the config
 * carries `buildStages`, and functions can't cross the server→client boundary.
 */
export default function BusinessesCube() {
  return <ParticleCanvas config={BUSINESSES} />;
}
