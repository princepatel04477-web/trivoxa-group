/**
 * Shared types for the particle shape registry.
 *
 * A Shape is just a target position buffer for the scene's shared particle
 * pool — morphing is a lerp from the pool's current positions into `data`,
 * so every shape must be built at the same `count` as the pool.
 */

export interface Shape {
  name: string;
  /** Interleaved xyz target positions, length count*3. */
  data: Float32Array;
  color: number;
  /**
   * Flat silhouettes (the eagle, fanned planes, concentric rings) breathe and
   * follow the cursor instead of spinning on Y — a side-on spin would collapse
   * them to a line.
   */
  flat?: boolean;
}

export interface ShapeContext {
  /** Particle pool size — 7000 desktop, 3000 mobile. */
  count: number;
  /** Nominal shape radius in world units (== globeRadius). */
  R: number;
  /** Viewport scale factor: 1 desktop, 0.82 tablet, 0.66 mobile. */
  S: number;
}

/** All particle rendering uses --gold-particle. Layer B is dimmed via opacity
 * in the shader, never a different hue. */
export const GOLD = 0xd4af5e;
