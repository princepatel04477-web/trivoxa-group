/**
 * Particle choreography.
 *
 * The scene's beat list, kept here rather than inline in the route file so the
 * sequence is legible in one place.
 *
 * Only the home page runs a particle field. The inner pages carry bespoke GLSL
 * shader backgrounds instead (see ShaderBackground and src/shaders), which sit
 * on the same fixed z-index:-1 layer — running both would mean two WebGL
 * contexts and two ambient systems competing per page.
 */

import type { SceneConfig } from "./particle-scene";

/**
 * Home — a deliberate, sparse sequence:
 *   globe (hero) → vessel (trust) → container (about) → [hidden: business arms
 *   + industries] → ports globe (global presence) → [hidden: values / insights
 *   / careers] → eagle (CTA) → dimmed eagle (footer).
 *
 * The field is faded out across the content-dense sections on purpose, so it
 * never competes with the copy.
 */
export const HOME: Omit<SceneConfig, "onDegrade"> = {
  hero: "globe",
  ports: true,
  beats: [
    // Trust ("A sourcing partner, not just a supplier directory") — a cargo
    // vessel. The hero globe flies straight into the ship. Sits to the side.
    { trigger: ".hp-trust", shape: "cargo-ship", sweep: 1 },
    // About ("A Vision Beyond Business") — a single small container.
    { trigger: ".hp-about", shape: "container", sweep: 0.7 },
    // Business Arms + Industries carousel — NO animation. Fade the field fully
    // out and hold it hidden across both content-dense sections.
    { trigger: ".hp-sec-4", opacity: 0 },
    // Global Presence ("Connecting Opportunities Across Borders") — the big
    // ports globe with named markers, parked on the RIGHT so the section's copy
    // (left-aligned in CSS) sits clear of it.
    {
      trigger: ".hp-global",
      shape: "globe",
      sweep: 1,
      ports: true,
      onLeaveBack: { opacity: 0 }, // scrolling up into the carousel
    },
    // Values / Insights / Careers — NO animation. Keep the field hidden.
    { trigger: ".hp-values", opacity: 0 },
    // Final CTA — the Trivoxa eagle, in grains, behind the copy.
    { trigger: ".hp-cta", shape: "eagle", sweep: 0 },
    // Footer — hold the eagle but drop it to a dim wash so footer copy stays
    // fully legible; scrolling back up restores full opacity.
    {
      trigger: ".footer",
      opacity: 0.18,
      fadeDuration: 0.8,
      onLeaveBack: { opacity: 1, fadeDuration: 0.5 },
    },
  ],
};
