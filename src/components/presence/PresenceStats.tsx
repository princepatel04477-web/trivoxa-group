"use client";

import { memo, useEffect, useRef } from "react";

export interface StatItem {
  value: number;
  suffix?: string;
  label: string;
}

/** Animated stat counters (spec §3 trust layer). Counts up once when the
 * strip scrolls into view; renders the final value immediately under
 * prefers-reduced-motion. */
function PresenceStats({ stats }: { stats: StatItem[] }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const valueRefs = useRef<(HTMLSpanElement | null)[]>([]);
  const statsRef = useRef(stats);
  statsRef.current = stats;

  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let raf = 0;

    const updateDOM = (progress: number) => {
      valueRefs.current.forEach((span, i) => {
        const item = statsRef.current[i];
        if (span && item) {
          span.textContent = `${Math.round(item.value * progress)}${item.suffix ?? ""}`;
        }
      });
    };

    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      updateDOM(1);
      return;
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
          const progress = 1 - Math.pow(1 - t, 3);
          updateDOM(progress);
          if (t < 1) raf = requestAnimationFrame(tick);
        };
        raf = requestAnimationFrame(tick);
      },
      { threshold: 0.35 }
    );
    io.observe(el);
    return () => {
      io.disconnect();
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div className="presence-stats" ref={rootRef}>
      {stats.map((s, i) => (
        <div className="presence-stats__item" key={s.label}>
          <span
            className="presence-stats__value"
            ref={(el) => {
              valueRefs.current[i] = el;
            }}
          >
            0{s.suffix ?? ""}
          </span>
          <span className="presence-stats__label">{s.label}</span>
        </div>
      ))}
    </div>
  );
}

export default memo(PresenceStats);

