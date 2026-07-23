"use client";

import { useEffect, useRef, useState } from "react";

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

/** Animated stat counters (spec §3 trust layer). Counts up once when the
 * strip scrolls into view; renders the final value immediately under
 * prefers-reduced-motion. */
export default function PresenceStats({ stats }: { stats: StatItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [progress, setProgress] = useState(0); // 0..1 easing driver

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      // Async so the state write isn't a synchronous effect-body setState.
      raf = requestAnimationFrame(() => setProgress(1));
      return () => cancelAnimationFrame(raf);
    }
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0].isIntersecting) return;
        io.disconnect();
        const start = performance.now();
        const DURATION = 1400;
        const tick = (now: number) => {
          const t = Math.min(1, (now - start) / DURATION);
          // easeOutCubic — the last digits settle instead of snapping.
          setProgress(1 - Math.pow(1 - t, 3));
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="presence-stats" ref={rootRef}>
      {stats.map((s) => (
        <div className="presence-stats__item" key={s.label}>
          <span className="presence-stats__value">
            {Math.round(s.value * progress)}
            {s.suffix ?? ""}
          </span>
          <span className="presence-stats__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}
