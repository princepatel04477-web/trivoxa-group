import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground } from "../lib/fields";
import { mulberry32 } from "../lib/rng";
import { NAVY, GOLD, GOLD_SOFT, ROUTE, withAlpha } from "../lib/palette";

export const PRODUCT_EXPORTS_DURATION = 24 * 20; // 20s — 5 motifs, cross-dissolving

// Abstract macro montage of the export materials: fabric weave, pharma vial,
// stone slab, agri produce, engineered component. No photos — geometric silhouettes.
type Motif = (ctx: CanvasRenderingContext2D, W: number, H: number, phase: number, a: number) => void;

const cx = (W: number) => W * 0.5;
const cy = (H: number) => H * 0.48;

const fabric: Motif = (ctx, W, H, phase, a) => {
  const y0 = cy(H) - 130;
  for (let i = 0; i < 22; i++) {
    const y = y0 + i * 12;
    ctx.beginPath();
    for (let x = W * 0.2; x <= W * 0.8; x += 12) {
      const w = Math.sin((x / W) * 26 + i * 0.9 + phase * Math.PI * 2) * 6;
      x === W * 0.2 ? ctx.moveTo(x, y + w) : ctx.lineTo(x, y + w);
    }
    ctx.strokeStyle = withAlpha(GOLD, 0.5 * a);
    ctx.lineWidth = 1;
    ctx.stroke();
  }
};

const vial: Motif = (ctx, W, H, phase, a) => {
  const x = cx(W);
  const y = cy(H);
  ctx.strokeStyle = withAlpha(ROUTE, 0.6 * a);
  ctx.lineWidth = 1.6;
  ctx.beginPath();
  ctx.moveTo(x - 34, y - 150);
  ctx.lineTo(x - 34, y + 120);
  ctx.quadraticCurveTo(x - 34, y + 150, x - 4, y + 150);
  ctx.lineTo(x + 4, y + 150);
  ctx.quadraticCurveTo(x + 34, y + 150, x + 34, y + 120);
  ctx.lineTo(x + 34, y - 150);
  ctx.stroke();
  ctx.strokeRect(x - 26, y - 172, 52, 24);
  // liquid line rising/falling
  const lv = y + 60 - 40 * (0.5 - 0.5 * Math.cos(phase * Math.PI * 4));
  ctx.strokeStyle = withAlpha(GOLD_SOFT, 0.6 * a);
  ctx.beginPath();
  ctx.moveTo(x - 30, lv);
  ctx.lineTo(x + 30, lv);
  ctx.stroke();
};

const slab: Motif = (ctx, W, H, phase, a) => {
  const x0 = W * 0.28;
  const w = W * 0.44;
  const y0 = cy(H) - 120;
  for (let i = 0; i < 7; i++) {
    const y = y0 + i * 34;
    ctx.strokeStyle = withAlpha(GOLD, 0.4 * a);
    ctx.lineWidth = 1;
    ctx.strokeRect(x0, y, w, 26);
    // veining
    ctx.strokeStyle = withAlpha(ROUTE, 0.22 * a);
    ctx.beginPath();
    for (let x = x0; x <= x0 + w; x += 20) {
      const vy = y + 13 + Math.sin(x * 0.05 + i + phase * 6) * 5;
      x === x0 ? ctx.moveTo(x, vy) : ctx.lineTo(x, vy);
    }
    ctx.stroke();
  }
};

const produce: Motif = (ctx, W, H, phase, a) => {
  const rnd = mulberry32(2024);
  for (let i = 0; i < 90; i++) {
    const bx = 0.3 + rnd() * 0.4;
    const by = 0.3 + rnd() * 0.4;
    const r = 3 + rnd() * 7;
    const sway = Math.sin((phase + rnd()) * Math.PI * 2) * 6;
    ctx.fillStyle = withAlpha(rnd() < 0.5 ? GOLD : GOLD_SOFT, 0.5 * a);
    ctx.beginPath();
    ctx.ellipse(bx * W + sway, by * H, r, r * 0.7, 0, 0, Math.PI * 2);
    ctx.fill();
  }
};

const component: Motif = (ctx, W, H, phase, a) => {
  const x = cx(W);
  const y = cy(H);
  const teeth = 12;
  for (const R of [70, 120, 165]) {
    ctx.strokeStyle = withAlpha(R === 120 ? GOLD : ROUTE, 0.5 * a);
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    ctx.arc(x, y, R, 0, Math.PI * 2);
    ctx.stroke();
    const rot = phase * Math.PI * 2 * (R === 120 ? -1 : 1);
    for (let k = 0; k < teeth; k++) {
      const ang = (k / teeth) * Math.PI * 2 + rot;
      ctx.beginPath();
      ctx.moveTo(x + Math.cos(ang) * R, y + Math.sin(ang) * R);
      ctx.lineTo(x + Math.cos(ang) * (R + 12), y + Math.sin(ang) * (R + 12));
      ctx.stroke();
    }
  }
};

const MOTIFS: Motif[] = [fabric, vial, slab, produce, component];

const circDist = (a: number, b: number) => {
  const d = Math.abs(a - b);
  return Math.min(d, 1 - d);
};

const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / PRODUCT_EXPORTS_DURATION;
  ground(ctx, W, H, 0.5, 0.48);
  const N = MOTIFS.length;
  for (let m = 0; m < N; m++) {
    const center = (m + 0.5) / N;
    const d = circDist(phase, center);
    const a = Math.max(0, 1 - d / (0.75 / N)); // cross-dissolve window
    if (a <= 0.01) continue;
    MOTIFS[m](ctx, W, H, phase, a * a * (3 - 2 * a));
  }
};

export const ProductExportsFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
