/**
 * Global film/paper grain layer — the permanent brand texture.
 *
 * A single overlay mounted once at the root (last child of <body>) so a uniform
 * grain sits over every page. `mix-blend-mode: soft-light` lets one layer read
 * correctly over the navy ground and every surface above it, without needing a
 * per-section variant.
 *
 * The inner layer animates: the tiled noise field steps to a new offset roughly
 * 8×/second, which reseeds the grain visually while changing nothing but a
 * transform — compositor-only, so it costs the same at any viewport size and
 * needs no JS. Reduced motion holds one static field. All styling and the step
 * cadence live in `.grain-overlay` (globals.css).
 */
export function GrainOverlay() {
  return (
    <div className="grain-overlay" aria-hidden="true">
      <div className="grain-overlay__layer" />
    </div>
  );
}
