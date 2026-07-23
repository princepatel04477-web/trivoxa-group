"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";

/** Site-wide sticky bottom CTA, mobile only (spec §1). Appears once the
 * reader scrolls past the hero, hides while typing (soft keyboard) and on
 * the RFQ flow itself. Rendering is CSS-gated to <768px viewports. */
export default function MobileStickyCta() {
  const t = useTranslations("nav");
  const pathname = usePathname();
  const [pastHero, setPastHero] = useState(false);
  const [keyboardOpen, setKeyboardOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setPastHero(window.scrollY > window.innerHeight * 0.6);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const onResize = () => setKeyboardOpen(vv.height < window.innerHeight * 0.75);
    vv.addEventListener("resize", onResize);
    return () => vv.removeEventListener("resize", onResize);
  }, []);

  if (!pastHero || keyboardOpen) return null;
  if (pathname.startsWith("/rfq") || pathname.startsWith("/contact")) return null;

  return (
    <div className="mobile-sticky-cta" role="complementary">
      <Link href="/rfq/" data-analytics="mobile-sticky-rfq-cta">
        {t("requestQuote")}
      </Link>
    </div>
  );
}
