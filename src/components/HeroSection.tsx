"use client";

import { useEffect } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { onPreloaderDone, emit } from "@/lib/site-events";
import { TitleChars, PChars } from "@/lib/split-text";

export default function HeroSection() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ paused: true });

      tl.fromTo(".header", {}, { y: 0, duration: 2.4, ease: "power2.out" });
      tl.fromTo(".hp-sec-1 .scroll-to .line > div", {}, { width: "100%", duration: 2.4 }, "<");
      tl.fromTo(".hp-sec-1 .scroll-to .text", {}, { opacity: 1, duration: 2.4 }, "<");
      tl.fromTo(".scroll-wrapper", {}, { opacity: 1, y: 0, duration: 2.4 }, "<");
      tl.fromTo(".hp-sec-1 h1", {}, { scale: 1, duration: 3.2, ease: "power2.out" }, "<");
      tl.fromTo(
        ".hp-sec-1 .word_inner",
        {},
        { opacity: 1, stagger: 0.05, filter: "blur(0px)", delay: 0.4, ease: "power1.in" },
        "<"
      );
      tl.fromTo(".hp-sec-1 .p_inner", {}, { opacity: 1, stagger: 0.025, ease: "power1.in" }, "<");

      const unsub = onPreloaderDone(() => {
        tl.play();
      });

      if (window.innerWidth > 575) {
        gsap.fromTo(
          ".hp-sec-1 .scroll-to",
          {},
          {
            opacity: 0,
            scrollTrigger: {
              trigger: ".hp-sec-2",
              scrub: true,
              end: "top center",
            },
          }
        );
      }

      ScrollTrigger.refresh();
      return unsub;
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="hp-sec-1">
      <div className="container">
        <div className="hero-tagline p-anim">
          <PChars text="Connecting Markets. Creating Value. Inspiring Progress." />
        </div>
        <h1 className="title-anim">
          <TitleChars text="Building the Future of Global Commerce." />
        </h1>
        <div className="subtitle p-anim">
          <PChars text="Trivoxa Group is an international business group delivering trusted products, strategic sourcing solutions, and professional services across global markets." />
        </div>
        <div className="hero-cta d-flex">
          <button className="primary-button" type="button" onClick={() => emit("modal:open")}>
            <span className="d-flex">
              <span>Request a Quote</span>
            </span>
          </button>
          <Link className="ghost-button" href="/businesses/">
            <span>Explore Businesses</span>
          </Link>
        </div>
      </div>
      <div className="scroll-to">
        <div className="line">
          <div />
        </div>
        <div className="text">scroll to learn more</div>
      </div>
    </section>
  );
}
