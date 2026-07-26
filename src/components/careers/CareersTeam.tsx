"use client";

import dynamic from "next/dynamic";
import { CAREERS } from "@/lib/choreography";

// ssr:false keeps the WebGL scene out of the server render entirely — nothing to
// hydrate, so no mismatch and no mount-gate state.
const ParticleCanvas = dynamic(() => import("@/components/ParticleCanvas"), { ssr: false });

/**
 * The Careers signature animation: abstract silhouettes assembling into a team.
 *
 * Owns the CAREERS config rather than receiving it as a prop — the config carries
 * `buildStages` and `buildPhase`, and functions can't cross the server→client
 * boundary.
 */
export default function CareersTeam() {
  return <ParticleCanvas config={CAREERS} />;
}
