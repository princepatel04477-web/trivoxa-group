import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { NAVY, NAVY_ELEV, GOLD, GOLD_SOFT, ROUTE, LINE, withAlpha, pulse01 } from "../lib/palette";

export const GLOBAL_PRESENCE_DURATION = 24 * 15; // 15s seamless loop @ 24fps

// Ports laid out to loosely read as a world map (Americas · Europe/Africa · Asia),
// abstract — no literal coastlines.
const PORTS: [number, number][] = [
  [0.15, 0.4],
  [0.27, 0.63],
  [0.49, 0.36],
  [0.53, 0.58],
  [0.635, 0.45],
  [0.78, 0.38],
  [0.85, 0.6],
];

// Trade lanes: [from, to, curvature, traversalsPerLoop (integer -> seamless), offset]
const LANES: [number, number, number, number, number][] = [
  [0, 2, -0.18, 1, 0.0],
  [2, 4, -0.12, 1, 0.35],
  [4, 5, -0.14, 2, 0.1],
  [5, 6, 0.12, 1, 0.6],
  [0, 1, 0.16, 1, 0.5],
  [3, 4, -0.1, 2, 0.8],
  [2, 3, 0.1, 1, 0.2],
];

function bezier(
  a: [number, number],
  c: [number, number],
  b: [number, number],
  t: number
): [number, number] {
  const mt = 1 - t;
  return [
    mt * mt * a[0] + 2 * mt * t * c[0] + t * t * b[0],
    mt * mt * a[1] + 2 * mt * t * c[1] + t * t * b[1],
  ];
}

const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / GLOBAL_PRESENCE_DURATION; // 0..1 seamless
  const px = (n: number) => n * W;
  const py = (n: number) => n * H;

  // Ground
  const g = ctx.createRadialGradient(W * 0.5, H * 0.42, 0, W * 0.5, H * 0.42, W * 0.7);
  g.addColorStop(0, NAVY_ELEV);
  g.addColorStop(1, NAVY);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);

  // Faint graticule — latitude bands + longitude meridians, slightly bowed.
  ctx.lineWidth = 1;
  ctx.strokeStyle = withAlpha(LINE, 0.5);
  for (let i = 1; i < 8; i++) {
    const y = (i / 8) * H;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 24) {
      const bow = Math.sin((x / W) * Math.PI) * 14 * (i / 8 - 0.5);
      x === 0 ? ctx.moveTo(x, y + bow) : ctx.lineTo(x, y + bow);
    }
    ctx.stroke();
  }
  for (let j = 1; j < 14; j++) {
    const x = (j / 14) * W;
    ctx.beginPath();
    ctx.moveTo(x, 0);
    ctx.lineTo(x, H);
    ctx.stroke();
  }

  const pts = PORTS.map(([x, y]) => [px(x), py(y)] as [number, number]);

  // Lanes: faint full arc + a bright cargo comet traveling along it.
  LANES.forEach(([fi, ti, curv, trav, off], li) => {
    const a = pts[fi];
    const b = pts[ti];
    const mid: [number, number] = [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2 + curv * H];

    // full faint arc
    ctx.strokeStyle = withAlpha(ROUTE, 0.16);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let t = 0; t <= 1; t += 0.02) {
      const [x, y] = bezier(a, mid, b, t);
      t === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
    }
    ctx.stroke();

    // comet head + fading trail
    const head = (phase * trav + off) % 1;
    const TRAIL = 46;
    for (let k = 0; k < TRAIL; k++) {
      const t = head - k * 0.006;
      if (t < 0 || t > 1) continue;
      const [x, y] = bezier(a, mid, b, t);
      const fade = 1 - k / TRAIL;
      ctx.fillStyle = withAlpha(ROUTE, 0.5 * fade * fade);
      ctx.beginPath();
      ctx.arc(x, y, 1.6 * fade + 0.4, 0, Math.PI * 2);
      ctx.fill();
    }
    // bright cargo marker
    const [hx, hy] = bezier(a, mid, b, head);
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.95);
    ctx.beginPath();
    ctx.arc(hx, hy, 2.6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.18);
    ctx.beginPath();
    ctx.arc(hx, hy, 7, 0, Math.PI * 2);
    ctx.fill();
    void li;
  });

  // Ports — slow staggered pulse.
  pts.forEach(([x, y], i) => {
    const p = pulse01((phase * 2 + i / PORTS.length) % 1);
    // halo
    ctx.fillStyle = withAlpha(GOLD, 0.1 + 0.12 * p);
    ctx.beginPath();
    ctx.arc(x, y, 10 + 10 * p, 0, Math.PI * 2);
    ctx.fill();
    // ring
    ctx.strokeStyle = withAlpha(GOLD, 0.35 + 0.25 * p);
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.arc(x, y, 6 + 2 * p, 0, Math.PI * 2);
    ctx.stroke();
    // core
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.95);
    ctx.beginPath();
    ctx.arc(x, y, 2.6, 0, Math.PI * 2);
    ctx.fill();
  });
};

export const GlobalPresenceFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
