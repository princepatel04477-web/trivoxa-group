import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground } from "../lib/fields";
import { mulberry32 } from "../lib/rng";
import { NAVY, GOLD, GOLD_SOFT, ROUTE, withAlpha } from "../lib/palette";

export const CONTACT_DURATION = 24 * 16; // 16s

// Minimal compass/routing loop: gold particles gather into a compass rose, one
// route line draws outward, then dissolves and scatters — seamless.
const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / CONTACT_DURATION;
  ground(ctx, W, H, 0.5, 0.5);
  const cx = W * 0.5;
  const cy = H * 0.48;
  const R = Math.min(W, H) * 0.26;

  // gather factor: 0 scattered -> 1 gathered -> 0 scattered (smooth, seamless)
  const gather = 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);

  // particles: home position on compass ring, scatter position random
  const rnd = mulberry32(9);
  const COUNT = 90;
  for (let i = 0; i < COUNT; i++) {
    const ang = (i / COUNT) * Math.PI * 2;
    const homeX = cx + Math.cos(ang) * R;
    const homeY = cy + Math.sin(ang) * R;
    const sx = rnd() * W;
    const sy = rnd() * H;
    const x = sx + (homeX - sx) * gather;
    const y = sy + (homeY - sy) * gather;
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.3 + 0.55 * gather);
    ctx.beginPath();
    ctx.arc(x, y, 1.4, 0, Math.PI * 2);
    ctx.fill();
  }

  // compass ticks + N pointer, fade in with gather
  ctx.strokeStyle = withAlpha(GOLD, 0.4 * gather);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.stroke();
  for (let k = 0; k < 32; k++) {
    const a = (k / 32) * Math.PI * 2;
    const rt = k % 8 === 0 ? R * 0.86 : R * 0.94;
    ctx.strokeStyle = withAlpha(GOLD, (k % 8 === 0 ? 0.5 : 0.25) * gather);
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * rt, cy + Math.sin(a) * rt);
    ctx.lineTo(cx + Math.cos(a) * R, cy + Math.sin(a) * R);
    ctx.stroke();
  }
  // N pointer (slowly rotating needle)
  const needle = phase * Math.PI * 2;
  ctx.strokeStyle = withAlpha(GOLD_SOFT, 0.7 * gather);
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(cx - Math.cos(needle) * R * 0.5, cy - Math.sin(needle) * R * 0.5);
  ctx.lineTo(cx + Math.cos(needle) * R * 0.7, cy + Math.sin(needle) * R * 0.7);
  ctx.stroke();

  // one route line draws outward from centre while gathered
  const drawT = Math.max(0, Math.min(1, (gather - 0.4) / 0.6));
  const dest: [number, number] = [W * 0.82, H * 0.3];
  ctx.strokeStyle = withAlpha(ROUTE, 0.4 * gather);
  ctx.lineWidth = 1.4;
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.lineTo(cx + (dest[0] - cx) * drawT, cy + (dest[1] - cy) * drawT);
  ctx.stroke();
  ctx.fillStyle = withAlpha(GOLD_SOFT, 0.9 * gather);
  ctx.beginPath();
  ctx.arc(cx + (dest[0] - cx) * drawT, cy + (dest[1] - cy) * drawT, 2.4, 0, Math.PI * 2);
  ctx.fill();
};

export const ContactFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
