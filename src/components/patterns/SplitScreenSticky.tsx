"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { revealBody } from "@/hooks/useScrollAnimations";
import { Eyebrow } from "@/components/trivoxa/ui";

/** 40/60 split — left column (eyebrow + heading) stays sticky while the right
 * column's paragraphs scroll past and fade in with a stagger. */
export default function SplitScreenSticky({
  eyebrow,
  title,
  paragraphs,
}: {
  eyebrow: string;
  title: string;
  paragraphs: string[];
}) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      revealBody(ref.current!);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="split-sticky" ref={ref}>
      <div className="split-sticky__left">
        <Eyebrow>{eyebrow}</Eyebrow>
        <h2>{title}</h2>
      </div>
      <div className="split-sticky__right">
        {paragraphs.map((p, i) => (
          <p key={i} data-reveal-body className="split-sticky__p">
            {p}
          </p>
        ))}
      </div>
    </div>
  );
}
