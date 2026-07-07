"use client";

import { gsap } from "@/lib/gsap";
import { useCallback, useEffect, useRef } from "react";
import { emit } from "@/lib/site-events";

const mobileLinks = [
  { id: "menu-item-85", label: "Businesses", hasSubmenu: true },
  { id: "menu-item-96", label: "Group", href: "/group/" },
  { id: "menu-item-99", label: "Industries", href: "/industries/" },
  { id: "menu-item-100", label: "Global Presence", href: "/global-presence/" },
  { id: "menu-item-101", label: "Insights", href: "/insights/" },
  { id: "menu-item-102", label: "Careers", href: "/careers/" },
];

const serviceSubmenu = [
  {
    id: "menu-item-86",
    label: "Product Exports",
    links: [
      { id: "menu-item-87", label: "Textile & Apparel", href: "/businesses/textile-apparel/" },
      { id: "menu-item-88", label: "Healthcare & Pharma", href: "/businesses/product-exports/" },
      { id: "menu-item-89", label: "Building Materials", href: "/businesses/product-exports/" },
      { id: "menu-item-103", label: "Agriculture & Food", href: "/businesses/product-exports/" },
    ],
  },
  {
    id: "menu-item-90",
    label: "Service Exports",
    links: [
      { id: "menu-item-91", label: "Technology & Software", href: "/businesses/service-exports/" },
      { id: "menu-item-92", label: "AI Solutions", href: "/businesses/service-exports/" },
      { id: "menu-item-104", label: "Design & Branding", href: "/businesses/service-exports/" },
      { id: "menu-item-105", label: "Digital Marketing", href: "/businesses/service-exports/" },
    ],
  },
  {
    id: "menu-item-93",
    label: "The Group",
    links: [
      { id: "menu-item-94", label: "Product Exports", href: "/businesses/product-exports/" },
      { id: "menu-item-95", label: "Service Exports", href: "/businesses/service-exports/" },
      { id: "menu-item-97", label: "Our Story", href: "/group/" },
      { id: "menu-item-98", label: "Contact", href: "/contact/" },
    ],
  },
];

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

  return (
    <div ref={navRef} className="mobile-nav">
      <div className="nav__content">
        <ul>
          <li ref={servicesRef} id="menu-item-85">
            <a onClick={toggleServices}>Businesses</a>
            <ul className="sub-menu">
              {serviceSubmenu.map((col) => (
                <li key={col.id} id={col.id}>
                  <a href="#">{col.label}</a>
                  <ul>
                    {col.links.map((link) => (
                      <li key={link.id} id={link.id}>
                        <a href={link.href}>{link.label}</a>
                      </li>
                    ))}
                  </ul>
                </li>
              ))}
            </ul>
          </li>
          {mobileLinks.slice(1).map((link) => (
            <li key={link.id} id={link.id}>
              <a href={link.href!}>{link.label}</a>
            </li>
          ))}
          <li>
            <a onClick={openModal} style={{ cursor: "pointer" }}>Contact Us</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
