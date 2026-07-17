"use client";

import { useEffect, useRef } from "react";
import { gsap } from "@/lib/gsap";
import { revealBody } from "@/hooks/useScrollAnimations";
import { Eyebrow } from "@/components/trivoxa/ui";

export interface LeadershipPanelProps {
  /** Section landmark label (e.g. "Leadership") — rendered as the section's
   * heading so it appears in heading-navigation, matching every other
   * flat section on the page. Set only on the first panel of a founders
   * wall so the wall reads as one section with one landmark. */
  eyebrow?: string;
  /** Omit name/role/photoSrc entirely until a real profile is ready — renders
   * an honest "profile pending" placeholder instead of a stand-in. */
  name?: string;
  role?: string;
  email?: string;
  photoSrc?: string;
  message: string;
  align: "left" | "right";
}

/** Full-viewport founders-wall panel. Portrait mask-reveals in on scroll and
 * desaturates by default, resolving to color on hover; text staggers in
 * beside it. Alternate `align` to mirror portrait/text sides down the wall. */
export default function LeadershipPanel({ eyebrow, name, role, email, photoSrc, message, align }: LeadershipPanelProps) {
  const ref = useRef<HTMLDivElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current) return;
    const ctx = gsap.context(() => {
      revealBody(ref.current!);
      if (portraitRef.current) {
        gsap.fromTo(
          portraitRef.current,
          { clipPath: "inset(100% 0 0 0)" },
          {
            clipPath: "inset(0% 0 0 0)",
            duration: 1.2,
            ease: "expo.out",
            scrollTrigger: { trigger: portraitRef.current, start: "top 85%" },
          }
        );
      }
    }, ref);
    return () => ctx.revert();
  }, []);

  return (
    <section className={`leadership-panel leadership-panel--${align}`} ref={ref}>
      <div ref={portraitRef} className="leadership-panel__portrait">
        {photoSrc ? (
          <img src={photoSrc} alt={name ?? "Leadership portrait"} />
        ) : (
          <div className="leadership-panel__pending">
            <svg width="72" height="72" viewBox="0 0 56 56" aria-hidden="true">
              <circle cx="28" cy="28" r="26" fill="none" strokeDasharray="4 4" />
              <circle cx="28" cy="21" r="9" fill="none" />
              <path d="M11 46c2-10 9-15 17-15s15 5 17 15" fill="none" />
            </svg>
            <p className="leadership-panel__pending-label">Profile in progress</p>
          </div>
        )}
      </div>
      <div className="leadership-panel__text">
        {eyebrow && (
          <h2 data-reveal-body className="leadership-panel__eyebrow">
            <Eyebrow>{eyebrow}</Eyebrow>
          </h2>
        )}
        {name && (
          <h3 data-reveal-body className="leadership-panel__name">
            {name}
          </h3>
        )}
        {role && (
          <p data-reveal-body className="leadership-panel__role">
            {role}
          </p>
        )}
        {email && (
          <a data-reveal-body href={`mailto:${email}`} className="leadership-panel__email">
            {email}
          </a>
        )}
        <blockquote data-reveal-body className="leadership-panel__message">
          <p>{message}</p>
        </blockquote>
      </div>
    </section>
  );
}
