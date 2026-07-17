"use client";

import { useEffect } from "react";
import { onPreloaderDone, markPreloaderDone } from "@/lib/site-events";

export default function Preloader() {
  useEffect(() => {
    const unsub = onPreloaderDone(() => {
      const el = document.getElementById("preloader");
      if (el) {
        el.style.transition = "opacity 1s";
        el.style.opacity = "0";
        setTimeout(() => {
          el.style.display = "none";
        }, 1000);
      }
    });
    // Safety net: never leave the hero gated if the particle scene is slow to
    // load or WebGL is unavailable. markPreloaderDone() is latched/idempotent.
    const fallback = window.setTimeout(() => markPreloaderDone(), 1200);
    return () => {
      unsub();
      window.clearTimeout(fallback);
    };
  }, []);

  return (
    <div id="preloader">
      <div id="loader" />
    </div>
  );
}
