import type { ReactNode } from "react";
import "@/styles/shared.css";
import "@/styles/scroll-infra.css";
import "@/styles/header.css";
import "@/styles/mobile-nav.css";
import "@/styles/contact-modal.css";
import "@/styles/footer.css";
import "@/styles/pages.css";
import "@/styles/motion.css";

import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import SiteFooter from "@/components/SiteFooter";
import WhatsAppButton from "@/components/WhatsAppButton";
import MobileStickyCta from "@/components/MobileStickyCta";
import ContactModal from "@/components/ContactModal";
import ShaderBackground from "@/components/ShaderBackground";

/**
 * Shell for every non-home route: fixed header, mobile nav, contact modal,
 * ambient gold-on-black background, and the shared footer. Lenis smooth
 * scroll (from the root layout) applies here too — it's site-wide, not
 * home-only.
 */
export default function TrivoxaShell({
  children,
  film,
}: {
  children: ReactNode;
  /**
   * Live GLSL shader-background variant (see ShaderBackground + src/shaders).
   * Omit on a route that runs its own particle field — one WebGL context per page.
   */
  film?: string;
}) {
  return (
    <div className="tvx">
      <div className="tvx__bg" aria-hidden />
      {film ? <ShaderBackground variant={film} /> : null}
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
