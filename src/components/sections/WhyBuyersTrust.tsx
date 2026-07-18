"use client";

import { useEffect, useRef } from "react";
import Link from "next/link";
import { gsap } from "@/lib/gsap";

const PILLARS = [
  {
    title: "Vetted Supplier Network",
    body: "Every manufacturing partner is screened before onboarding — capability, compliance, and track record — so buyers engage only pre-qualified Indian suppliers.",
  },
  {
    title: "Documented Quality Control",
    body: "Inspection checkpoints from factory floor to container loading. QC reports and packaging photographs are available on request for every shipment.",
  },
  {
    title: "Shipment-Ready Execution",
    body: "We manage export documentation, Incoterms (FOB / CIF / CFR), and port logistics across Mundra, Kandla, and Nhava Sheva — built for first-time and repeat importers alike.",
  },
  {
    title: "Transparent Legal Identity",
    body: "Registered office, IEC, GST, and CIN are published openly. No hidden entities, no inquiry-gated legal details.",
  },
];

export default function WhyBuyersTrust() {
  const ref = useRef<HTMLElement>(null);

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

  return (
    <section className="home-sec hp-trust" ref={ref}>
      <div className="container">
        <div className="head-col">
          <div className="home-eyebrow home-reveal">Why Buyers Trust Trivoxa</div>
          <h2 className="home-heading home-reveal">
            A sourcing partner, not just a supplier directory.
          </h2>
        </div>
        <div className="trust-grid">
          {PILLARS.map((p) => (
            <div className="trust-card home-reveal" key={p.title}>
              <h3 className="trust-card__title">{p.title}</h3>
              <p className="trust-card__body">{p.body}</p>
            </div>
          ))}
        </div>
        <p className="trust-note home-reveal">
          Case studies, named client references, and export-volume proof are being published as
          engagements complete. [PLACEHOLDER — add verified buyer references and shipment stats here.]
        </p>
        <div className="home-cta home-reveal">
          <Link className="btn-gold" href="/businesses/product-exports/">
            Explore Export Capabilities
          </Link>
        </div>
      </div>
    </section>
  );
}
