"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
  figure: motion.figure,
} as const;

type Tag = keyof typeof TAGS;

export type AnimatedCardVariant = "up" | "left" | "right" | "scale";

const VARIANTS: Record<AnimatedCardVariant, { initial: Record<string, number>; animate: Record<string, number> }> = {
  up: { initial: { opacity: 0, y: 28 }, animate: { opacity: 1, y: 0 } },
  left: { initial: { opacity: 0, x: -28 }, animate: { opacity: 1, x: 0 } },
  right: { initial: { opacity: 0, x: 28 }, animate: { opacity: 1, x: 0 } },
  scale: { initial: { opacity: 0, scale: 0.94 }, animate: { opacity: 1, scale: 1 } },
};

export interface AnimatedCardProps {
  children: ReactNode;
  /** Position within the grid — drives the stagger delay. */
  index?: number;
  as?: Tag;
  className?: string;
  /** Entrance direction. Default "up" matches the original single-style
   * behavior exactly — pass "left"/"right" to alternate across a grid's
   * columns, or "scale" for a lone feature card. No rotation/skew/tilt:
   * that was tried on text reveals before and the client rejected it, so
   * card entrances stay to the same restrained fade+translate/scale family. */
  variant?: AnimatedCardVariant;
}

/** Card-grid item: fades/rises (or slides/scales, per `variant`) in on
 * scroll (staggered by `index`) and lifts gently on hover. Hover border/
 * shadow live in the `.motion-card` CSS class (globals via motion.css) so
 * they stay cheap CSS transitions; only the entrance and the hover/tap lift
 * are driven by Motion. Hover/tap stay vertical-only regardless of `variant`
 * — mixing a horizontal entrance with a horizontal hover would read as drag,
 * not lift. Reduced-motion users get the plain element — content and layout
 * unaffected either way. */
export function AnimatedCard({ children, index = 0, as = "div", className = "", variant = "up" }: AnimatedCardProps) {
  const reduceMotion = useReducedMotion();
  const cls = `motion-card ${className}`.trim();
  const delay = Math.min(index * 0.07, 0.42);

  if (reduceMotion) {
    const Static = as;
    return <Static className={cls}>{children}</Static>;
  }

  const Comp = TAGS[as];
  const { initial, animate } = VARIANTS[variant];
  return (
    <Comp
      className={cls}
      initial={initial}
      whileInView={animate}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -7 }}
      whileTap={{ y: -3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Comp>
  );
}
