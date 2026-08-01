"use client";

import { Fragment, useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const TAGS = {
  h1: "h1",
  h2: "h2",
} as const;

type Tag = keyof typeof TAGS;

export interface HeadingRevealProps {
  text: string;
  as?: Tag;
  className?: string;
  /** Stagger offset in seconds before the first character starts. */
  delay?: number;
}

/** Per-character blur/fade reveal for page h1/h2, refactored to use GSAP ScrollTrigger. */
export function HeadingReveal({ text, as = "h2", className, delay = 0 }: HeadingRevealProps) {
  const elRef = useRef<HTMLHeadingElement>(null);
  const Comp = TAGS[as] as React.ElementType;

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduceMotion) return;

    const chars = el.querySelectorAll(".heading-reveal-char");
    if (!chars.length) return;

    const ctx = gsap.context(() => {
      gsap.fromTo(
        chars,
        { opacity: 0, filter: "blur(6px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.5,
          delay,
          stagger: 0.03,
          ease: "power3.out",
          scrollTrigger: {
            trigger: el,
            start: "top 70%",
            once: true,
          },
        }
      );
    }, el);

    return () => ctx.revert();
  }, [delay]);

  const words = text.split(" ");

  return (
    <Comp ref={elRef} className={className}>
      {words.map((word, wi) => (
        <Fragment key={wi}>
          {wi > 0 && " "}
          <span className="split-word" style={{ display: "inline-block", whiteSpace: "nowrap" }}>
            {word.split("").map((ch, ci) => (
              <span key={ci} className="heading-reveal-char" style={{ display: "inline-block" }}>
                {ch}
              </span>
            ))}
          </span>
        </Fragment>
      ))}
    </Comp>
  );
}
