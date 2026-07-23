import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground } from "../lib/fields";
import { mulberry32 } from "../lib/rng";
import { NAVY, GOLD, ROUTE, LINE, INK, withAlpha } from "../lib/palette";

export const INSIGHTS_DURATION = 60 * 10; // 14s

// Editorial masthead: thin rules, abstract headline-fragment bars drifting
// vertically, a faint data ticker. No readable text.
const wrap = (v: number) => ((v % 1) + 1) % 1;

const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / INSIGHTS_DURATION;
  ground(ctx, W, H, 0.35, 0.4);

  // masthead rules
  ctx.strokeStyle = withAlpha(GOLD, 0.18);
  ctx.lineWidth = 1;
  [0.16, 0.84].forEach((yy) => {
    ctx.beginPath();
    ctx.moveTo(W * 0.08, H * yy);
    ctx.lineTo(W * 0.92, H * yy);
    ctx.stroke();
  });

  // abstract headline-fragment bars, drifting upward and looping
  const rnd = mulberry32(303);
  const BARS = 18;
  for (let i = 0; i < BARS; i++) {
    const col = rnd() < 0.5 ? 0.1 : 0.55;
    const x = (col + rnd() * 0.3) * W;
    const w = (0.08 + rnd() * 0.22) * W;
    const h = 6 + rnd() * 10;
    const base = rnd();
    const y = wrap(base - phase) * (H * 0.62) + H * 0.2;
    const a = 0.05 + 0.06 * Math.sin((phase + base) * Math.PI * 2);
    ctx.fillStyle = withAlpha(INK, Math.max(0.02, a));
    ctx.fillRect(x, y, w, h);
  }

  // faint world-data ticker along the bottom
  const ty = H * 0.9;
  ctx.strokeStyle = withAlpha(LINE, 0.6);
  ctx.beginPath();
  ctx.moveTo(0, ty);
  ctx.lineTo(W, ty);
  ctx.stroke();
  const rnd2 = mulberry32(555);
  for (let i = 0; i < 26; i++) {
    const base = rnd2();
    const x = wrap(base - phase * 0.5) * W;
    const barH = 4 + rnd2() * 16;
    ctx.fillStyle = withAlpha(i % 4 === 0 ? GOLD : ROUTE, 0.35);
    ctx.fillRect(x, ty - barH, 2, barH);
  }
};

export const InsightsFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.06} />
  </AbsoluteFill>
);
