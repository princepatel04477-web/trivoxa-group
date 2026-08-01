import { Suspense } from "react";
import type { Metadata } from "next";
import "@/styles/shared.css";
import "@/styles/scroll-infra.css";
import "@/styles/header.css";
import "@/styles/mobile-nav.css";
import "@/styles/hero.css";
import "@/styles/home.css";
import "@/styles/flagship-sections.css";
import "@/styles/footer.css";
import "@/styles/contact-modal.css";
import Preloader from "@/components/Preloader";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import HeroSection from "@/components/HeroSection";
import BusinessArmsPanels from "@/components/sections/BusinessArmsPanels";
import IndustriesManifest from "@/components/sections/IndustriesManifest";
import GlobalPresenceTicker from "@/components/sections/GlobalPresenceTicker";
import ValuesHoverList from "@/components/sections/ValuesHoverList";
import InsightsMagazine from "@/components/sections/InsightsMagazine";
import { AboutPreview, CareersPreview, FinalCta } from "@/components/home/previews";
import SiteFooter from "@/components/SiteFooter";
import ParticleCanvasWrapper from "@/components/ParticleCanvasWrapper";
import ContactModal from "@/components/ContactModal";
import { HOME } from "@/lib/choreography";
import WhyBuyersTrust from "@/components/sections/WhyBuyersTrust";
import MobileStickyCta from "@/components/MobileStickyCta";

export const metadata: Metadata = {
  title: "Trivoxa Group | International Trade & Business Solutions",
  description:
    "Trivoxa Group is an international business group delivering product sourcing, manufacturing partnerships, and professional services across global markets. Built on decades of manufacturing expertise.",
};

export default function Home() {
  return (
    <>
      <Preloader />
      <Suspense fallback={null}>
        <ParticleCanvasWrapper config={HOME} />
      </Suspense>
      <Header />
      <MobileNav />
      <ContactModal />

      {/* 1 · Hero — particle eagle */}
      <HeroSection />
      <div className="section-divider" />

      {/* 1b · Why Buyers Trust — trust layer immediately after hero (audit fix #5) */}
      <WhyBuyersTrust />
      <div className="section-divider" />

      {/* 2 · About Preview */}
      <AboutPreview />
      <div className="section-divider" />

      {/* 3 · Businesses (Product & Service Exports) — full-bleed cinematic panels */}
      <BusinessArmsPanels />
      <div className="section-divider" />

      {/* 4 · Industries — editorial manifest */}
      <IndustriesManifest />
      <div className="section-divider" />

      {/* 5 · Global Presence — shipping ticker + map — particle globe */}
      <GlobalPresenceTicker />
      <div className="section-divider" />

      {/* 6 · Values — numbered hover list */}
      <ValuesHoverList />
      <div className="section-divider" />

      {/* 7 · Insights — magazine columns */}
      <InsightsMagazine />
      <div className="section-divider" />

      {/* 8 · Careers Preview */}
      <CareersPreview />
      <div className="section-divider" />

      {/* 8 · Final CTA — particle eagle outline */}
      <FinalCta />

      {/* 9 · Footer */}
      <SiteFooter />
      <MobileStickyCta />
    </>
  );
}

