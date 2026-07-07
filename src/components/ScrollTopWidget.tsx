"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { CircleProgressIcon } from "@/components/icons";
import { on } from "@/lib/site-events";

const C = 153.93;

let scrollbarInstance: Scrollbar | null = null;
export function getScrollbar() {
  return scrollbarInstance;
}
export function setScrollbarInstance(bar: Scrollbar | null) {
  scrollbarInstance = bar;
}

// Minimal Scrollbar interface
interface Scrollbar {
  scrollTop: number;
  limit: { x: number; y: number };
  scrollTo(x: number, y: number, duration: number): void;
  addListener(fn: (status: { offset: { x: number; y: number }; limit: { x: number; y: number } }) => void): void;
  removeListener(fn: (status: { offset: { x: number; y: number }; limit: { x: number; y: number } }) => void): void;
}

export default function ScrollTopWidget() {
  const wrapperRef = useRef<HTMLDivElement>(null);
  const arrowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    let cleanup: (() => void) | undefined;
    let ctx: gsap.Context | undefined;

    const init = () => {
      if (cleanup) cleanup();
      if (ctx) ctx.revert();

      ctx = gsap.context(() => {
        const circleFill = wrapperRef.current?.querySelector<SVGCircleElement>(".circle-fill");
        const bar = getScrollbar();

        if (bar) {
          const updateProgress = () => {
            const limit = bar.limit.y;
            const progress = limit > 0 ? 1 - bar.scrollTop / limit : 1;
            if (circleFill) {
              circleFill.style.strokeDashoffset = String(C * (1 - progress));
            }
          };

          updateProgress();
          bar.addListener(updateProgress);

          const tl = gsap.timeline({
            scrollTrigger: {
              trigger: ".footer",
              start: "top bottom",
              end: "bottom bottom",
              scrub: true,
            },
          });
          if (arrowRef.current) {
            tl.to(arrowRef.current, { rotation: 180, duration: 1.5, ease: "power1.inOut" }, 0);
          }
          tl.to(
            wrapperRef.current,
            {
              cursor: "pointer",
              pointerEvents: "auto",
              duration: 1.5,
              ease: "power1.inOut",
            },
            0
          );
          tl.to(".scroll-top", { opacity: 1, duration: 1.5, ease: "power1.inOut" }, 0);

          const clickHandler = () => {
            bar.scrollTo(0, 0, 3000);
          };
          wrapperRef.current?.addEventListener("click", clickHandler);

          cleanup = () => {
            bar.removeListener(updateProgress);
            wrapperRef.current?.removeEventListener("click", clickHandler);
            tl.kill();
          };
        } else {
          const updateProgress = () => {
            const scrollTop = window.scrollY;
            const limit = document.documentElement.scrollHeight - window.innerHeight;
            const progress = limit > 0 ? 1 - scrollTop / limit : 1;
            if (circleFill) {
              circleFill.style.strokeDashoffset = String(C * (1 - progress));
            }
          };

          window.addEventListener("scroll", updateProgress);
          updateProgress();

          const clickHandler = () => {
            window.scrollTo({ top: 0, behavior: "smooth" });
          };
          wrapperRef.current?.addEventListener("click", clickHandler);

          cleanup = () => {
            window.removeEventListener("scroll", updateProgress);
            wrapperRef.current?.removeEventListener("click", clickHandler);
          };
        }
      }, wrapperRef);
    };

    init();
    const unsub = on("scrollbar:init", init);

    return () => {
      unsub();
      if (cleanup) cleanup();
      if (ctx) ctx.revert();
    };
  }, []);

  return (
    <div ref={wrapperRef} className="scroll-wrapper">
      <div className="scroll-top">scroll to top</div>
      <div className="scroll">
        <CircleProgressIcon />
        <div ref={arrowRef} className="arrow">
          <img src="/images/icons/chevron-down-lg.svg" alt="" />
        </div>
      </div>
    </div>
  );
}
