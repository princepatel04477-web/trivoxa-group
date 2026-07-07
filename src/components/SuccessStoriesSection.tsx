"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger, BP } from "@/lib/gsap";
import { TitleChars, PChars } from "@/lib/split-text";
import Swiper from "swiper";
import { Autoplay } from "swiper/modules";
import "swiper/css";

const caseStudies = [
  {
    title: "Textile & Apparel",
    description: "Fabrics, home textiles, and apparel accessories sourced through trusted manufacturing partners.",
    image: "/images/industries/textile.jpg",
    logo: "/images/trivoxa-eagle.png",
    href: "/industries/",
  },
  {
    title: "Healthcare & Pharmaceuticals",
    description: "Trusted pharmaceutical products and healthcare solutions through responsible sourcing.",
    image: "/images/industries/healthcare.jpg",
    logo: "/images/trivoxa-eagle.png",
    href: "/industries/",
  },
  {
    title: "Building Materials",
    description: "Natural stone, marble, granite, and construction materials for global projects.",
    image: "/images/industries/building.jpg",
    logo: "/images/trivoxa-eagle.png",
    href: "/industries/",
  },
  {
    title: "Agriculture & Food",
    description: "Carefully sourced agricultural produce, spices, dry fruits, and processed foods.",
    image: "/images/industries/agriculture.jpg",
    logo: "/images/trivoxa-eagle.png",
    href: "/industries/",
  },
  {
    title: "Engineering & Industrial",
    description: "Industrial products, engineering components, and manufacturing solutions.",
    image: "/images/industries/engineering.jpg",
    logo: "/images/trivoxa-eagle.png",
    href: "/industries/",
  },
  {
    title: "Technology",
    description: "Software development, AI, and digital transformation for modern businesses.",
    image: "/images/industries/technology.jpg",
    logo: "/images/trivoxa-eagle.png",
    href: "/industries/",
  },
];

export default function SuccessStoriesSection() {
  const swiperContainerRef = useRef<HTMLDivElement>(null);
  const initialised = useRef(false);

  useEffect(() => {
    if (initialised.current) return;
    initialised.current = true;

    const ctx = gsap.context(() => {
      const isDesktop = window.innerWidth > BP.desktop;

      // Desktop pinned horizontal slider
      if (isDesktop) {
        const animationWrap = document.querySelector(".slider .animation-wrap") as HTMLElement;
        const container = document.querySelector(".hp-sec-2 .container") as HTMLElement;
        if (animationWrap && container) {
          const distance = animationWrap.offsetWidth;
          const offset = distance - container.offsetWidth;

          requestAnimationFrame(() => {
            gsap.timeline({
              scrollTrigger: {
                trigger: ".hp-sec-2 .slider",
                scrub: 0.5,
                pin: ".hp-sec-2",
                start: "bottom bottom-=100px",
                end: () => `+=${distance}`,
              },
            }).to(".slider .animation-wrap", { x: -offset, ease: "none" });
          });
        }
      } else {
        // Mobile Swiper
        requestAnimationFrame(() => {
          const el = swiperContainerRef.current?.querySelector(".swiper") as HTMLElement | null;
          if (!el) return;
          const swiper = new Swiper(el, {
            modules: [Autoplay],
            speed: 1300,
            breakpoints: {
              320: { slidesPerView: 1, spaceBetween: 20 },
              576: { slidesPerView: 1.05, spaceBetween: 40 },
            },
          });

          ScrollTrigger.create({
            trigger: ".case-studies .swiper",
            start: "top center",
            end: "top center+=50px",
            onEnter: () => swiper.slideNext(),
            onEnterBack: () => swiper.slidePrev(),
          });
        });
      }

      // Upper entrance
      gsap.fromTo(
        ".hp-sec-2 .word_inner",
        { opacity: 0, filter: "blur(6px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.05,
          delay: 0.3,
          scrollTrigger: { trigger: ".hp-sec-2 .container .upper" },
        }
      );
      gsap.fromTo(
        ".hp-sec-2 .upper .right h2, .hp-sec-2 .upper .right .lg-text",
        { scale: 0.94 },
        {
          scale: 1,
          duration: 2.4,
          ease: "power3.out",
          scrollTrigger: { trigger: ".hp-sec-2 .container .upper" },
        }
      );
      gsap.fromTo(
        ".hp-sec-2 .p_inner",
        { opacity: 0 },
        {
          opacity: 1,
          stagger: 0.03,
          scrollTrigger: { trigger: ".hp-sec-2 .container .upper" },
        }
      );

      // Left-text parallax (desktop)
      if (window.innerWidth > 767) {
        gsap.fromTo(
          ".hp-sec-2 .left-text-wrapper .left-text .top",
          { x: 80 },
          {
            x: 0,
            scrollTrigger: { trigger: ".hp-sec-2 .container .upper", scrub: true },
          }
        );
        gsap.fromTo(
          ".hp-sec-2 .left-text-wrapper .left-text > .left-side-title",
          { x: -80 },
          {
            x: 0,
            scrollTrigger: { trigger: ".hp-sec-2 .container .upper", scrub: true },
          }
        );
      }

      // Bottom entrance
      gsap.fromTo(
        ".hp-sec-2 .bottom h5",
        { scale: 0.94 },
        {
          scale: 1,
          duration: 2.4,
          ease: "power3.out",
          scrollTrigger: { trigger: ".hp-sec-2 .container > .bottom h5" },
        }
      );
      gsap.fromTo(
        ".hp-sec-2 .bottom .word_inner",
        { opacity: 0, filter: "blur(6px)" },
        {
          opacity: 1,
          filter: "blur(0px)",
          stagger: 0.04,
          scrollTrigger: { trigger: ".hp-sec-2 .container > .bottom h5" },
        }
      );
      gsap.fromTo(
        ".hp-sec-2 .bottom .p_inner",
        { opacity: 0 },
        {
          opacity: 1,
          stagger: 0.02,
          scrollTrigger: { trigger: ".hp-sec-2 .container > .bottom h5" },
        }
      );

      ScrollTrigger.refresh();
    });

    return () => ctx.revert();
  }, []);

  return (
    <section className="hp-sec-2">
      <div className="container">
        <div className="upper d-flex">
          <div className="left-text-wrapper">
            <div className="left-text">
              <div className="top">
                <div className="line" />
                <div className="left-side-title">Industries</div>
              </div>
              <div className="left-side-title">We Serve</div>
            </div>
          </div>
          <div className="right d-flex">
            <h2 className="title-anim">
              <TitleChars text="Supporting the Industries" />
            </h2>
            <div className="lg-text title-anim">That Shape Tomorrow</div>
            <div className="text p-anim">
              <PChars text="From textiles to technology, we tailor sourcing and professional services to the needs of every sector." />
            </div>
          </div>
        </div>
        <div className="middle case-studies" ref={swiperContainerRef}>
          {/* Desktop slider */}
          <div className="slider swiper swiper-1">
            <div className="swiper-wrapper animation-wrap">
              {caseStudies.map((study, i) => (
                <div key={i} className="item swiper-slide">
                  <div className="image">
                    <div>
                      <img src={study.image} alt="" />
                    </div>
                  </div>
                  <div className="text-wrapper d-flex">
                    <div>
                      <h4>{study.title}</h4>
                      <p>{study.description}</p>
                    </div>
                    <div className="bottom d-flex">
                      <button type="button">
                        <a href={study.href}>
                          <span>Learn More</span>
                          <img src="/images/icons/arrow-right.svg" alt="arrow-right" />
                        </a>
                      </button>
                      <div className="logo">
                        <img src={study.logo} alt="logo" />
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
        <div className="bottom d-flex">
          <div className="left">
            <h5 className="title-anim">
              <TitleChars text="Deep industry knowledge, trusted partnerships, and solutions built around your sector." />
            </h5>
          </div>
          <div className="middle" />
          <div className="right">
            <p className="p-anim">
              <PChars text="Every industry has its own standards and challenges. Trivoxa combines manufacturing expertise, responsible sourcing, and professional services to help partners grow with confidence across international markets." />
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
