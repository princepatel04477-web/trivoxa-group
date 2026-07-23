import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground } from "../lib/fields";
import { mulberry32 } from "../lib/rng";
import { NAVY, GOLD, GOLD_SOFT, ROUTE, withAlpha, pulse01 } from "../lib/palette";

export const GROUP_DURATION = 24 * 16; // 16s

// "Foundation to Future": woven gold threads that interlace, resolving into a
// breathing network of nodes — foundation (weave) into future (network).
const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / GROUP_DURATION;
  ground(ctx, W, H, 0.5, 0.5);

  // Woven warp/weft — horizontal threads with a slow travelling interlace wave.
  const rows = 9;
  for (let r = 0; r < rows; r++) {
    const y = ((r + 0.5) / rows) * H;
    ctx.beginPath();
    for (let x = 0; x <= W; x += 16) {
      const w = Math.sin((x / W) * 10 + phase * Math.PI * 2 + r * 0.6) * 6;
      x === 0 ? ctx.moveTo(x, y + w) : ctx.lineTo(x, y + w);
    }
    ctx.strokeStyle = withAlpha(GOLD, 0.06 + 0.04 * pulse01((phase + r / rows) % 1));
    ctx.lineWidth = 1;
    ctx.stroke();
  }

  // Network layer — nodes on a loose grid, connections breathe in and out.
  const rnd = mulberry32(404);
  const N = 14;
  const nodes: [number, number][] = [];
  for (let i = 0; i < N; i++) nodes.push([0.1 + rnd() * 0.8, 0.18 + rnd() * 0.64]);

  // connections between near nodes
  for (let i = 0; i < N; i++) {
    for (let j = i + 1; j < N; j++) {
      const dx = nodes[i][0] - nodes[j][0];
      const dy = nodes[i][1] - nodes[j][1];
      const d = Math.hypot(dx, dy);
      if (d > 0.26) continue;
      const breathe = pulse01((phase + (i + j) * 0.03) % 1);
      ctx.strokeStyle = withAlpha(ROUTE, 0.05 + 0.13 * breathe * (1 - d / 0.26));
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(nodes[i][0] * W, nodes[i][1] * H);
      ctx.lineTo(nodes[j][0] * W, nodes[j][1] * H);
      ctx.stroke();
    }
  }
  nodes.forEach(([nx, ny], i) => {
    const p = pulse01((phase * 2 + i / N) % 1);
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.5 + 0.4 * p);
    ctx.beginPath();
    ctx.arc(nx * W, ny * H, 1.8 + 1.6 * p, 0, Math.PI * 2);
    ctx.fill();
  });
};

export const GroupFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
