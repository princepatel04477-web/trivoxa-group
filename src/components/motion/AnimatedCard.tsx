"use client";

import { type ReactNode, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const TAGS = {
  div: "div",
  li: "li",
  article: "article",
  figure: "figure",
} as const;

type Tag = keyof typeof TAGS;

export type AnimatedCardVariant = "up" | "left" | "right" | "scale";

const VARIANTS: Record<
  AnimatedCardVariant,
  { from: gsap.TweenVars; to: gsap.TweenVars }
> = {
  up: { from: { opacity: 0, y: 28 }, to: { opacity: 1, y: 0 } },
  left: { from: { opacity: 0, x: -28 }, to: { opacity: 1, x: 0 } },
  right: { from: { opacity: 0, x: 28 }, to: { opacity: 1, x: 0 } },
  scale: { from: { opacity: 0, scale: 0.94 }, to: { opacity: 1, scale: 1 } },
};

export interface AnimatedCardProps {
  children: ReactNode;
  /** Position within the grid — drives the stagger delay. */
  index?: number;
  as?: Tag;
  className?: string;
  /** Entrance direction. */
  variant?: AnimatedCardVariant;
  /** Forwarded to the rendered element. */
  id?: string;
}

/** Card-grid item: entrance animated with GSAP ScrollTrigger, hover/tap handled via CSS. */
export function AnimatedCard({
  children,
  index = 0,
  as = "div",
  className = "",
  variant = "up",
  id,
}: AnimatedCardProps) {
  const elRef = useRef<HTMLElement>(null);
  const Comp = TAGS[as] as React.ElementType;
  const cls = `motion-card ${className}`.trim();
  const delay = Math.min(index * 0.07, 0.42);

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const { from, to } = VARIANTS[variant];
    const ctx = gsap.context(() => {
      gsap.fromTo(el, from, {
        ...to,
        duration: 0.6,
        delay,
        ease: "power3.out",
        scrollTrigger: {
          trigger: el,
          start: "top 80%",
          once: true,
        },
      });
    }, el);

    return () => ctx.revert();
  }, [delay, variant]);

  return (
    <Comp ref={elRef} id={id} className={cls}>
      {children}
    </Comp>
  );
}
