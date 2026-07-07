"use client";

import { useEffect } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { TitleChars, PChars } from "@/lib/split-text";

const row1Checks = [
  "Textiles, home textiles & apparel accessories.",
  "Healthcare & pharmaceutical products.",
  "Building materials, stone & marble.",
  "Agriculture, food, spices & dry fruits.",
  "Engineering, industrial & jewellery goods.",
];

const row2Checks = [
  "Software, web & mobile app development.",
  "AI solutions & workflow automation.",
  "UI/UX, branding & graphic design.",
  "Digital marketing, SEO & content.",
];

export default function CoreServicesSection() {
  useEffect(() => {
    const ctx = gsap.context(() => {
      // Sticky left-text follower
      if (window.innerWidth > 767) {
        const leftTextWrapper = document.querySelector(".hp-sec-4 .left-text-wrapper") as HTMLElement;
        const first = document.querySelector(".hp-sec-4 .row-wrapper.first") as HTMLElement;
        const second = document.querySelector(".hp-sec-4 .row-wrapper.second") as HTMLElement;
        if (leftTextWrapper && first && second) {
          const total = first.offsetHeight + second.offsetHeight;
          ScrollTrigger.create({
            trigger: ".hp-sec-4 .container",
            start: "top center-=200px",
            endTrigger: ".hp-sec-4 .row-wrapper.second",
            end: "top top",
            onUpdate(self) {
              leftTextWrapper.style.top = `${100 + self.progress * total}px`;
            },
          });
        }
      }

      // Left-text parallax
      if (window.innerWidth > 767) {
        gsap.fromTo(
          ".hp-sec-4 .left-text-wrapper .left-text .top",
          { x: 80 },
          { x: 0, scrollTrigger: { trigger: ".hp-sec-4 .container .left-text-wrapper", scrub: true } }
        );
        gsap.fromTo(
          ".hp-sec-4 .left-text-wrapper .left-text > .left-side-title",
          { x: -80 },
          { x: 0, scrollTrigger: { trigger: ".hp-sec-4 .container .left-text-wrapper", scrub: true } }
        );
      }

      // Entrance for each row-wrapper
      const rowWrappers = [".hp-sec-4 .row-wrapper.first", ".hp-sec-4 .row-wrapper.second"];
      rowWrappers.forEach((sel) => {
        gsap.fromTo(
          `${sel} h2`,
          { scale: 0.94 },
          { scale: 1, duration: 2.4, ease: "power3.out", scrollTrigger: { trigger: sel } }
        );
        gsap.fromTo(
          `${sel} .word_inner`,
          { opacity: 0, filter: "blur(6px)" },
          { opacity: 1, filter: "blur(0px)", stagger: 0.04, scrollTrigger: { trigger: sel } }
        );
        gsap.fromTo(
          `${sel} .p_inner`,
          { opacity: 0 },
          { opacity: 1, stagger: 0.02, scrollTrigger: { trigger: sel } }
        );
        gsap.fromTo(
          `${sel} .check`,
          { opacity: 0, y: 32 },
          { opacity: 1, y: 0, stagger: 0.22, delay: 0.4, scrollTrigger: { trigger: sel } }
        );
      });

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="hp-sec-4">
      <div className="container">
        <div className="left-text-wrapper">
          <div className="left-text">
            <div className="top">
              <div className="line" />
              <div className="left-side-title">Our</div>
            </div>
            <div className="left-side-title">Businesses</div>
          </div>
        </div>

        <div className="row-wrapper first">
          <h2 className="title-anim">
            <TitleChars text="Global Product Exports" />
          </h2>
          <div className="row">
            <div className="left">
              <div className="text p-anim">
                <PChars text="We connect international buyers with carefully selected manufacturing partners across India to deliver quality products through dependable sourcing and export solutions." />
              </div>
              <button className="primary-button style-2" type="button">
                <a href="/businesses/product-exports/" className="d-flex">
                  <div className="img d-flex">
                    <img src="/images/icons/arrow-right.svg" alt="arrow-right" />
                  </div>
                  <span>Explore Product Exports</span>
                </a>
              </button>
            </div>
            <div className="right">
              <h4>What we export:</h4>
              <div className="checks">
                {row1Checks.map((text, i) => (
                  <div key={i} className="check">
                    <div className="icon">
                      <img src="/images/icons/tick-circle.svg" alt="tick" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="row-wrapper second">
          <h2 className="title-anim">
            <TitleChars text="Global Service Exports" />
          </h2>
          <div className="row">
            <div className="left">
              <div className="text p-anim">
                <PChars text="We help organizations accelerate growth through technology, software development, AI solutions, branding, design, and digital transformation services." />
              </div>
              <button className="primary-button style-2" type="button">
                <a href="/businesses/service-exports/" className="d-flex">
                  <div className="img d-flex">
                    <img src="/images/icons/arrow-right.svg" alt="arrow-right" />
                  </div>
                  <span>Explore Service Exports</span>
                </a>
              </button>
            </div>
            <div className="right">
              <h4>What we deliver:</h4>
              <div className="checks">
                {row2Checks.map((text, i) => (
                  <div key={i} className="check">
                    <div className="icon">
                      <img src="/images/icons/tick-circle.svg" alt="tick" />
                    </div>
                    {text}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
