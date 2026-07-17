"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";
import { emit } from "@/lib/site-events";

/** Fade + rise every `.home-reveal` inside a section when it scrolls into view. */
function useReveal<T extends HTMLElement>() {
  const ref = useRef<T>(null);
  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      gsap.to(".home-reveal", {
        opacity: 1,
        y: 0,
        duration: 0.9,
        ease: "power3.out",
        stagger: 0.09,
        scrollTrigger: { trigger: ref.current, start: "top 78%" },
      });
    }, ref);
    return () => ctx.revert();
  }, []);
  return ref;
}

export function AboutPreview() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="home-sec hp-about" ref={ref}>
      <div className="container">
        <div className="about-grid">
          <div className="head-col">
            <div className="home-eyebrow home-reveal">Who We Are</div>
            <h2 className="home-heading home-reveal">A Vision Beyond Business.</h2>
          </div>
          <div className="lead-col">
            <p className="home-lead home-reveal">
              Trivoxa Group was founded with a long-term vision: to build an organization that
              creates lasting value through international trade, innovation, and strategic
              partnerships.
            </p>
            <p className="home-lead home-reveal">
              Today, we operate through global sourcing, product exports, and professional services.
              Tomorrow, we will continue expanding into new industries, new markets, and new
              opportunities while remaining committed to trust, quality, and excellence.
            </p>
            <p className="home-lead home-reveal">
              We believe meaningful businesses are not measured only by revenue, but by the value
              they create, the relationships they build, and the impact they leave behind.
            </p>
            <div className="home-cta home-reveal">
              <Link className="btn-gold" href="/group/">
                Discover Trivoxa
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export function CareersPreview() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="home-sec hp-careers" ref={ref}>
      <div className="container">
        <div className="text-col">
          <div className="home-eyebrow home-reveal">Careers</div>
          <h2 className="home-heading home-reveal">Build What&rsquo;s Next With Us</h2>
          <p className="home-lead home-reveal">
            Every great organization is built by people who believe in creating something larger
            than themselves.
          </p>
          <p className="home-lead home-reveal">
            At Trivoxa, we&rsquo;re building a culture driven by curiosity, integrity, innovation,
            and continuous growth&mdash;where ambitious people come together to create meaningful
            impact across global industries.
          </p>
          <div className="home-cta home-reveal">
            <Link className="btn-gold" href="/careers/">
              Explore Careers
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}

export function FinalCta() {
  const ref = useReveal<HTMLElement>();
  return (
    <section className="home-sec hp-cta" ref={ref}>
      <div className="container">
        <div className="home-eyebrow home-reveal">Let&rsquo;s Work Together</div>
        <h2 className="home-heading home-reveal">The Next Great Partnership Starts Here.</h2>
        <p className="home-lead home-reveal">
          Whether you&rsquo;re looking to source products, expand into new markets, or collaborate on
          innovative solutions, Trivoxa Group is ready to help you move forward with confidence.
        </p>
        <div className="home-cta home-reveal">
          <button className="btn-gold" type="button" onClick={() => emit("modal:open")}>
            Request a Quote
          </button>
          <Link className="btn-ghost" href="/contact/">
            Become a Partner
          </Link>
          <Link className="btn-ghost" href="/contact/">
            Contact Us
          </Link>
        </div>
      </div>
    </section>
  );
}
