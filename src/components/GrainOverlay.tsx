/**
 * Global film/paper grain layer.
 *
 * A single overlay mounted once at the root (last child of <body>) so a uniform
 * grain sits over every page. `mix-blend-mode: soft-light` lets one layer read
 * correctly over the navy ground and any lighter surface without a per-section
 * variant. It animates as a subtle film shimmer, done cheaply: the noise tile
 * repeats, so only `background-position` jitters in discrete steps (~11/sec) —
 * no per-pixel canvas or animated feTurbulence, so the compositor cost stays low
 * enough to hold the 60fps floor alongside the WebGL particle field. The
 * animation is disabled under prefers-reduced-motion and slowed on small
 * screens. All styling lives in `.grain-overlay` (globals.css).
 */
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
