import "@/app/styles/shared.css";
import "@/app/styles/scroll-infra.css";
import "@/app/styles/header.css";
import "@/app/styles/mobile-nav.css";
import "@/app/styles/hero.css";
import "@/app/styles/success-stories.css";
import "@/app/styles/statistics.css";
import "@/app/styles/core-services.css";
import "@/app/styles/contact-section.css";
import "@/app/styles/footer.css";
import "@/app/styles/contact-modal.css";
import SmoothScrollProvider from "@/components/providers/SmoothScroll";
import Preloader from "@/components/Preloader";
import ScrollTopWidget from "@/components/ScrollTopWidget";
import Header from "@/components/Header";
import MobileNav from "@/components/MobileNav";
import HeroSection from "@/components/HeroSection";
import SuccessStoriesSection from "@/components/SuccessStoriesSection";
import StatisticsSection from "@/components/StatisticsSection";
import CoreServicesSection from "@/components/CoreServicesSection";
import ContactSection from "@/components/ContactSection";
import SiteFooter from "@/components/SiteFooter";
import ContactModal from "@/components/ContactModal";
import ParticleCanvasWrapper from "@/components/ParticleCanvasWrapper";

export default function Home() {
  return (
    <SmoothScrollProvider>
      <Preloader />
      <ParticleCanvasWrapper />
      <Header />
      <MobileNav />
      <ContactModal />
      <ScrollTopWidget />
      <HeroSection />
      <SuccessStoriesSection />
      <StatisticsSection />
      <CoreServicesSection />
      <ContactSection />
      <SiteFooter />
    </SmoothScrollProvider>
  );
}
