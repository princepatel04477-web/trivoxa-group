"use client";

import { gsap } from "@/lib/gsap";
import { useCallback, useEffect, useRef } from "react";
import { emit } from "@/lib/site-events";

const mobileLinks = [
  { id: "menu-item-96", label: "Group", href: "/group/" },
  { id: "menu-item-85", label: "Exports", hasSubmenu: true },
  { id: "menu-item-106", label: "Digital", href: "/businesses/service-exports/" },
  { id: "menu-item-99", label: "Industries", href: "/industries/" },
  { id: "menu-item-100", label: "Reach", href: "/global-presence/" },
  { id: "menu-item-101", label: "Insights", href: "/insights/" },
  { id: "menu-item-102", label: "Careers", href: "/careers/" },
];

const serviceSubmenu = [
  {
    id: "menu-item-86",
    label: "Product Exports",
    href: "/businesses/product-exports/",
    links: [
      { id: "menu-item-87", label: "Textile & Apparel", href: "/businesses/product-exports/textile-apparel/" },
      { id: "menu-item-88", label: "Healthcare & Pharma", href: "/businesses/product-exports/healthcare-pharmaceuticals/" },
      { id: "menu-item-89", label: "Building Materials", href: "/businesses/product-exports/building-materials/" },
      { id: "menu-item-103", label: "Agriculture & Food", href: "/businesses/product-exports/agriculture-food/" },
    ],
  },
  {
    id: "menu-item-93",
    label: "The Group",
    href: "/group/",
    links: [
      { id: "menu-item-94", label: "Product Exports", href: "/businesses/product-exports/" },
      { id: "menu-item-95", label: "Trivoxa Digital", href: "/businesses/service-exports/" },
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
          {mobileLinks.map((link) =>
            link.hasSubmenu ? (
              <li key={link.id} ref={servicesRef} id={link.id}>
                <a onClick={toggleServices}>{link.label}</a>
                <ul className="sub-menu">
                  {serviceSubmenu.map((col) => (
                    <li key={col.id} id={col.id}>
                      <a href="#">{col.label}</a>
                      <ul>
                        {col.links.map((sub) => (
                          <li key={sub.id} id={sub.id}>
                            <a href={sub.href}>{sub.label}</a>
                          </li>
                        ))}
                      </ul>
                    </li>
                  ))}
                </ul>
              </li>
            ) : (
              <li key={link.id} id={link.id}>
                <a href={link.href!}>{link.label}</a>
              </li>
            )
          )}
          <li>
            <a onClick={openModal} style={{ cursor: "pointer" }}>Contact Us</a>
          </li>
        </ul>
      </div>
    </div>
  );
}
