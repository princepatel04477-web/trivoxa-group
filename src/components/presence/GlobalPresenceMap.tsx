"use client";

import { useState } from "react";

export interface PresenceRegion {
  title: string;
  categories: string[];
}

/** Radial hub-and-spoke diagram: Surat at the centre, six regions arranged
 * around it, connected by thin lines. A deliberately abstract diagram rather
 * than a literal world outline — accurate continent-shape SVG paths need a
 * real geographic dataset, and an approximate hand-drawn map risks looking
 * either wrong or unprofessional on a real trade site. Hovering (or
 * focusing, for keyboard users) a region node reveals its category chips. */
export default function GlobalPresenceMap({ regions }: { regions: PresenceRegion[] }) {
  const [active, setActive] = useState<number | null>(null);

  const cx = 300;
  const cy = 260;
  const r = 190;
  const nodes = regions.map((region, i) => {
    const angle = (Math.PI * 2 * i) / regions.length - Math.PI / 2;
    return {
      ...region,
      x: cx + r * Math.cos(angle),
      y: cy + r * Math.sin(angle),
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
          <line
            key={`line-${n.title}`}
            className={`presence-map-diagram__spoke${active === i ? " is-active" : ""}`}
            x1={cx}
            y1={cy}
            x2={n.x}
            y2={n.y}
          />
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
          </>
        ) : (
          <span className="presence-map-diagram__panel-hint">Hover or select a region for its focus categories.</span>
        )}
      </div>
    </div>
  );
}
