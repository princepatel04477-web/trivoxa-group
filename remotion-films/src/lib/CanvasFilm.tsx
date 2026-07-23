import React, { useEffect, useRef } from "react";
import { useCurrentFrame, useVideoConfig } from "remotion";

export type Dim = { width: number; height: number };
export type DrawFn = (
  ctx: CanvasRenderingContext2D,
  frame: number,
  dim: Dim,
  fps: number
) => void;

/**
 * Deterministic 2D-canvas film surface. The draw callback runs on every frame
 * (keyed on useCurrentFrame), so Remotion captures a stable image per frame.
 * Everything must be a pure function of `frame` — no Date.now()/Math.random()
 * without a frame-seeded RNG — so renders are reproducible and loops seamless.
 */
export const CanvasFilm: React.FC<{ draw: DrawFn }> = ({ draw }) => {
  const frame = useCurrentFrame();
  const { width, height, fps } = useVideoConfig();
  const ref = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const cv = ref.current;
    if (!cv) return;
    const ctx = cv.getContext("2d");
    if (!ctx) return;
    draw(ctx, frame, { width, height }, fps);
  });

  return (
    <canvas
      ref={ref}
      width={width}
      height={height}
      style={{ width, height, display: "block" }}
    />
  );
};
