"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { ScrollTrigger } from "@/lib/gsap";

interface CertMark {
  code: string;
  name: string;
  status: "in-process" | "held";
  registration?: string;
}

const MARKS: CertMark[] = [
  { code: "IEC", name: "Import Export Code", status: "in-process" },
  { code: "GST", name: "Goods & Services Tax Registration", status: "in-process" },
  { code: "FIEO", name: "Federation of Indian Export Organisations", status: "in-process" },
  { code: "APEDA", name: "Agricultural & Processed Food Products Export Development Authority", status: "in-process" },
  { code: "FSSAI", name: "Food Safety & Standards Authority of India", status: "in-process" },
  { code: "ISO 9001", name: "Quality Management System", status: "in-process" },
  { code: "Spice Board", name: "Spices Board of India", status: "in-process" },
  { code: "CE", name: "CE Marking (EU Conformity)", status: "in-process" },
  { code: "WHO-GMP", name: "WHO Good Manufacturing Practice", status: "in-process" },
];

function CertBadge({ mark }: { mark: CertMark }) {
  const dashed = mark.status === "in-process";
  return (
    <div className={`cert-mark${dashed ? " cert-mark--pending" : ""}`}>
      <svg
        className="cert-mark__badge"
        width="72"
        height="72"
        viewBox="0 0 72 72"
        aria-hidden="true"
      >
        <circle
          cx="36"
          cy="36"
          r="33"
          fill="none"
          strokeWidth="1.25"
          strokeDasharray={dashed ? "4 4" : undefined}
        />
        <text x="36" y="41" textAnchor="middle" className="cert-mark__code-text">
          {mark.code.length > 6 ? mark.code.slice(0, 2).toUpperCase() : mark.code}
        </text>
      </svg>
      <span className="cert-mark__code">{mark.code}</span>
      <span className="cert-mark__name">{mark.name}</span>
      <span className="cert-mark__status">
        {mark.status === "held" && mark.registration ? mark.registration : "In process"}
      </span>
    </div>
  );
}

export default function CertificationsStrip() {
  const sectionRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;
    const ctx = gsap.context(() => {
      gsap.fromTo(
        ".cert-mark",
        { opacity: 0, y: 16 },
        {
          opacity: 1,
          y: 0,
          stagger: 0.05,
          duration: 0.6,
          ease: "power2.out",
          scrollTrigger: { trigger: sectionRef.current, start: "top 78%" },
        }
      );
    }, sectionRef);
    ScrollTrigger.refresh();
    return () => ctx.revert();
  }, []);

  return (
    <section className="certifications-strip" ref={sectionRef}>
      <div className="container">
        <span className="certifications-strip__eyebrow">COMPLIANCE &amp; MEMBERSHIPS</span>
        <div className="certifications-strip__row">
          {MARKS.map((mark) => (
            <CertBadge key={mark.code} mark={mark} />
          ))}
        </div>
        <p className="certifications-strip__footnote">All certifications verifiable on request.</p>
      </div>
    </section>
  );
}
