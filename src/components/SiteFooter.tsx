"use client";

import Link from "next/link";
import { useState, type FormEvent } from "react";

const sitemapPrimary = [
  { label: "Group", href: "/group/" },
  { label: "Exports", href: "/businesses/product-exports/" },
  { label: "Industries", href: "/industries/" },
  { label: "Reach", href: "/global-presence/" },
];

const sitemapSecondary = [
  { label: "Insights", href: "/insights/" },
  { label: "Careers", href: "/careers/" },
  { label: "RFQ", href: "/rfq/" },
  { label: "Contact", href: "/contact/" },
];

const legalLinks = [
  { label: "Privacy", href: "/privacy-policy/" },
  { label: "Terms", href: "/terms/" },
  { label: "Anti-corruption Policy", href: "/anti-corruption-policy/" },
  { label: "Cookie Preferences", href: "/cookie-preferences/" },
];

export default function SiteFooter() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setError(null);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });
      if (!res.ok) throw new Error();
      setSent(true);
    } catch {
      setError("Could not subscribe right now — please try again.");
    }
  };

  return (
    <section className="footer">
      <div className="container">
        <div className="footer-content d-flex">
          {/* Brand / legal column */}
          <div className="col footer-brand">
            <div className="logo">
              <img src="/images/trivoxa-logo.png" alt="Trivoxa Group" />
            </div>
            <p className="tagline">Building the Future of Global Commerce — One Partnership at a Time.</p>
            <div className="footer-legal-block">
              <div className="footer-legal-row">
                <span className="footer-legal-label">Registered Office</span>
                <span>[PLACEHOLDER — full registered address, Surat, Gujarat, India]</span>
              </div>
              <div className="footer-legal-row">
                <span className="footer-legal-label">IEC</span>
                <span className="mono">[PLACEHOLDER — IEC number]</span>
              </div>
              <div className="footer-legal-row">
                <span className="footer-legal-label">GST</span>
                <span className="mono">[PLACEHOLDER — GST registration number]</span>
              </div>
              <div className="footer-legal-row">
                <span className="footer-legal-label">CIN</span>
                <span className="mono">[PLACEHOLDER — CIN / company registration]</span>
              </div>
              <div className="footer-legal-row">
                <span className="footer-legal-label">Trade Contact</span>
                <span>
                  <a href="https://wa.me/[PLACEHOLDER]" className="footer-legal-link">WhatsApp</a>
                  {" · "}
                  <a href="mailto:export@trivoxa.example" className="footer-legal-link">export@trivoxa.example</a>
                </span>
              </div>
              <div className="footer-legal-row footer-legal-row--hours">
                <span className="footer-legal-label">Hours</span>
                <span>Mon–Sat, 10:00–19:00 IST (UTC+5:30)</span>
              </div>
            </div>
          </div>

          {/* Sitemap columns */}
          <div className="col">
            <div className="title">Sitemap</div>
            <ul>
              {sitemapPrimary.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>
          <div className="col">
            <div className="title">&nbsp;</div>
            <ul>
              {sitemapSecondary.map((link) => (
                <li key={link.label}>
                  <Link href={link.href}>{link.label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Newsletter column */}
          <div className="col footer-newsletter">
            <div className="title">Stay Informed</div>
            <p className="footer-newsletter__copy">Quarterly dispatch on Indian export markets.</p>
            {sent ? (
              <p className="footer-newsletter__thanks">Thanks — you&rsquo;re on the list.</p>
            ) : (
              <form className="footer-newsletter__form" onSubmit={handleSubscribe}>
                <input
                  type="email"
                  required
                  placeholder="Your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-label="Email address"
                />
                <button type="submit" aria-label="Subscribe">
                  →
                </button>
              </form>
            )}
            {error && <p className="footer-newsletter__error" role="alert">{error}</p>}
          </div>
        </div>

        {/* Bottom bar */}
        <div className="footer-bottom">
          <span>&copy; Trivoxa Group 2026</span>
          {legalLinks.map((link) => (
            <Link key={link.label} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
