"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";

const TAGS = {
  div: motion.div,
  section: motion.section,
  h1: motion.h1,
  h2: motion.h2,
  h3: motion.h3,
  p: motion.p,
  span: motion.span,
} as const;

type Tag = keyof typeof TAGS;

export interface PageRevealProps {
  children: ReactNode;
  /** HTML element to render — defaults to a plain div. */
  as?: Tag;
  className?: string;
  /** Stagger offset in seconds, applied by the caller across a sequence. */
  delay?: number;
  /** Upward travel distance in px. */
  y?: number;
  duration?: number;
  /** Fraction of the element that must be visible before it reveals. */
  amount?: number;
}

/** Scroll-triggered fade + rise, used for hero and section text blocks.
 * Falls back to a static element (no motion props) when the user prefers
 * reduced motion — content is always present, just never animated. */
export function PageReveal({
  children,
  as = "div",
  className,
  delay = 0,
  y = 24,
  duration = 0.7,
  amount = 0.3,
}: PageRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{children}</Static>;
  }

  const Comp = TAGS[as];
  return (
    <Comp
      className={className}
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount }}
      transition={{ duration, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </Comp>
  );
}
