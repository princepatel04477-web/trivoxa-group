"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

/** Sticky "Get a quote for this category" pill (spec §4). Desktop only —
 * mobile already has the global sticky RFQ bar. Appears after the reader
 * has scrolled into the page. */
export default function StickyCategoryCta({
  category,
  categorySlug,
}: {
  category: string;
  categorySlug?: string;
}) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight * 0.5);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  if (!visible) return null;

  return (
    <div className="sticky-cat-cta">
      <Link
        href={categorySlug ? `/rfq/?category=${categorySlug}` : "/rfq/"}
        data-analytics="sticky-category-rfq"
      >
        Get a quote for {category} →
      </Link>
    </div>
  );
}
