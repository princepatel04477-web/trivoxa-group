"use client";

import { useState, type FormEvent } from "react";
import { Link } from "@/i18n/navigation";

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
  { label: "Compliance", href: "/compliance/" },
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
            <p className="footer-newsletter__copy">Quarterly dispatch on global trade and business insights.</p>
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
