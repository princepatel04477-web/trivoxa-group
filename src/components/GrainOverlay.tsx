/**
 * Global film/paper grain layer.
 *
 * A single STATIC overlay mounted once at the root (last child of <body>) so a
 * uniform grain sits over every page. `mix-blend-mode: soft-light` lets one
 * layer read correctly over the navy ground and any lighter surface without a
 * per-section variant. It is intentionally still — the only animated grain is
 * the scoped canvas grain behind each page's hero (SectionGrain / `.hero-grain`,
 * which is IntersectionObserver-gated and reduced-motion aware). All styling
 * lives in `.grain-overlay` (globals.css).
 */
export function GrainOverlay() {
  return <div className="grain-overlay" aria-hidden="true" />;
}
