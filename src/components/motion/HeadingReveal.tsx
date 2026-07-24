"use client";

import { Fragment } from "react";
import { motion, useReducedMotion, type Variants } from "framer-motion";

const TAGS = {
  h1: motion.h1,
  h2: motion.h2,
} as const;

type Tag = keyof typeof TAGS;

export interface HeadingRevealProps {
  text: string;
  as?: Tag;
  className?: string;
  /** Stagger offset in seconds before the first character starts, for
   * sequencing against sibling PageReveal blocks (eyebrow, crumb, etc). */
  delay?: number;
}

const container: Variants = {
  hidden: {},
  visible: (delay: number) => ({
    transition: { staggerChildren: 0.03, delayChildren: delay },
  }),
};

const char: Variants = {
  hidden: { opacity: 0, filter: "blur(6px)" },
  visible: { opacity: 1, filter: "blur(0px)", transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

/** Per-character blur/fade reveal for page h1/h2 — the inner-page equivalent
 * of the home page's GSAP-driven TitleChars/word_inner treatment (see
 * `src/lib/split-text.tsx`), reimplemented in pure Framer Motion so inner
 * pages stay on one animation engine instead of adding GSAP/ScrollTrigger
 * just for headings. Stagger timing (0.03s/char) matches the home page's
 * beat exactly, so the two systems read as one visual language even though
 * the underlying engines differ.
 *
 * Reduced motion renders plain text — no character spans at all, so screen
 * readers never see 40+ single-letter nodes when motion is off. `.heading-
 * reveal-char` is also force-visible in globals.css's reduced-motion block
 * as first-paint defense-in-depth (mirrors `.word_inner`/`.p_inner`). */
export function HeadingReveal({ text, as = "h2", className, delay = 0 }: HeadingRevealProps) {
  const reduceMotion = useReducedMotion();

  if (reduceMotion) {
    const Static = as;
    return <Static className={className}>{text}</Static>;
  }

  const Comp = TAGS[as];
  const words = text.split(" ");

  return (
    <Comp
      className={className}
      variants={container}
      custom={delay}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.3 }}
    >
      {words.map((word, wi) => (
        <Fragment key={wi}>
          {wi > 0 && " "}
          {word.split("").map((ch, ci) => (
            <motion.span key={ci} variants={char} className="heading-reveal-char" style={{ display: "inline-block" }}>
              {ch}
            </motion.span>
          ))}
        </Fragment>
      ))}
    </Comp>
  );
}
