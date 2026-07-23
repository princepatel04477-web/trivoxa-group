import { NAVY, NAVY_ELEV, GOLD_SOFT, withAlpha } from "./palette";
import { mulberry32 } from "./rng";

/** Navy radial ground shared by every film. */
export function ground(
  ctx: CanvasRenderingContext2D,
  W: number,
  H: number,
  cx = 0.5,
  cy = 0.42
) {
  const g = ctx.createRadialGradient(W * cx, H * cy, 0, W * cx, H * cy, W * 0.72);
  g.addColorStop(0, NAVY_ELEV);
  g.addColorStop(1, NAVY);
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, W, H);
}

const wrap01 = (v: number) => ((v % 1) + 1) % 1;

export type DriftOpts = {
  count?: number;
  seed?: number;
  color?: string;
  alpha?: number;
  size?: number;
  drift?: number;
  twinkle?: boolean;
};

/** Sparse, slow particle drift — seamless over one loop (phase 0..1). */
export function driftParticles(
  ctx: CanvasRenderingContext2D,
  phase: number,
  W: number,
  H: number,
  opts: DriftOpts = {}
) {
  const {
    count = 60,
    seed = 7,
    color = GOLD_SOFT,
    alpha = 0.5,
    size = 1.6,
    drift = 0.03,
    twinkle = true,
  } = opts;
  const rnd = mulberry32(seed);
  for (let i = 0; i < count; i++) {
    const bx = rnd();
    const by = rnd();
    const ph = rnd();
    const sp = 0.5 + rnd();
    const sz = size * (0.5 + rnd());
    const x = wrap01(bx + drift * Math.sin((phase + ph) * Math.PI * 2 * sp));
    const y = wrap01(by - drift * 0.7 * (phase + ph)) + 0; // gentle upward bias
    const yy = wrap01(by + drift * 0.6 * Math.cos((phase + ph) * Math.PI * 2));
    const tw = twinkle ? 0.35 + 0.65 * (0.5 - 0.5 * Math.cos((phase * 2 + ph) * Math.PI * 2)) : 1;
    ctx.fillStyle = withAlpha(color, alpha * tw);
    ctx.beginPath();
    ctx.arc(x * W, yy * H, sz, 0, Math.PI * 2);
    ctx.fill();
    void y;
  }
}
