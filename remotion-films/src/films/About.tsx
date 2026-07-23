import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground } from "../lib/fields";
import { mulberry32 } from "../lib/rng";
import { NAVY, GOLD, GOLD_SOFT, ROUTE, LINE, withAlpha, pulse01 } from "../lib/palette";

export const ABOUT_DURATION = 24 * 15; // 15s

// Origin story: woven thread close-up at the base rising to a horizon line, with
// a slowly forming network above it — foundation to horizon.
const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / ABOUT_DURATION;
  ground(ctx, W, H, 0.5, 0.35);

  // horizon line
  const hy = H * 0.62;
  ctx.strokeStyle = withAlpha(GOLD, 0.2);
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, hy);
  ctx.lineTo(W, hy);
  ctx.stroke();

  // woven threads below the horizon
  const rows = 7;
  for (let r = 0; r < rows; r++) {
    const y = hy + ((r + 1) / (rows + 1)) * (H - hy);
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      const w = Math.sin((x / W) * 8 + phase * Math.PI * 2 + r * 0.7) * 5;
      x === 0 ? ctx.moveTo(x, y + w) : ctx.lineTo(x, y + w);
    }
    ctx.strokeStyle = withAlpha(GOLD, 0.05 + 0.05 * pulse01((phase + r / rows) % 1));
    ctx.lineWidth = 1;
    ctx.stroke();
  }
  // vertical warp
  for (let c = 1; c < 24; c++) {
    ctx.strokeStyle = withAlpha(LINE, 0.4);
    ctx.beginPath();
    ctx.moveTo((c / 24) * W, hy);
    ctx.lineTo((c / 24) * W, H);
    ctx.stroke();
  }

  // network forming above the horizon
  const rnd = mulberry32(616);
  const N = 10;
  const nodes: [number, number][] = [];
  for (let i = 0; i < N; i++) nodes.push([0.12 + rnd() * 0.76, 0.14 + rnd() * 0.36]);
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      const d = Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]);
      if (d > 0.28) continue;
      ctx.strokeStyle = withAlpha(ROUTE, 0.05 + 0.1 * pulse01((phase + (i + j) * 0.04) % 1));
      ctx.beginPath();
      ctx.moveTo(nodes[i][0] * W, nodes[i][1] * H);
      ctx.lineTo(nodes[j][0] * W, nodes[j][1] * H);
      ctx.stroke();
    }
  nodes.forEach(([nx, ny], i) => {
    const p = pulse01((phase * 2 + i / N) % 1);
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.45 + 0.4 * p);
    ctx.beginPath();
    ctx.arc(nx * W, ny * H, 1.8 + 1.4 * p, 0, Math.PI * 2);
    ctx.fill();
  });
};

export const AboutFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
