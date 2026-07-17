"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";

const INTERACTIVE_SELECTOR = "a, button, [role='button'], input, textarea, select, [data-cursor-hover]";

export default function CustomCursor() {
  const dotRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isTouch = window.matchMedia("(pointer: coarse)").matches;
    if (isTouch || !dotRef.current || !ringRef.current) return;

    document.documentElement.classList.add("has-custom-cursor");

    const ctx = gsap.context(() => {
      const dot = dotRef.current!;
      const ring = ringRef.current!;

      gsap.set([dot, ring], { xPercent: -50, yPercent: -50 });

      const setDotX = gsap.quickTo(dot, "x", { duration: 0.1, ease: "power2.out" });
      const setDotY = gsap.quickTo(dot, "y", { duration: 0.1, ease: "power2.out" });
      const setRingX = gsap.quickTo(ring, "x", { duration: 0.35, ease: "power2.out" });
      const setRingY = gsap.quickTo(ring, "y", { duration: 0.35, ease: "power2.out" });

      const onMove = (e: MouseEvent) => {
        setDotX(e.clientX);
        setDotY(e.clientY);
        setRingX(e.clientX);
        setRingY(e.clientY);
      };
      window.addEventListener("mousemove", onMove);

      const onOver = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) {
          gsap.to(ring, { width: 48, height: 48, opacity: 0, duration: 0.3, ease: "power2.out" });
        }
      };
      const onOut = (e: MouseEvent) => {
        if ((e.target as HTMLElement).closest(INTERACTIVE_SELECTOR)) {
          gsap.to(ring, { width: 32, height: 32, opacity: 1, duration: 0.3, ease: "power2.out" });
        }
      };
      document.addEventListener("mouseover", onOver);
      document.addEventListener("mouseout", onOut);

      return () => {
        window.removeEventListener("mousemove", onMove);
        document.removeEventListener("mouseover", onOver);
        document.removeEventListener("mouseout", onOut);
      };
    });

    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      ctx.revert();
    };
  }, []);

  return (
    <>
      <div ref={dotRef} className="custom-cursor-dot" aria-hidden="true" />
      <div ref={ringRef} className="custom-cursor-ring" aria-hidden="true" />
    </>
  );
}
