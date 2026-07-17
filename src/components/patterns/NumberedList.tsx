"use client";

import { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { gsap } from "@/lib/gsap";
import { revealBody } from "@/hooks/useScrollAnimations";

export interface NumberedListItem {
  title: string;
  /** Omit for a plain index+title row (no hover expansion). */
  description?: string;
}

/** Numbered vertical list: mono 01-N index, hover expands a row and dims the
 * rest to 20% opacity. Generalized from ValuesHoverList's interaction. */
export default function NumberedList({ items }: { items: NumberedListItem[] }) {
  const [hovered, setHovered] = useState<number | null>(null);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      revealBody(ref.current!);
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <div className="numbered-list" ref={ref} onMouseLeave={() => setHovered(null)}>
      {items.map((item, i) => (
        <button
          key={item.title}
          type="button"
          data-reveal-body
          className={`numbered-list__row${hovered !== null && hovered !== i ? " is-dimmed" : ""}`}
          aria-expanded={hovered === i}
          onMouseEnter={() => setHovered(i)}
          onFocus={() => setHovered(i)}
          onClick={() => setHovered(hovered === i ? null : i)}
        >
          <span className="numbered-list__index">{String(i + 1).padStart(2, "0")}</span>
          <span className="numbered-list__title">{item.title}</span>
          <AnimatePresence>
            {hovered === i && item.description && (
              <motion.span
                className="numbered-list__desc"
                initial={{ opacity: 0, x: 32 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 32 }}
                transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
              >
                {item.description}
              </motion.span>
            )}
          </AnimatePresence>
        </button>
      ))}
    </div>
  );
}
