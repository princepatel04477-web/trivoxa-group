"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const TAGS = {
  div: motion.div,
  li: motion.li,
  article: motion.article,
} as const;

type Tag = keyof typeof TAGS;

export interface AnimatedCardProps {
  children: ReactNode;
  /** Position within the grid — drives the stagger delay. */
  index?: number;
  as?: Tag;
  className?: string;
}

/** Card-grid item: fades/rises in on scroll (staggered by `index`) and lifts
 * gently on hover. Hover border/shadow live in the `.motion-card` CSS class
 * (globals via motion.css) so they stay cheap CSS transitions; only the
 * translateY and the scroll entrance are driven by Motion. Reduced-motion
 * users get the plain element — content and layout unaffected either way. */
export function AnimatedCard({ children, index = 0, as = "div", className = "" }: AnimatedCardProps) {
  const reduceMotion = useReducedMotion();
  const cls = `motion-card ${className}`.trim();
  const delay = Math.min(index * 0.07, 0.42);

  if (reduceMotion) {
    const Static = as;
    return <Static className={cls}>{children}</Static>;
  }

  const Comp = TAGS[as];
  return (
    <Comp
      className={cls}
      initial={{ opacity: 0, y: 28 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.2 }}
      whileHover={{ y: -7 }}
      whileTap={{ y: -3 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Comp>
  );
}
