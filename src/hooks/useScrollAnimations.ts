"use client";

import { useEffect, type RefObject } from "react";
import { usePathname } from "next/navigation";
import { gsap } from "@/lib/gsap";
import { getLenis } from "@/components/providers/LenisProvider";

/** Signature reveal ease — matches --ease-out (cubic-bezier(0.16, 1, 0.3, 1)). */
export const REVEAL_EASE = "expo.out";

/**
 * Drops the data-reveal-* attribute and the GSAP-set inline styles once a reveal
 * finishes, so CSS rules that toggle opacity/transform afterwards (e.g. a
 * hover-dim state) aren't permanently overridden by a leftover inline style.
 */
function releaseReveal(el: HTMLElement, attr: string) {
  el.removeAttribute(attr);
  gsap.set(el, { clearProps: "opacity,transform,clipPath" });
}

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** Headings: clipPath masked reveal, inset 0 0 100% 0 -> 0 0 0 0, 0.9s, triggered at 80% viewport. */
export function revealHeadings(scope: Element, selector = "[data-reveal-heading]") {
  if (prefersReducedMotion()) {
    gsap.utils.toArray<HTMLElement>(selector, scope).forEach((el) => releaseReveal(el, "data-reveal-heading"));
    return;
  }
  gsap.utils.toArray<HTMLElement>(selector, scope).forEach((el) => {
    gsap.fromTo(
      el,
      { clipPath: "inset(0 0 100% 0)" },
      {
        clipPath: "inset(0 0 0% 0)",
        duration: 0.9,
        ease: REVEAL_EASE,
        onComplete: () => releaseReveal(el, "data-reveal-heading"),
        scrollTrigger: { trigger: el, start: "top 80%" },
      }
    );
  });
}

/** Body text: y 20 -> 0, opacity 0 -> 1, stagger 0.05 per sibling. */
export function revealBody(scope: Element, selector = "[data-reveal-body]") {
  const els = gsap.utils.toArray<HTMLElement>(selector, scope);
  if (!els.length) return;
  if (prefersReducedMotion()) {
    els.forEach((el) => releaseReveal(el, "data-reveal-body"));
    return;
  }
  gsap.fromTo(
    els,
    { y: 20, opacity: 0 },
    {
      y: 0,
      opacity: 1,
      duration: 0.6,
      ease: "power2.out",
      stagger: 0.05,
      onComplete: () => els.forEach((el) => releaseReveal(el, "data-reveal-body")),
      scrollTrigger: { trigger: els[0], start: "top 80%" },
    }
  );
}

/** Images: scale 1.08 -> 1, opacity 0 -> 1, 1.2s. */
export function revealImages(scope: Element, selector = "[data-reveal-image]") {
  if (prefersReducedMotion()) {
    gsap.utils.toArray<HTMLElement>(selector, scope).forEach((el) => releaseReveal(el, "data-reveal-image"));
    return;
  }
  gsap.utils.toArray<HTMLElement>(selector, scope).forEach((el) => {
    gsap.fromTo(
      el,
      { scale: 1.08, opacity: 0 },
      {
        scale: 1,
        opacity: 1,
        duration: 1.2,
        ease: REVEAL_EASE,
        onComplete: () => releaseReveal(el, "data-reveal-image"),
        scrollTrigger: { trigger: el, start: "top 80%" },
      }
    );
  });
}

/** Runs all three standard reveals within a scope. Call inside gsap.context(). */
export function initSectionReveals(scope: Element) {
  revealHeadings(scope);
  revealBody(scope);
  revealImages(scope);
}

/**
 * Subtle skewY on display headings driven by scroll velocity (Lenis when active,
 * a frame-delta fallback otherwise). Raw velocity is divided by 30 before the
 * [-2, 2] clamp so typical scroll speeds land inside the range and only fast
 * flicks saturate it — the brief's clamp assumes a pre-scaled value.
 */
export function useVelocitySkew(selector: string, containerRef?: RefObject<HTMLElement | null>) {
  const pathname = usePathname();

  useEffect(() => {
    const root: Element | Document = containerRef?.current ?? document;
    const els = gsap.utils.toArray<HTMLElement>(selector, root);
    if (!els.length) return;

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reducedMotion) return;

    const quickSkews = els.map((el) => gsap.quickTo(el, "skewY", { duration: 0.5, ease: "power2.out" }));

    let lastScroll = window.scrollY;
    let rafId: number;

    const tick = () => {
      const lenis = getLenis();
      const raw = lenis ? lenis.velocity : window.scrollY - lastScroll;
      lastScroll = window.scrollY;
      const clamped = gsap.utils.clamp(-2, 2, raw / 30);
      quickSkews.forEach((qt) => qt(clamped * 3));
      rafId = requestAnimationFrame(tick);
    };
    rafId = requestAnimationFrame(tick);

    return () => cancelAnimationFrame(rafId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selector, pathname]);
}
