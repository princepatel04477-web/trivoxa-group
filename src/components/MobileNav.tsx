"use client";

import { gsap } from "@/lib/gsap";
import { useCallback, useEffect, useRef } from "react";
import { useTranslations } from "next-intl";
import { emit } from "@/lib/site-events";
import { Link } from "@/i18n/navigation";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Every entry carries both `href` and `hasSubmenu` so the union stays uniform
// under `as const` (which is what keeps the translation keys strictly typed).
const mobileLinks = [
  { id: "menu-item-96", key: "group", href: "/group/", hasSubmenu: false },
  { id: "menu-item-85", key: "exports", href: "/businesses/product-exports/", hasSubmenu: true },
  { id: "menu-item-106", key: "digital", href: "/businesses/service-exports/", hasSubmenu: false },
  { id: "menu-item-99", key: "industries", href: "/industries/", hasSubmenu: false },
  { id: "menu-item-100", key: "reach", href: "/global-presence/", hasSubmenu: false },
  { id: "menu-item-101", key: "insights", href: "/insights/", hasSubmenu: false },
  { id: "menu-item-102", key: "careers", href: "/careers/", hasSubmenu: false },
] as const;

const serviceSubmenu = [
  {
    id: "menu-item-86",
    titleKey: "productExports",
    href: "/businesses/product-exports/",
    links: [
      { id: "menu-item-87", key: "textileApparel", href: "/businesses/product-exports/textile-apparel/" },
      { id: "menu-item-88", key: "healthcarePharma", href: "/businesses/product-exports/healthcare-pharmaceuticals/" },
      { id: "menu-item-89", key: "buildingMaterials", href: "/businesses/product-exports/building-materials/" },
      { id: "menu-item-103", key: "agricultureFood", href: "/businesses/product-exports/agriculture-food/" },
    ],
  },
  {
    id: "menu-item-93",
    titleKey: "theGroup",
    href: "/group/",
    links: [
      { id: "menu-item-94", key: "productExports", href: "/businesses/product-exports/" },
      { id: "menu-item-95", key: "trivoxaDigital", href: "/businesses/service-exports/" },
      { id: "menu-item-97", key: "ourStory", href: "/group/" },
      { id: "menu-item-98", key: "contact", href: "/contact/" },
    ],
  },
] as const;

export default function MobileNav() {
  const navRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const servicesRef = useRef<HTMLLIElement>(null);

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

  const toggleServices = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    const li = servicesRef.current;
    if (!li) return;
    const submenu = li.querySelector(".sub-menu") as HTMLElement;
    if (!submenu) return;

    li.classList.toggle("opened");
    if (li.classList.contains("opened")) {
      submenu.style.display = "block";
      gsap.fromTo(submenu, { height: 0 }, { height: "auto", duration: 0.3 });
    } else {
      gsap.to(submenu, { height: 0, duration: 0.3, onComplete: () => { submenu.style.display = "none"; } });
    }
  }, []);

  const openModal = () => emit("modal:open");
  const t = useTranslations("nav");
  const tm = useTranslations("megaMenu");

  return (
    <div ref={navRef} className="mobile-nav">
      <div className="nav__content">
        <ul>
          {mobileLinks.map((link) =>
            link.hasSubmenu ? (
              <li key={link.id} ref={servicesRef} id={link.id}>
                <a onClick={toggleServices}>{t(link.key)}</a>
                <ul className="sub-menu">
                  {serviceSubmenu.map((col) => (
                    <li key={col.id} id={col.id}>
                      <Link href={col.href}>{tm(col.titleKey)}</Link>
                      <ul>
                        {col.links.map((sub) => (
                          <li key={sub.id} id={sub.id}>
                            <Link href={sub.href}>{tm(sub.key)}</Link>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={link.id} id={link.id}>
                <Link href={link.href}>{t(link.key)}</Link>
              </li>
            )
          )}
          <li>
            <a onClick={openModal} style={{ cursor: "pointer" }}>{t("contactUs")}</a>
          </li>
          <li className="mobile-nav__lang">
            <LanguageSwitcher variant="mobile" />
          </li>
        </ul>
      </div>
    </div>
  );
}
