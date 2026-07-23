import type { ReactNode } from "react";
import "@/app/styles/shared.css";
import "@/app/styles/scroll-infra.css";
import "@/app/styles/header.css";
import "@/app/styles/mobile-nav.css";
import "@/app/styles/contact-modal.css";
import "@/app/styles/footer.css";
import "@/app/styles/pages.css";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import ContactModal from "@/components/ContactModal";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileStickyCta from "@/components/MobileStickyCta";

/**
 * Shell for every non-home route: fixed header, mobile nav, contact modal,
 * ambient gold-on-black background, and the shared footer. Lenis smooth
 * scroll (from the root layout) applies here too — it's site-wide, not
 * home-only.
 */
export default function TrivoxaShell({ children }: { children: ReactNode }) {
  return (
    <div className="tvx">
      <div className="tvx__bg" aria-hidden />
      <Header />
      <MobileNav />
      <ContactModal />
      <main>{children}</main>
      <SiteFooter />
      <WhatsAppButton />
      <MobileStickyCta />
    </div>
  );
}
