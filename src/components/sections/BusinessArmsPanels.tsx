"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { TitleChars, PChars } from "@/lib/split-text";

interface Arm {
  id: string;
  index: string;
  eyebrow: string;
  title: string;
  thesis: string;
  categories: string[];
  href: string;
  cta: string;
  image: string;
  imageAlt: string;
}

const ARMS: Arm[] = [
  {
    id: "product-exports",
    index: "01",
    eyebrow: "Business Arm 01",
    title: "Product Exports",
    thesis:
      "We connect international buyers with carefully selected manufacturing partners across India to deliver quality products through dependable sourcing and export solutions.",
    categories: ["Textiles", "Healthcare & Pharma", "Building Materials", "Agriculture & Food", "Engineering & Jewellery"],
    href: "/businesses/product-exports/",
    cta: "See sourcing capabilities",
    image: "/images/businesses/product-exports-editorial.png",
    imageAlt: "Cargo containers and export logistics at a port terminal",
  },
  {
    id: "trivoxa-digital",
    index: "02",
    eyebrow: "Business Arm 02",
    title: "Trivoxa Digital",
    thesis:
      "A dedicated technology services arm delivering software, AI, branding, and digital marketing — helping businesses build, grow, and modernize.",
    categories: ["Technology Solutions", "AI Solutions", "Branding & Design", "Digital Marketing"],
    href: "/businesses/service-exports/",
    cta: "See service capabilities",
    image: "/images/businesses/service-exports-editorial.png",
    imageAlt: "Technology team collaborating in a modern studio",
  },
];

export default function BusinessArmsPanels() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.utils.toArray<HTMLElement>(".biz-arm").forEach((panel) => {
        gsap.fromTo(
          panel.querySelectorAll(".word_inner"),
          { opacity: 0, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.03, scrollTrigger: { trigger: panel, start: "top 80%" } }
        );
        gsap.fromTo(
          panel.querySelectorAll(".p_inner"),
          { opacity: 0 },
          { opacity: 1, stagger: 0.012, scrollTrigger: { trigger: panel, start: "top 80%" } }
        );
        gsap.fromTo(
          panel.querySelectorAll(".biz-arm__cat, .biz-arm__cta"),
          { opacity: 0, y: 16 },
          { opacity: 1, y: 0, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: panel, start: "top 75%" } }
        );
      });
      ScrollTrigger.refresh();
    });
    return () => ctx.revert();
  }, []);

  return (
    <section className="hp-sec-4 biz-arms">
      <div className="biz-arms__inner">
        {ARMS.map((arm) => (
          <article className="biz-arm" key={arm.id}>
            <div className="biz-arm__media">
              <img src={arm.image} alt={arm.imageAlt} loading="lazy" />
              <span className="biz-arm__media-label">{arm.index} / 02</span>
            </div>
            <div className="biz-arm__head">
              <span className="biz-arm__eyebrow">{arm.eyebrow}</span>
              <span className="biz-arm__index" aria-hidden="true">
                {arm.index}
              </span>
            </div>
            <h2 className="biz-arm__title title-anim">
              <TitleChars text={arm.title} />
            </h2>
            <div className="biz-arm__thesis p-anim">
              <PChars text={arm.thesis} />
            </div>
            <ul className="biz-arm__cats" aria-label={`${arm.title} capabilities`}>
              {arm.categories.map((cat) => (
                <li className="biz-arm__cat" key={cat}>
                  {cat}
                </li>
              ))}
            </ul>
            <Link href={arm.href} className="biz-arm__cta">
              {arm.cta}
              <span aria-hidden="true">→</span>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
