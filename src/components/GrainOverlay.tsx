/**
 * Global film/paper grain layer.
 *
 * A single static overlay mounted once at the root (last child of <body>) so a
 * uniform grain sits over every page. `mix-blend-mode: soft-light` lets one
 * layer read correctly over the navy ground and any lighter surface without a
 * per-section variant. STATIC ONLY — never animate this; animated grain
 * repaints every frame and would break the 60fps floor alongside the WebGL
 * particle field. All styling lives in `.grain-overlay` (globals.css).
 */
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
