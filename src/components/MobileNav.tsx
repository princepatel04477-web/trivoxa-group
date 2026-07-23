"use client";

import { gsap } from "@/lib/gsap";
import { useCallback, useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

const DIGITAL_URL = "https://digital.trivoxagroup.com";

/** Same information architecture as the desktop header (spec §1):
 * six items, with The Group and Businesses as accordions. */
const groupLinks = [
  { key: "story", href: "/group/#our-story" },
  { key: "leadership", href: "/group/#leadership" },
  { key: "foundation", href: "/group/#foundation" },
  { key: "vision", href: "/group/#vision" },
  { key: "commitments", href: "/group/#commitments" },
] as const;

const productLinks = [
  { key: "textileApparel", href: "/businesses/product-exports/textile-apparel/" },
  { key: "healthcarePharma", href: "/businesses/product-exports/healthcare-pharmaceuticals/" },
  { key: "buildingMaterials", href: "/businesses/product-exports/building-materials/" },
  { key: "agricultureFood", href: "/businesses/product-exports/agriculture-food/" },
  { key: "engineeringIndustrial", href: "/businesses/product-exports/engineering-industrial/" },
  { key: "allProductExports", href: "/businesses/product-exports/" },
] as const;

const serviceLinks = [
  { key: "technology", href: "/businesses/service-exports/technology/" },
  { key: "ai", href: "/businesses/service-exports/ai/" },
  { key: "software", href: "/businesses/service-exports/software/" },
  { key: "designBranding", href: "/businesses/service-exports/design/" },
  { key: "digitalMarketing", href: "/businesses/service-exports/marketing/" },
  { key: "businessSupport", href: "/businesses/service-exports/business-support/" },
] as const;

type Accordion = "group" | "biz" | null;

export default function MobileNav() {
  const navRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const [openSection, setOpenSection] = useState<Accordion>(null);
  const pathname = usePathname();

  useEffect(() => {
    if (!navRef.current) return;
    const nav = navRef.current;
    const items = nav.querySelectorAll(".nav__content > ul > li");

    const tl = gsap.timeline({ paused: true });
    tl.fromTo(nav, {}, { clipPath: "circle(130% at 50% 0%)", y: 0, duration: 1.5 });
    tl.fromTo(items, {}, { opacity: 1, y: 0, delay: 1, stagger: 0.07, duration: 1 }, "<");
    tlRef.current = tl;

    const observer = new MutationObserver(() => {
      if (document.body.classList.contains("nav-active")) {
        tl.play();
      } else {
        tl.reverse();
      }
    });
    observer.observe(document.body, { attributes: true, attributeFilter: ["class"] });

    return () => {
      observer.disconnect();
      tl.kill();
    };
  }, []);

  // Any navigation collapses accordions — derived reset during render (the
  // React-sanctioned pattern; avoids a cascading setState-in-effect)…
  const [lastPath, setLastPath] = useState(pathname);
  if (lastPath !== pathname) {
    setLastPath(pathname);
    setOpenSection(null);
  }

  // …while closing the overlay is a DOM side effect, so it stays an effect.
  useEffect(() => {
    document.body.classList.remove("nav-active");
  }, [pathname]);

  const closeNav = useCallback(() => {
    document.body.classList.remove("nav-active");
  }, []);

  const toggle = (section: Exclude<Accordion, null>) =>
    setOpenSection((cur) => (cur === section ? null : section));

  const t = useTranslations("nav");
  const tm = useTranslations("megaMenu");

  const sub = (links: readonly { key: string; href: string }[]) => (
    <ul>
      {links.map((l) => (
        <li key={l.key}>
          <Link href={l.href} onClick={closeNav}>
            {tm(l.key)}
          </Link>
        </li>
      ))}
    </ul>
  );

  return (
    <div ref={navRef} className="mobile-nav">
      <div className="nav__content">
        <ul>
          <li>
            <Link href="/" onClick={closeNav}>
              {t("home")}
            </Link>
          </li>

          {/* The Group — accordion */}
          <li className={openSection === "group" ? "opened" : undefined}>
            <button
              type="button"
              className="mobile-nav__acc-trigger"
              aria-expanded={openSection === "group"}
              onClick={() => toggle("group")}
            >
              {t("theGroup")}
              <span className="mobile-nav__caret" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className={`mobile-nav__acc${openSection === "group" ? " is-open" : ""}`}>
              <ul className="sub-menu">
                <li>
                  <Link href="/group/" onClick={closeNav}>
                    {tm("theGroup")}
                  </Link>
                </li>
                {groupLinks.map((l) => (
                  <li key={l.key}>
                    <Link href={l.href} onClick={closeNav}>
                      {tm(l.key)}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </li>

          {/* Businesses — accordion with the two divisions */}
          <li className={openSection === "biz" ? "opened" : undefined}>
            <button
              type="button"
              className="mobile-nav__acc-trigger"
              aria-expanded={openSection === "biz"}
              onClick={() => toggle("biz")}
            >
              {t("businesses")}
              <span className="mobile-nav__caret" aria-hidden="true">
                ▾
              </span>
            </button>
            <div className={`mobile-nav__acc${openSection === "biz" ? " is-open" : ""}`}>
              <div className="mobile-nav__division">
                <Link href="/businesses/product-exports/" className="mobile-nav__division-title" onClick={closeNav}>
                  {tm("productExports")}
                </Link>
                {sub(productLinks)}
              </div>
              <div className="mobile-nav__division">
                <Link href="/businesses/service-exports/" className="mobile-nav__division-title" onClick={closeNav}>
                  {tm("serviceExports")}
                </Link>
                {sub(serviceLinks)}
                <a className="mobile-nav__external" href={DIGITAL_URL} target="_blank" rel="noopener noreferrer">
                  digital.trivoxagroup.com ↗
                </a>
              </div>
            </div>
          </li>

          <li>
            <Link href="/global-presence/" onClick={closeNav}>
              {t("globalPresence")}
            </Link>
          </li>
          <li>
            <Link href="/insights/" onClick={closeNav}>
              {t("insights")}
            </Link>
          </li>
          <li>
            <Link href="/careers/" onClick={closeNav}>
              {t("careers")}
            </Link>
          </li>
          <li className="mobile-nav__lang">
            <LanguageSwitcher variant="mobile" />
          </li>
        </ul>
      </div>

      {/* Sticky bottom CTA — always reachable while the overlay is open. */}
      <div className="mobile-nav__cta">
        <Link href="/rfq/" onClick={closeNav} data-analytics="mobile-nav-rfq-cta">
          {t("requestQuote")}
        </Link>
      </div>
    </div>
  );
}
