import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground } from "../lib/fields";
import { NAVY, GOLD, GOLD_SOFT, ROUTE, withAlpha, pulse01 } from "../lib/palette";

export const CAREERS_DURATION = 60 * 10; // 15s

// "Build What's Next": loom threads on the left converge into a single forward
// path that travels right toward a bright, growing network point.
const wrap = (v: number) => ((v % 1) + 1) % 1;

const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / CAREERS_DURATION;
  ground(ctx, W, H, 0.7, 0.5);

  const converge: [number, number] = [W * 0.42, H * 0.5];

  // loom threads fanning from the left edge, converging to a point
  const THREADS = 12;
  for (let i = 0; i < THREADS; i++) {
    const y0 = (i / (THREADS - 1)) * H;
    const drawT = pulse01((phase + i / THREADS) % 1);
    ctx.strokeStyle = withAlpha(GOLD, 0.06 + 0.1 * drawT);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(0, y0);
    ctx.quadraticCurveTo(W * 0.22, (y0 + converge[1]) / 2, converge[0], converge[1]);
    ctx.stroke();
    // travelling spark along the thread
    const t = (phase * 2 + i / THREADS) % 1;
    const mt = 1 - t;
    const cx2 = W * 0.22;
    const cy2 = (y0 + converge[1]) / 2;
    const sx = mt * mt * 0 + 2 * mt * t * cx2 + t * t * converge[0];
    const sy = mt * mt * y0 + 2 * mt * t * cy2 + t * t * converge[1];
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.5 * t);
    ctx.beginPath();
    ctx.arc(sx, sy, 1.5, 0, Math.PI * 2);
    ctx.fill();
  }

  // forward path from convergence to a growing network on the right
  const dest: [number, number] = [W * 0.86, H * 0.42];
  ctx.strokeStyle = withAlpha(ROUTE, 0.28);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(converge[0], converge[1]);
  ctx.lineTo(dest[0], dest[1]);
  ctx.stroke();

  // pulse travelling the forward path
  const pt = wrap(phase * 1);
  const px = converge[0] + (dest[0] - converge[0]) * pt;
  const py = converge[1] + (dest[1] - converge[1]) * pt;
  ctx.fillStyle = withAlpha(GOLD_SOFT, 0.9);
  ctx.beginPath();
  ctx.arc(px, py, 2.6, 0, Math.PI * 2);
  ctx.fill();

  // growing network at destination
  const grow = pulse01(phase);
  const spokes = 6;
  for (let k = 0; k < spokes; k++) {
    const a = (k / spokes) * Math.PI * 2 + phase * 0.6;
    const rr = 20 + 46 * grow;
    const ex = dest[0] + Math.cos(a) * rr;
    const ey = dest[1] + Math.sin(a) * rr;
    ctx.strokeStyle = withAlpha(ROUTE, 0.1 + 0.14 * grow);
    ctx.beginPath();
    ctx.moveTo(dest[0], dest[1]);
    ctx.lineTo(ex, ey);
    ctx.stroke();
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.5 + 0.4 * grow);
    ctx.beginPath();
    ctx.arc(ex, ey, 1.8, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.fillStyle = withAlpha(GOLD, 0.9);
  ctx.beginPath();
  ctx.arc(dest[0], dest[1], 3, 0, Math.PI * 2);
  ctx.fill();
};

export const CareersFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
