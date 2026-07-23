/**
 * Midnight Navy editorial motion system — canonical palette.
 * Deep navy ground, restrained gold particles, pale-blue route lines.
 * No copper/orange, no cyberpunk neon.
 */
export const NAVY = "#0B1325"; // page ground
export const NAVY_ELEV = "#121D36"; // faint centre elevation
export const NAVY_CARD = "#16233E";
export const LINE = "#223251";
export const GOLD = "#C9A24B"; // ports, accents
export const GOLD_SOFT = "#D4AF5E"; // particles
export const ROUTE = "#8FB4E8"; // pale-blue trade-route lines
export const INK = "#EDF1F8";

export const FPS = 24;

/** hex + alpha (0..1) -> rgba() string */
export function withAlpha(hex: string, a: number): string {
  const h = hex.replace("#", "");
  const r = parseInt(h.slice(0, 2), 16);
  const g = parseInt(h.slice(2, 4), 16);
  const b = parseInt(h.slice(4, 6), 16);
  return `rgba(${r}, ${g}, ${b}, ${a})`;
}

/** Ease a seamless 0..1 loop phase into a smooth 0..1..0 pulse. */
export function pulse01(phase: number): number {
  return 0.5 - 0.5 * Math.cos(phase * Math.PI * 2);
}
