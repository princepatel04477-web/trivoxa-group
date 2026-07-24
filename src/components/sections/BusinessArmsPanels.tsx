"use client";

import { useEffect } from "react";
import { useTranslations } from "next-intl";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { TitleChars, PChars } from "@/lib/split-text";
import { Link } from "@/i18n/navigation";

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

export default function BusinessArmsPanels() {
  const t = useTranslations("home.businessArms");
  const tm = useTranslations("megaMenu");

  const ARMS: Arm[] = [
    {
      id: "product-exports",
      index: "01",
      eyebrow: t("arm1Eyebrow"),
      title: tm("productExports"),
      thesis: t("arm1Thesis"),
      categories: [t("cat1"), t("cat2"), t("cat3"), t("cat4"), t("cat5")],
      href: "/businesses/product-exports/",
      cta: t("arm1Cta"),
      image: "/images/businesses/product-exports-editorial.png",
      imageAlt: "Cargo containers and export logistics at a port terminal",
    },
    {
      id: "trivoxa-digital",
      index: "02",
      eyebrow: t("arm2Eyebrow"),
      title: tm("trivoxaDigital"),
      thesis: t("arm2Thesis"),
      categories: [t("cat6"), t("cat7"), t("cat8"), t("cat9")],
      href: "/businesses/service-exports/",
      cta: t("arm2Cta"),
      image: "/images/businesses/service-exports-editorial.png",
      imageAlt: "Technology team collaborating in a modern studio",
    },
  ];

  useEffect(() => {
    const ctx = gsap.context(() => {
      // Reduced-motion users get the CSS-forced final state for
      // .word_inner/.p_inner (globals.css) regardless, but the cat/cta
      // x-tween below has no such CSS fallback — gate the whole block so
      // none of it runs (and no cycles are spent animating) under
      // prefers-reduced-motion, matching the convention used elsewhere
      // (CinematicPanel, HorizontalTimeline, IndustriesManifest).
      gsap.matchMedia().add("(prefers-reduced-motion: no-preference)", () => {
        gsap.utils.toArray<HTMLElement>(".biz-arm").forEach((panel, i) => {
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
          // Directional variety: alternate x by panel column instead of a
          // uniform y-rise, so the two-arm grid doesn't read as one repeated
          // motion. Title/thesis char-reveal above is untouched.
          gsap.fromTo(
            panel.querySelectorAll(".biz-arm__cat, .biz-arm__cta"),
            { opacity: 0, x: i % 2 === 0 ? -24 : 24 },
            { opacity: 1, x: 0, stagger: 0.05, ease: "power2.out", scrollTrigger: { trigger: panel, start: "top 75%" } }
          );
        });
        ScrollTrigger.refresh();
      });
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
