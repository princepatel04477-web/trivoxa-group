import type { CSSProperties } from "react";

export type PageAccentVariant =
  | "constellation"
  | "trade-routes"
  | "pixel-grid"
  | "orbital-rings"
  | "map-corridors"
  | "paper-layers"
  | "diverging-paths"
  | "pulse-origin"
  | "grid-ledger"
  | "radiating-ping";

export interface PageAccentProps {
  variant: PageAccentVariant;
  /** Any string — varies node count/position/rotation deterministically so
   * pages sharing a variant (e.g. every industry detail page using
   * "orbital-rings") still look distinct. Same seed always renders the
   * same markup, so server and client output match. */
  seed?: string;
  className?: string;
}

/** Deterministic string hash (djb2-ish) — no Math.random, so SSR and the
 * client hydration pass always agree. */
function hashSeed(seed: string): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

/** mulberry32 — tiny seeded PRNG, good enough for decorative point layout. */
function makeRng(seed: string) {
  let state = hashSeed(seed) || 1;
  return function rng() {
    state |= 0;
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function between(rng: () => number, min: number, max: number) {
  return min + rng() * (max - min);
}

/** Per-page hero background accent — a calm, on-brand SVG/CSS decoration
 * that never repaints every frame (only CSS keyframes / transforms), so it
 * carries no runtime cost beyond the homepage's WebGL globe. Renders behind
 * hero copy (`z-index: 0` inside a `position: relative; isolation: isolate`
 * hero) and is fully static under `prefers-reduced-motion: reduce` — see
 * `motion.css`, which owns every `.page-accent*` class referenced here. */
export function PageAccent({ variant, seed = variant, className }: PageAccentProps) {
  const rng = makeRng(seed);
  const cls = ["page-accent", `page-accent--${variant}`, className].filter(Boolean).join(" ");

  return (
    <div className={cls} aria-hidden="true">
      {variant === "constellation" && <Constellation rng={rng} />}
      {variant === "trade-routes" && <TradeRoutes rng={rng} />}
      {variant === "pixel-grid" && <PixelGrid rng={rng} />}
      {variant === "orbital-rings" && <OrbitalRings rng={rng} />}
      {variant === "map-corridors" && <MapCorridors rng={rng} />}
      {variant === "paper-layers" && <PaperLayers rng={rng} />}
      {variant === "diverging-paths" && <DivergingPaths rng={rng} />}
      {variant === "pulse-origin" && <PulseOrigin rng={rng} />}
      {variant === "grid-ledger" && <GridLedger rng={rng} />}
      {variant === "radiating-ping" && <RadiatingPing rng={rng} />}
    </div>
  );
}

type Rng = () => number;

/** Group — subtle constellation / connected-node pattern. */
function Constellation({ rng }: { rng: Rng }) {
  const points = Array.from({ length: 9 }, (_, i) => ({
    x: between(rng, 40, 560),
    y: between(rng, 30, 370),
    r: between(rng, 2, 4),
    delay: i * 0.35,
  }));
  const lines: { a: number; b: number }[] = [];
  points.forEach((p, i) => {
    points.forEach((q, j) => {
      if (j <= i) return;
      const d = Math.hypot(p.x - q.x, p.y - q.y);
      if (d < 165) lines.push({ a: i, b: j });
    });
  });

  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
      <g className="pa-drift">
        {lines.map(({ a, b }, i) => (
          <line key={i} x1={points[a].x} y1={points[a].y} x2={points[b].x} y2={points[b].y} className="pa-hairline" />
        ))}
        {points.map((p, i) => (
          <circle key={i} cx={p.x} cy={p.y} r={p.r} className="pa-dot" style={{ animationDelay: `${p.delay}s` }} />
        ))}
      </g>
    </svg>
  );
}

/** Product Exports — abstract trade-route lines, flowing dashes toward port nodes. */
function TradeRoutes({ rng }: { rng: Rng }) {
  const routes = Array.from({ length: 3 }, (_, i) => {
    const y0 = between(rng, 40, 360);
    const y3 = between(rng, 40, 360);
    return {
      d: `M -20 ${y0} C 160 ${between(rng, 20, 380)}, 380 ${between(rng, 20, 380)}, 620 ${y3}`,
      delay: i * 0.6,
      endY: y3,
    };
  });

  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
      {routes.map((r, i) => (
        <path key={i} d={r.d} className="pa-route" style={{ animationDelay: `${r.delay}s` }} />
      ))}
      {routes.map((r, i) => (
        <g key={`port-${i}`} transform={`translate(600, ${r.endY})`}>
          <circle r={3.5} className="pa-port" />
          <circle r={3.5} className="pa-pulse-ring" style={{ animationDelay: `${r.delay}s` }} />
        </g>
      ))}
    </svg>
  );
}

/** Digital — animated pixel grid + a soft drifting gradient orb. */
function PixelGrid({ rng }: { rng: Rng }) {
  const cells = Array.from({ length: 48 }, () => ({
    delay: between(rng, 0, 4.5).toFixed(2),
    dur: between(rng, 3.5, 6.5).toFixed(2),
  }));

  return (
    <>
      <div className="pa-orb" style={{ left: `${between(rng, 55, 78)}%`, top: `${between(rng, 8, 34)}%` }} />
      <div className="pa-pixel-grid">
        {cells.map((c, i) => (
          <span key={i} style={{ animationDelay: `${c.delay}s`, animationDuration: `${c.dur}s` }} />
        ))}
      </div>
    </>
  );
}

/** Industries — orbital rings with small nodes circling at different speeds. */
function OrbitalRings({ rng }: { rng: Rng }) {
  const rings = [
    { size: 190, dur: between(rng, 30, 40).toFixed(1), rev: false },
    { size: 290, dur: between(rng, 42, 54).toFixed(1), rev: true },
    { size: 380, dur: between(rng, 56, 70).toFixed(1), rev: false },
  ];
  const cx = `${between(rng, 62, 82)}%`;
  const cy = `${between(rng, 28, 52)}%`;

  return (
    <div className="pa-orbit-field" style={{ left: cx, top: cy }}>
      {rings.map((r, i) => (
        <span
          key={i}
          className={`pa-orbit${r.rev ? " pa-orbit--reverse" : ""}`}
          style={{
            width: r.size,
            height: r.size,
            marginLeft: -r.size / 2,
            marginTop: -r.size / 2,
            animationDuration: `${r.dur}s`,
          }}
        >
          <i />
        </span>
      ))}
      <span className="pa-orbit-core" />
    </div>
  );
}

/** Global Presence — scattered map-style dots with a couple of trade corridors. */
function MapCorridors({ rng }: { rng: Rng }) {
  const dots = Array.from({ length: 12 }, (_, i) => ({
    x: between(rng, 20, 580),
    y: between(rng, 20, 380),
    delay: i * 0.28,
  }));
  const corridors = Array.from({ length: 2 }, () => {
    const a = dots[Math.floor(between(rng, 0, dots.length))];
    const b = dots[Math.floor(between(rng, 0, dots.length))];
    const midX = (a.x + b.x) / 2;
    const bow = between(rng, -60, -20);
    return `M ${a.x} ${a.y} Q ${midX} ${Math.min(a.y, b.y) + bow}, ${b.x} ${b.y}`;
  });

  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
      {corridors.map((d, i) => (
        <path key={i} d={d} className="pa-corridor" />
      ))}
      {dots.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.6} className="pa-dot" style={{ animationDelay: `${p.delay}s` }} />
      ))}
    </svg>
  );
}

/** Insights — floating stacked paper/editorial layers. */
function PaperLayers({ rng }: { rng: Rng }) {
  const layers = Array.from({ length: 4 }, (_, i) => ({
    w: between(rng, 120, 220),
    h: between(rng, 90, 160),
    top: between(rng, 8, 55),
    left: between(rng, 45, 82),
    rot: between(rng, -9, 9),
    delay: i * 0.9,
  }));

  return (
    <div className="pa-paper-field">
      {layers.map((l, i) => (
        <span
          key={i}
          className="pa-paper"
          style={
            {
              width: l.w,
              height: l.h,
              top: `${l.top}%`,
              left: `${l.left}%`,
              "--pa-rot": `${l.rot}deg`,
              animationDelay: `${l.delay}s`,
            } as CSSProperties
          }
        />
      ))}
    </div>
  );
}

/** Businesses hub — two divisions branching from one origin. */
function DivergingPaths({ rng }: { rng: Rng }) {
  const spread = between(rng, 90, 140);
  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
      <path d={`M 40 200 C 220 200, 260 ${200 - spread}, 560 ${200 - spread - 20}`} className="pa-route" />
      <path
        d={`M 40 200 C 220 200, 260 ${200 + spread}, 560 ${200 + spread + 20}`}
        className="pa-route"
        style={{ animationDelay: "0.5s" }}
      />
      <circle cx={40} cy={200} r={4} className="pa-port" />
      <circle cx={40} cy={200} r={4} className="pa-pulse-ring" />
      <circle cx={560} cy={200 - spread - 20} r={3.5} className="pa-port" />
      <circle cx={560} cy={200 + spread + 20} r={3.5} className="pa-port" />
    </svg>
  );
}

/** About / Thank-you — a single origin point with expanding pulse rings. */
function PulseOrigin({ rng }: { rng: Rng }) {
  const cx = between(rng, 62, 84);
  const cy = between(rng, 30, 58);
  return (
    <div className="pa-pulse-field" style={{ left: `${cx}%`, top: `${cy}%` }}>
      <span className="pa-pulse-ring-css" style={{ animationDelay: "0s" }} />
      <span className="pa-pulse-ring-css" style={{ animationDelay: "1.1s" }} />
      <span className="pa-pulse-ring-css" style={{ animationDelay: "2.2s" }} />
      <span className="pa-pulse-core" />
    </div>
  );
}

/** Compliance / RFQ ledger — hairline grid with one or two highlighted cells. */
function GridLedger({ rng }: { rng: Rng }) {
  const marks = Array.from({ length: 2 }, () => ({
    x: Math.floor(between(rng, 2, 11)) * 40,
    y: Math.floor(between(rng, 2, 8)) * 40,
  }));
  return (
    <div className="pa-ledger">
      {marks.map((m, i) => (
        <span key={i} className="pa-ledger-mark" style={{ left: m.x, top: m.y, animationDelay: `${i * 1.4}s` }} />
      ))}
    </div>
  );
}

/** Contact / Careers — a contact hub: center ping with a few linked nodes. */
function RadiatingPing({ rng }: { rng: Rng }) {
  const nodes = Array.from({ length: 4 }, (_, i) => {
    const angle = (i / 4) * Math.PI * 2 + between(rng, -0.3, 0.3);
    const dist = between(rng, 110, 170);
    return { x: 300 + Math.cos(angle) * dist, y: 200 + Math.sin(angle) * dist, delay: i * 0.3 };
  });
  return (
    <svg viewBox="0 0 600 400" preserveAspectRatio="xMidYMid slice">
      {nodes.map((n, i) => (
        <line key={i} x1={300} y1={200} x2={n.x} y2={n.y} className="pa-hairline" />
      ))}
      <circle cx={300} cy={200} r={22} className="pa-ring-static" />
      <circle cx={300} cy={200} r={22} className="pa-pulse-ring" />
      <circle cx={300} cy={200} r={4} className="pa-port" />
      {nodes.map((n, i) => (
        <circle key={`n-${i}`} cx={n.x} cy={n.y} r={3} className="pa-dot" style={{ animationDelay: `${n.delay}s` }} />
      ))}
    </svg>
  );
}
