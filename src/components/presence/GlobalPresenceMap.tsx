"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

export interface PresenceRegion {
  title: string;
  categories: string[];
}

/** Radial hub-and-spoke diagram: Surat at the centre, six regions arranged
 * around it, connected by curved trade routes with animated cargo flow. A
 * deliberately abstract diagram rather than a literal world outline —
 * accurate continent-shape SVG paths need a real geographic dataset, and an
 * approximate hand-drawn map risks looking either wrong or unprofessional on
 * a real trade site. Hovering (or focusing, for keyboard users) a region
 * node reveals its category chips and a region-specific conversation CTA. */
export default function GlobalPresenceMap({ regions }: { regions: PresenceRegion[] }) {
  const [active, setActive] = useState<number | null>(null);

  const cx = 300;
  const cy = 260;
  const r = 190;
  const nodes = regions.map((region, i) => {
    const angle = (Math.PI * 2 * i) / regions.length - Math.PI / 2;
    const x = cx + r * Math.cos(angle);
    const y = cy + r * Math.sin(angle);
    // Quadratic control point: the route's midpoint pushed perpendicular to
    // the chord, so each spoke reads as a shipping arc, not a straight wire.
    const mx = (cx + x) / 2;
    const my = (cy + y) / 2;
    const nx = -(y - cy);
    const ny = x - cx;
    const norm = Math.hypot(nx, ny) || 1;
    const bend = 26;
    return {
      ...region,
      x,
      y,
      path: `M ${cx} ${cy} Q ${mx + (nx / norm) * bend} ${my + (ny / norm) * bend} ${x} ${y}`,
    };
  });

  return (
    <div className="presence-map-diagram">
      <svg
        className="presence-map-diagram__svg"
        viewBox="0 0 600 520"
        role="img"
        aria-label="Trivoxa Group's origin in Surat, India, connected to six global regions"
      >
        {nodes.map((n, i) => (
          <g key={`route-${n.title}`}>
            <path
              className={`presence-map-diagram__spoke${active === i ? " is-active" : ""}`}
              d={n.path}
            />
            {/* Animated cargo flow riding the same arc (CSS dash animation;
                 disabled under prefers-reduced-motion). */}
            <path
              className={`presence-map-diagram__flow${active === i ? " is-active" : ""}`}
              d={n.path}
              aria-hidden="true"
            />
          </g>
        ))}

        <g className="presence-map-diagram__origin">
          <circle cx={cx} cy={cy} r="10" />
          <circle cx={cx} cy={cy} r="18" className="presence-map-diagram__origin-ring" />
          <text x={cx} y={cy + 34} textAnchor="middle">
            Surat, India
          </text>
        </g>

        {nodes.map((n, i) => (
          <g
            key={n.title}
            className={`presence-map-diagram__node${active === i ? " is-active" : ""}`}
            tabIndex={0}
            role="button"
            aria-expanded={active === i}
            aria-label={`${n.title}: ${n.categories.join(", ")}`}
            onMouseEnter={() => setActive(i)}
            onMouseLeave={() => setActive((a) => (a === i ? null : a))}
            onFocus={() => setActive(i)}
            onBlur={() => setActive((a) => (a === i ? null : a))}
          >
            {/* Generous invisible hit area — the visible dot alone is a
                 7px target, far below comfortable pointer/touch size. */}
            <circle cx={n.x} cy={n.y} r="30" fill="transparent" stroke="none" style={{ pointerEvents: "all" }} />
            <circle cx={n.x} cy={n.y} r="7" />
            <text x={n.x} y={n.y - 16} textAnchor="middle" className="presence-map-diagram__label">
              {n.title}
            </text>
          </g>
        ))}
      </svg>

      <div className="presence-map-diagram__panel" aria-live="polite">
        {active !== null ? (
          <>
            <span className="presence-map-diagram__panel-title">{nodes[active].title}</span>
            <div className="presence-map-diagram__chips">
              {nodes[active].categories.map((c) => (
                <span key={c} className="presence-map-diagram__chip">
                  {c}
                </span>
              ))}
            </div>
            <Link
              className="presence-map-diagram__cta"
              href={`/contact/?region=${encodeURIComponent(nodes[active].title)}`}
              data-analytics="presence-region-cta"
            >
              Start a conversation for {nodes[active].title} →
            </Link>
          </>
        ) : (
          <span className="presence-map-diagram__panel-hint">Hover or select a region for its focus categories.</span>
        )}
      </div>
    </div>
  );
}
