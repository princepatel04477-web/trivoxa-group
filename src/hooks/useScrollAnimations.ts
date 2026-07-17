"use client";

import { gsap } from "@/lib/gsap";

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

/* Operation Midnight Navy · Phase 2 — the scroll-velocity skewY on display
   headings (formerly useVelocitySkew, mounted site-wide) was removed per client
   rejection of text tilt. No rotation/skew of any axis remains in text reveals;
   the reveal choreography above (clip-path headings, fade-rise body, scale
   images) is intentionally preserved and tilt-free. */
