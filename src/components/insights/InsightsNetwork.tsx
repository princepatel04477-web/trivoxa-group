"use client";

import dynamic from "next/dynamic";
import { INSIGHTS } from "@/lib/choreography";

// ssr:false keeps the WebGL scene out of the server render entirely — nothing to
// hydrate, so no mismatch and no mount-gate state.
const ParticleCanvas = dynamic(() => import("@/components/ParticleCanvas"), { ssr: false });

/**
 * The Insights signature animation: a point of light expanding into an
 * intelligence network.
 *
 * Owns the INSIGHTS config rather than receiving it as a prop — the config carries
 * `buildStages` and `buildPhase`, and functions can't cross the server→client
 * boundary.
 */
export default function InsightsNetwork() {
  return <ParticleCanvas config={INSIGHTS} />;
}
