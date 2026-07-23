import { useEffect, useLayoutEffect } from "react";

/**
 * useLayoutEffect that silently degrades to useEffect during SSR (where
 * useLayoutEffect warns). REQUIRED for any effect that creates a pinned
 * ScrollTrigger: pinning reparents the section into a GSAP pin-spacer div,
 * and React detaches DOM nodes BEFORE running useEffect cleanups on unmount
 * — so a pin still active at that point makes removeChild throw and kills
 * client-side navigation. useLayoutEffect cleanups run synchronously before
 * detachment, so ctx.revert() restores the DOM in time.
 */
export const useIsomorphicLayoutEffect = typeof window !== "undefined" ? useLayoutEffect : useEffect;
