"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const TAGS = {
  div: "div",
  section: "section",
  h1: "h1",
  h2: "h2",
  h3: "h3",
  p: "p",
  span: "span",
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

/** Scroll-triggered fade + rise, refactored to use GSAP ScrollTrigger. */
export function PageReveal({
  children,
  as = "div",
  className,
  delay = 0,
  y = 24,
  duration = 0.7,
  amount = 0.3,
}: PageRevealProps) {
  const elRef = useRef<HTMLElement>(null);
  const Comp = TAGS[as] as React.ElementType;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const startPct = Math.round(100 - amount * 100);
    const ctx = gsap.context(() => {
      gsap.fromTo(
        el,
        { opacity: 0, y },
        {
          opacity: 1,
          y: 0,
          duration,
          delay,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: `top ${startPct}%`,
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay, y, duration, amount]);

  return (
    <Comp ref={elRef} className={className}>
      {children}
    </Comp>
  );
}
