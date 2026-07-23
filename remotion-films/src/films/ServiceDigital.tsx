import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground } from "../lib/fields";
import { mulberry32 } from "../lib/rng";
import { NAVY, ROUTE, GOLD_SOFT, LINE, withAlpha, pulse01 } from "../lib/palette";

export const SERVICE_DIGITAL_DURATION = 60 * 10; // 15s

// Calm blue data-stream: dot grid, nodes light and connect, data pulses travel
// the links, faint software-window frames. No readable UI, no fake code.
const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / SERVICE_DIGITAL_DURATION;
  ground(ctx, W, H, 0.5, 0.45);

  // faint dot grid
  const gx = 32;
  const gy = 18;
  for (let i = 1; i < gx; i++) {
    for (let j = 1; j < gy; j++) {
      ctx.fillStyle = withAlpha(LINE, 0.5);
      ctx.beginPath();
      ctx.arc((i / gx) * W, (j / gy) * H, 0.9, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  // faint software-window frames
  const rnd = mulberry32(1212);
  for (let k = 0; k < 5; k++) {
    const x = (0.12 + rnd() * 0.72) * W;
    const y = (0.16 + rnd() * 0.62) * H;
    const w = (0.1 + rnd() * 0.12) * W;
    const h = w * (0.5 + rnd() * 0.3);
    const a = 0.05 + 0.05 * pulse01((phase + k * 0.2) % 1);
    ctx.strokeStyle = withAlpha(ROUTE, a);
    ctx.lineWidth = 1;
    ctx.strokeRect(x, y, w, h);
    ctx.beginPath();
    ctx.moveTo(x, y + 12);
    ctx.lineTo(x + w, y + 12);
    ctx.stroke();
  }

  // nodes + connections + travelling data pulses
  const rnd2 = mulberry32(77);
  const N = 12;
  const nodes: [number, number][] = [];
  for (let i = 0; i < N; i++) nodes.push([0.1 + rnd2() * 0.8, 0.15 + rnd2() * 0.7]);
  const links: [number, number][] = [];
  for (let i = 0; i < N; i++)
    for (let j = i + 1; j < N; j++) {
      const d = Math.hypot(nodes[i][0] - nodes[j][0], nodes[i][1] - nodes[j][1]);
      if (d < 0.3) links.push([i, j]);
    }
  links.forEach(([i, j], li) => {
    const a = nodes[i];
    const b = nodes[j];
    ctx.strokeStyle = withAlpha(ROUTE, 0.12);
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(a[0] * W, a[1] * H);
    ctx.lineTo(b[0] * W, b[1] * H);
    ctx.stroke();
    // data pulse travelling the link (2 per loop, staggered)
    const t = (phase * 2 + li * 0.14) % 1;
    const px = (a[0] + (b[0] - a[0]) * t) * W;
    const py = (a[1] + (b[1] - a[1]) * t) * H;
    ctx.fillStyle = withAlpha(GOLD_SOFT, 0.85);
    ctx.beginPath();
    ctx.arc(px, py, 2, 0, Math.PI * 2);
    ctx.fill();
  });
  nodes.forEach(([nx, ny], i) => {
    const p = pulse01((phase * 2 + i / N) % 1);
    ctx.fillStyle = withAlpha(ROUTE, 0.5 + 0.4 * p);
    ctx.beginPath();
    ctx.arc(nx * W, ny * H, 2.2 + 1.4 * p, 0, Math.PI * 2);
    ctx.fill();
  });
};

export const ServiceDigitalFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.045} />
  </AbsoluteFill>
);
