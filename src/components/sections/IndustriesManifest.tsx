"use client";

import { useEffect, useRef } from "react";
import { gsap, ScrollTrigger } from "@/lib/gsap";

const INDUSTRIES = [
  { name: "Textile & Apparel", desc: "Fabrics, home textiles, apparel accessories.", image: "/images/industries/textile-editorial.png" },
  { name: "Healthcare & Pharmaceuticals", desc: "Trusted pharmaceutical products & healthcare solutions.", image: "/images/industries/healthcare-editorial.png" },
  { name: "Building Materials", desc: "Natural stone, marble, granite & construction materials.", image: "/images/industries/building-editorial.png" },
  { name: "Agriculture & Food", desc: "Sourced produce, spices, dry fruits & processed foods.", image: "/images/industries/agriculture.jpg" },
  { name: "Engineering & Industrial", desc: "Industrial products, components & manufacturing solutions.", image: "/images/industries/engineering.jpg" },
  { name: "Technology", desc: "Software, AI & digital transformation for modern business.", image: "/images/industries/technology.jpg" },
];

const TOTAL = String(INDUSTRIES.length).padStart(2, "0");

export default function IndustriesManifest() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      gsap.to(".industries-folio__eyebrow, .industries-folio__title", {
        opacity: 1,
        y: 0,
        duration: 0.8,
        ease: "power3.out",
        stagger: 0.06,
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
      });

      if (window.innerWidth > 767) {
        const track = trackRef.current!;
        const panels = gsap.utils.toArray<HTMLElement>(".industries-folio__panel", track);

        gsap.to(track, {
          x: () => -(track.scrollWidth - window.innerWidth),
          ease: "none",
          scrollTrigger: {
            trigger: sectionRef.current,
            start: "top top",
            end: () => "+=" + (track.scrollWidth - window.innerWidth),
            scrub: 1,
            pin: true,
            invalidateOnRefresh: true,
            // Settle on whole panels so the carousel never comes to rest
            // mid-transition (which clips the active title on the left and
            // lets the next panel peek in on the right).
            snap: {
              snapTo: 1 / (panels.length - 1),
              duration: { min: 0.15, max: 0.4 },
              ease: "power1.inOut",
            },
            onUpdate: (self) => {
              const idx = Math.min(panels.length - 1, Math.floor(self.progress * panels.length));
              if (progressRef.current) progressRef.current.textContent = String(idx + 1).padStart(2, "0");
            },
          },
        });

        ScrollTrigger.refresh();
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="hp-sec-2 industries-folio" ref={sectionRef}>
      <div className="industries-folio__head container">
        <span className="industries-folio__eyebrow">Industries</span>
        <h2 className="industries-folio__title">Supporting the Industries That Shape Tomorrow</h2>
      </div>
      <div className="industries-folio__track" ref={trackRef}>
        {INDUSTRIES.map((ind, i) => (
          <div className="industries-folio__panel" key={ind.name}>
            <div className="industries-folio__text">
              <span className="industries-folio__index">{String(i + 1).padStart(2, "0")}</span>
              <h3 className="industries-folio__name">{ind.name}</h3>
              <p className="industries-folio__desc">{ind.desc}</p>
            </div>
            <div className="industries-folio__image" style={{ backgroundImage: `url(${ind.image})` }} />
          </div>
        ))}
      </div>
      <div className="industries-folio__progress">
        <span ref={progressRef}>01</span> / {TOTAL}
      </div>
    </section>
  );
}
