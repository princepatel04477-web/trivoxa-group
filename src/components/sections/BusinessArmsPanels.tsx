"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { TitleChars, PChars } from "@/lib/split-text";

const PANEL = {
  id: "product-exports",
  eyebrow: "Business Arm 01",
  title: "PRODUCT EXPORTS",
  thesis:
    "We connect international buyers with carefully selected manufacturing partners across India to deliver quality products through dependable sourcing and export solutions.",
  image: "/images/industries/building.jpg",
  categories: ["Textiles", "Healthcare & Pharma", "Building Materials", "Agriculture & Food", "Engineering & Jewellery"],
  href: "/businesses/product-exports/",
  cta: "See sourcing capabilities",
};

const DIGITAL = {
  id: "trivoxa-digital",
  eyebrow: "Business Arm 02",
  title: "Trivoxa Digital",
  thesis: "A dedicated tech services arm — technology, software, AI, branding, and digital marketing.",
  note: "Visit digital.trivoxagroup.com",
  image: "/images/industries/technology.jpg",
  categories: ["Technology Solutions", "AI Solutions", "Branding & Design", "Digital Marketing"],
  href: "/businesses/service-exports/",
  cta: "See service capabilities",
};

export default function BusinessArmsPanels() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".arm-panel__bg").forEach((bg) => {
        gsap.fromTo(
          bg,
          { yPercent: -8 },
          { yPercent: 8, ease: "none", scrollTrigger: { trigger: bg.parentElement, scrub: true } }
        );
      });
      gsap.utils.toArray<HTMLElement>(".arm-panel, .digital-callout").forEach((panel) => {
        gsap.fromTo(
          panel.querySelectorAll(".word_inner"),
          { opacity: 0, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.03, scrollTrigger: { trigger: panel, start: "top 70%" } }
        );
        gsap.fromTo(
          panel.querySelectorAll(".p_inner"),
          { opacity: 0 },
          { opacity: 1, stagger: 0.015, scrollTrigger: { trigger: panel, start: "top 70%" } }
        );
      });
      ScrollTrigger.refresh();
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="hp-sec-4 business-arms">
      <div className="arm-panel" key={PANEL.id}>
        <div className="arm-panel__bg" style={{ backgroundImage: `url(${PANEL.image})` }} />
        <div className="arm-panel__overlay" />
        <div className="arm-panel__content">
          <span className="arm-panel__eyebrow">{PANEL.eyebrow}</span>
          <h2 className="arm-panel__title title-anim">
            <TitleChars text={PANEL.title} />
          </h2>
          <div className="arm-panel__thesis p-anim">
            <PChars text={PANEL.thesis} />
          </div>
          <div className="arm-panel__cats">
            {PANEL.categories.map((cat, i) => (
              <span key={cat} className="arm-panel__cat">
                {i > 0 && <span className="arm-panel__pipe">|</span>}
                <Link href={PANEL.href}>{cat}</Link>
              </span>
            ))}
          </div>
        </div>
        <Link href={PANEL.href} className="arm-panel__more">
          {PANEL.cta} →
        </Link>
      </div>

      <div className="digital-callout">
        <div className="digital-callout__media">
          <img src={DIGITAL.image} alt="" />
        </div>
        <div className="digital-callout__content">
          <span className="digital-callout__eyebrow">{DIGITAL.eyebrow}</span>
          <h3 className="digital-callout__title title-anim">
            <TitleChars text={DIGITAL.title} />
          </h3>
          <div className="digital-callout__thesis p-anim">
            <PChars text={DIGITAL.thesis} />
          </div>
          <div className="digital-callout__cats">
            {DIGITAL.categories.map((cat, i) => (
              <span key={cat} className="digital-callout__cat">
                {i > 0 && <span className="digital-callout__pipe">|</span>}
                {cat}
              </span>
            ))}
          </div>
          <p className="digital-callout__note">{DIGITAL.note}</p>
          <Link href={DIGITAL.href} className="digital-callout__more">
            {DIGITAL.cta} →
          </Link>
        </div>
      </div>
    </section>
  );
}
