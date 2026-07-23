import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { NAVY } from "./palette";

/** Very subtle film grain. SVG turbulence, low opacity, seed steps slowly so it
 *  shimmers like film rather than strobing. */
export const Grain: React.FC<{ opacity?: number }> = ({ opacity = 0.05 }) => {
  const frame = useCurrentFrame();
  const seed = Math.floor(frame / 6) % 6;
  return (
    <AbsoluteFill style={{ opacity, mixBlendMode: "overlay", pointerEvents: "none" }}>
      <svg width="100%" height="100%">
        <filter id={`grain-${seed}`}>
          <feTurbulence type="fractalNoise" baseFrequency="0.9" numOctaves={2} seed={seed} stitchTiles="stitch" />
          <feColorMatrix type="saturate" values="0" />
        </filter>
        <rect width="100%" height="100%" filter={`url(#grain-${seed})`} />
      </svg>
    </AbsoluteFill>
  );
};

/** Navy radial vignette for depth — darkens edges, lifts the centre a touch. */
export const Vignette: React.FC = () => (
  <AbsoluteFill
    style={{
      background: `radial-gradient(120% 85% at 50% 42%, transparent 40%, ${NAVY} 100%)`,
      pointerEvents: "none",
    }}
  />
);
