"use client";
import Link from "next/link";

import { gsap } from "@/lib/gsap";
import { useCallback, useEffect, useRef } from "react";
import { on, emit } from "@/lib/site-events";
import { getLenis } from "@/components/providers/LenisProvider";

const MEGA_TRIGGER = "Exports";

const navLinks = [
  { id: "menu-item-51", label: "Group", href: "/group/" },
  { id: "menu-item-53", label: "Exports", href: "/businesses/product-exports/" },
  { id: "menu-item-88", label: "Digital", href: "/businesses/service-exports/" },
  { id: "menu-item-67", label: "Industries", href: "/industries/" },
  { id: "menu-item-68", label: "Reach", href: "/global-presence/" },
  { id: "menu-item-69", label: "Insights", href: "/insights/" },
  { id: "menu-item-70", label: "Careers", href: "/careers/" },
];

const megaMenuColumns = [
  {
    id: "menu-item-71",
    title: "Product Exports",
    href: "/businesses/product-exports/",
    links: [
      { id: "menu-item-72", label: "Textile & Apparel", href: "/businesses/product-exports/textile-apparel/" },
      { id: "menu-item-73", label: "Healthcare & Pharmaceuticals", href: "/businesses/product-exports/healthcare-pharmaceuticals/" },
      { id: "menu-item-74", label: "Building Materials", href: "/businesses/product-exports/building-materials/" },
      { id: "menu-item-86", label: "Furniture & Interiors", href: "/businesses/product-exports/furniture-interiors/" },
      { id: "menu-item-84", label: "Agriculture & Food", href: "/businesses/product-exports/agriculture-food/" },
      { id: "menu-item-85", label: "Engineering & Industrial", href: "/businesses/product-exports/engineering-industrial/" },
      { id: "menu-item-90", label: "Jewellery & Precious Products", href: "/businesses/product-exports/jewellery-precious-products/" },
    ],
  },
  {
    id: "menu-item-78",
    title: "The Group",
    href: "/group/",
    links: [
      { id: "menu-item-79", label: "All Product Exports", href: "/businesses/product-exports/" },
      { id: "menu-item-89", label: "Trivoxa Digital", href: "/businesses/service-exports/" },
      { id: "menu-item-81", label: "Industries", href: "/industries/" },
      { id: "menu-item-82", label: "Our Story", href: "/group/" },
      { id: "menu-item-83", label: "Contact", href: "/contact/" },
    ],
  },
];

export default function Header() {
  const megaRef = useRef<HTMLDivElement>(null);
  const servicesRef = useRef<HTMLLIElement>(null);

  const showMenu = useCallback(() => {
    const el = megaRef.current;
    if (!el) return;
    el.style.transform = "translateY(0)";
    el.style.opacity = "1";
    el.style.pointerEvents = "all";
    servicesRef.current?.classList.add("menu-active");
  }, []);

  const hideMenu = useCallback(() => {
    const el = megaRef.current;
    if (!el) return;
    el.style.transform = "translateY(70px)";
    el.style.opacity = "0";
    el.style.pointerEvents = "none";
    servicesRef.current?.classList.remove("menu-active");
  }, []);

  useEffect(() => {
    const l1 = servicesRef.current;
    const l2 = megaRef.current;
    l1?.addEventListener("mouseenter", showMenu);
    l1?.addEventListener("mouseleave", hideMenu);
    l2?.addEventListener("mouseenter", showMenu);
    l2?.addEventListener("mouseleave", hideMenu);
    return () => {
      l1?.removeEventListener("mouseenter", showMenu);
      l1?.removeEventListener("mouseleave", hideMenu);
      l2?.removeEventListener("mouseenter", showMenu);
      l2?.removeEventListener("mouseleave", hideMenu);
    };
  }, [showMenu, hideMenu]);

  // Solid chrome once the page scrolls — without this the home hero's fixed
  // header floats transparent over section content (nav becomes unreadable).
  // It also auto-hides on scroll-down and reveals on scroll-up, so the fixed
  // bar never sits on top of / overlaps section content while reading. GSAP
  // drives the hide (it owns the header's inline transform via the hero intro
  // tween), so a plain CSS class can't fight it.
  //
  // Lenis is the scroll driver on this site, so we subscribe to its scroll
  // event (fires every frame with the real position). window's native scroll
  // is kept as a fallback for the reduced-motion path where Lenis is disabled.
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    let lastY = window.scrollY;
    let hidden = false;
    const REVEAL_ZONE = 120; // always show near the very top
    const DELTA = 6; // ignore sub-pixel jitter
    const setHidden = (next: boolean) => {
      if (next === hidden) return;
      hidden = next;
      if (next) hideMenu(); // close the mega-menu when the bar slides away
      gsap.to(el, { yPercent: next ? -130 : 0, duration: 0.4, ease: "power2.out", overwrite: "auto" });
    };
    const apply = (y: number) => {
      el.classList.toggle("header--scrolled", y > 40);
      if (y <= REVEAL_ZONE) setHidden(false);
      else if (y > lastY + DELTA) setHidden(true); // scrolling down
      else if (y < lastY - DELTA) setHidden(false); // scrolling up
      lastY = y;
    };

    // Primary: Lenis scroll event (the real driver).
    let lenisOff = () => {};
    const hookLenis = () => {
      const lenis = getLenis();
      if (!lenis) return;
      const cb = () => apply(lenis.animatedScroll ?? window.scrollY);
      lenis.on("scroll", cb);
      lenisOff = () => lenis.off("scroll", cb);
    };
    hookLenis();
    const offInit = on("lenis:init", hookLenis); // Lenis may init after Header mounts

    // Fallback: native window scroll (reduced-motion path, no Lenis).
    let raf = 0;
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(() => { raf = 0; apply(window.scrollY); });
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    apply(window.scrollY);
    return () => {
      lenisOff();
      offInit();
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, [hideMenu]);

  const openModal = () => emit("modal:open");

  return (
    <div className="header" ref={rootRef}>
      <div className="header-wrapper d-flex">
        <div className="h-left d-flex">
          <div className="logo">
            <Link href="/">
              <img src="/images/trivoxa-logo.png" alt="Trivoxa Group" />
            </Link>
          </div>
          <ul className="header-links d-flex">
            {navLinks.map((link) => (
              <li key={link.id} id={link.id} ref={link.label === MEGA_TRIGGER ? servicesRef : undefined}>
                <a href={link.href}>{link.label}</a>
              </li>
            ))}
          </ul>
        </div>
        <div className="h-right d-flex">
          <button className="primary-button contact-open" onClick={openModal} type="button">
            <span className="d-flex">
              <span>Contact Us</span>
              <div className="img d-flex">
                <img src="/images/icons/envelope-send.svg" alt="message" />
              </div>
            </span>
          </button>

          <button
            className="hamburger d-flex"
            type="button"
            aria-label="Menu"
            onClick={() => {
              document.body.classList.toggle("nav-active");
            }}
          >
            <div />
            <div />
          </button>
          <div className="mobile-contact contact-open" onClick={openModal}>
            <div>
              <img src="/images/icons/envelope-send.svg" alt="message" />
            </div>
          </div>
        </div>
      </div>
      <div ref={megaRef} className="mega-menu d-flex">
        <div className="m-left" />
        <div className="m-right d-flex">
          {megaMenuColumns.map((col) => (
            <li key={col.id} id={col.id}>
              <Link href={col.href}>{col.title}</Link>
              <ul className="sub-menu">
                {col.links.map((link) => (
                  <li key={link.id} id={link.id}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </div>
      </div>
    </div>
  );
}
