"use client";
import Link from "next/link";

import { gsap } from "@/lib/gsap";
import { useCallback, useEffect, useRef } from "react";
import { on, emit } from "@/lib/site-events";

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
  const rootRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    let raf = 0;
    const update = () => {
      raf = 0;
      rootRef.current?.classList.toggle("header--scrolled", window.scrollY > 40);
    };
    const onScroll = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (raf) cancelAnimationFrame(raf);
    };
  }, []);

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
