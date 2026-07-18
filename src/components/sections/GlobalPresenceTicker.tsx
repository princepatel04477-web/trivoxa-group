"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap, ScrollTrigger } from "@/lib/gsap";
import { revealHeadings, revealBody } from "@/hooks/useScrollAnimations";

const CORRIDORS = [
  { lane: "Mumbai → Rotterdam", cargo: "Cotton & Textiles" },
  { lane: "Mundra → Jebel Ali", cargo: "Spices & Agri" },
  { lane: "Kandla → Hamburg", cargo: "Marble & Granite" },
  { lane: "Nhava Sheva → Singapore", cargo: "Textiles" },
  { lane: "Mumbai → New York", cargo: "Pharmaceuticals" },
  { lane: "Mundra → Rotterdam", cargo: "Engineering Goods" },
  { lane: "Kandla → Jebel Ali", cargo: "Agri Produce" },
  { lane: "Nhava Sheva → Hamburg", cargo: "Building Materials" },
];

export default function GlobalPresenceTicker() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      revealHeadings(sectionRef.current!);
      revealBody(sectionRef.current!);
      // Opacity only — the marquee (CSS animation) owns the track's transform.
      gsap.to(".ticker-track", {
        opacity: 1,
        duration: 0.8,
        ease: "power3.out",
        scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
      });
      ScrollTrigger.refresh();
    }, sectionRef);
    return () => ctx.revert();
  }, []);

  const doubled = [...CORRIDORS, ...CORRIDORS];

  return (
    <section className="hp-global presence" ref={sectionRef}>
      <div className="container">
        <div className="home-eyebrow" data-reveal-body>Global Presence</div>
        <h2 className="home-heading" data-reveal-heading>Connecting Opportunities Across Borders</h2>
        <p className="home-lead" data-reveal-body>
          International business is built on trust, collaboration, and strong relationships. Through
          an expanding network of suppliers, partners, and clients, Trivoxa Group is building
          meaningful connections that enable organizations to grow confidently across international
          markets.
        </p>
      </div>

      <div className="ticker">
        <div className="ticker-track">
          {doubled.map((row, i) => (
            <span className="ticker-row" key={i}>
              {row.lane} · {row.cargo}
            </span>
          ))}
        </div>
      </div>

      <p className="ticker-disclaimer" data-reveal-body>
        Illustrative trade corridors — representative of the lanes Trivoxa operates, not live
        shipment tracking.
      </p>

      {/* Stage the particle cargo-ship morph (see particle-scene.ts, .hp-global). */}
      <div className="presence-map" aria-hidden />

      <div className="container">
        <blockquote className="presence-vision" data-reveal-body>
          <p>
            Whichever port a shipment leaves from — Mundra, Kandla, Nhava Sheva — it carries the
            same standard set on the manufacturing floor in Surat. That doesn&apos;t change with the
            destination.
          </p>
          <cite>— Trivoxa Group</cite>
        </blockquote>
        <div className="home-cta" data-reveal-body style={{ justifyContent: "center" }}>
          <Link className="btn-ghost" href="/global-presence/">
            View Global Presence
          </Link>
        </div>
      </div>
    </section>
  );
}
