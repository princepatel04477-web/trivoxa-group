import { Suspense } from "react";
import type { Metadata } from "next";
import "@/app/styles/shared.css";
import "@/app/styles/scroll-infra.css";
import "@/app/styles/header.css";
import "@/app/styles/mobile-nav.css";
import "@/app/styles/hero.css";
import "@/app/styles/home.css";
import "@/app/styles/flagship-sections.css";
import "@/app/styles/footer.css";
import "@/app/styles/contact-modal.css";
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
import ContactModal from "@/components/ContactModal";
import ParticleCanvasWrapper from "@/components/ParticleCanvasWrapper";
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
        <ParticleCanvasWrapper />
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

