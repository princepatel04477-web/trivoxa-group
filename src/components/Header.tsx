"use client";
import Link from "next/link";

import { gsap } from "@/lib/gsap";
import { useCallback, useEffect, useRef } from "react";
import { on, emit } from "@/lib/site-events";

const MEGA_TRIGGER = "Businesses";

const navLinks = [
  { id: "menu-item-51", label: "Group", href: "/group/" },
  { id: "menu-item-53", label: "Businesses", href: "/businesses/" },
  { id: "menu-item-67", label: "Industries", href: "/industries/" },
  { id: "menu-item-68", label: "Global Presence", href: "/global-presence/" },
  { id: "menu-item-69", label: "Insights", href: "/insights/" },
  { id: "menu-item-70", label: "Careers", href: "/careers/" },
];

const megaMenuColumns = [
  {
    id: "menu-item-71",
    title: "Product Exports",
    links: [
      { id: "menu-item-72", label: "Textile & Apparel", href: "/businesses/textile-apparel/" },
      { id: "menu-item-73", label: "Healthcare & Pharmaceuticals", href: "/businesses/product-exports/" },
      { id: "menu-item-74", label: "Building Materials", href: "/businesses/product-exports/" },
      { id: "menu-item-84", label: "Agriculture & Food", href: "/businesses/product-exports/" },
      { id: "menu-item-85", label: "Engineering & Industrial", href: "/businesses/product-exports/" },
    ],
  },
  {
    id: "menu-item-75",
    title: "Service Exports",
    links: [
      { id: "menu-item-76", label: "Technology & Software", href: "/businesses/service-exports/" },
      { id: "menu-item-77", label: "AI Solutions", href: "/businesses/service-exports/" },
      { id: "menu-item-86", label: "Design & Branding", href: "/businesses/service-exports/" },
      { id: "menu-item-87", label: "Digital Marketing", href: "/businesses/service-exports/" },
    ],
  },
  {
    id: "menu-item-78",
    title: "The Group",
    links: [
      { id: "menu-item-79", label: "Product Exports", href: "/businesses/product-exports/" },
      { id: "menu-item-80", label: "Service Exports", href: "/businesses/service-exports/" },
      { id: "menu-item-81", label: "Global Presence", href: "/global-presence/" },
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

  const openModal = () => emit("modal:open");

  return (
    <div className="header">
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
              <a href="#">{col.title}</a>
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
