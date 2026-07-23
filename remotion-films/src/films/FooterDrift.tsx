import React from "react";
import { AbsoluteFill } from "remotion";
import { CanvasFilm, DrawFn } from "../lib/CanvasFilm";
import { Grain, Vignette } from "../lib/Overlays";
import { ground, driftParticles } from "../lib/fields";
import { NAVY } from "../lib/palette";

export const FOOTER_DRIFT_DURATION = 24 * 12; // 12s ambient loop

// Reusable, almost-still ambient: sparse gold particles float slowly.
const draw: DrawFn = (ctx, frame, { width: W, height: H }) => {
  const phase = frame / FOOTER_DRIFT_DURATION;
  ground(ctx, W, H, 0.5, 0.5);
  driftParticles(ctx, phase, W, H, { count: 46, seed: 21, alpha: 0.4, size: 1.5, drift: 0.02 });
  driftParticles(ctx, phase, W, H, { count: 20, seed: 88, alpha: 0.28, size: 2.6, drift: 0.015 });
};

export const FooterDriftFilm: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: NAVY }}>
    <CanvasFilm draw={draw} />
    <Vignette />
    <Grain opacity={0.04} />
  </AbsoluteFill>
);
