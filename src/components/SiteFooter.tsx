"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const footerLinks = [
  {
    title: "Company",
    links: [
      { label: "Group", href: "/group/" },
      { label: "Businesses", href: "/businesses/" },
      { label: "Industries", href: "/industries/" },
      { label: "Global Presence", href: "/global-presence/" },
    ],
  },
  {
    title: "Resources",
    links: [
      { label: "Insights", href: "/insights/" },
      { label: "Careers", href: "/careers/" },
      { label: "Contact", href: "/contact/" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy-policy/" },
      { label: "Terms & Conditions", href: "/terms/" },
      { label: "Cookies Policy", href: "/cookies/" },
    ],
  },
];

const moreLinks = [
  { label: "Textile & Apparel", href: "/businesses/textile-apparel/" },
  { label: "Global Presence", href: "/global-presence/" },
];

export default function SiteFooter() {
  const [expanded, setExpanded] = useState(false);
  const footerRef = useRef<HTMLElement>(null);

  const toggle = useCallback(() => {
    setExpanded((prev) => !prev);
  }, []);

  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: footerRef.current,
          start: "top 90%",
          toggleActions: "play none none none",
        },
      });

      tl.fromTo(footerRef.current, {}, { opacity: 1, y: 0, duration: 1, ease: "power2.out" });
      tl.fromTo(
        ".footer .socials",
        { opacity: 0, y: 24 },
        { opacity: 1, y: 0, duration: 0.8, ease: "power2.out" },
        "-=0.4"
      );
      tl.fromTo(
        ".footer .footer-content > div",
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.6, stagger: 0.12, ease: "power2.out" },
        "-=0.3"
      );
    }, footerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="footer" ref={footerRef}>
      <div className="container">
        <div className="socials d-flex">
          <div className="text">Follow Us</div>
          <div className="line" />
          <div className="social first">
            <a href="#" aria-label="LinkedIn">
              <img src="/images/icons/linkedin.svg" alt="LinkedIn" />
            </a>
          </div>
          <div className="social">
            <a href="#" aria-label="X">
              <img src="/images/icons/twitter.svg" alt="X" />
            </a>
          </div>
          <div className="social">
            <a href="#" aria-label="YouTube">
              <img src="/images/icons/youtube-bg.svg" alt="YouTube" />
            </a>
          </div>
        </div>
        <div className="footer-content d-flex">
          <div className="col">
            <div className="logo">
              <img src="/images/trivoxa-logo.png" alt="Trivoxa Group" />
            </div>
            <div className="address">
              <p>
                Building the Future of Global Commerce—
                <br />
                One Partnership at a Time.
                <br />
                hello@trivoxagroup.com
              </p>
            </div>
            <div className="copyright" suppressHydrationWarning>
              &copy;{new Date().getFullYear()} Trivoxa Group. All Rights Reserved.
            </div>
            <a className="privacy" href="/privacy-policy/">
              Privacy Policy
            </a>
          </div>
          {footerLinks.map((col, i) => (
            <div key={i} className="col">
              <div className="title">{col.title}</div>
              <ul>
                {col.links.map((link, j) => (
                  <li key={j}>
                    <a href={link.href}>{link.label}</a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
          <div className="col">
            <div className="title">Divisions</div>
            <ul>
              <li>
                <a href="/businesses/product-exports/">Product Exports</a>
              </li>
              <li>
                <a href="/businesses/service-exports/">Service Exports</a>
              </li>
              <li>
                <a href="/contact/">Become a Partner</a>
              </li>
              <div className="more" style={{ display: expanded ? "block" : "none" }}>
                <ul>
                  {moreLinks.map((link, i) => (
                    <li key={i}>
                      <a href={link.href}>{link.label}</a>
                    </li>
                  ))}
                </ul>
              </div>
              <li className="view" onClick={toggle}>
                <a>{expanded ? "view less" : "and much more..."}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </section>
  );
}
