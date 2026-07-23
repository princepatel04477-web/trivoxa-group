import type { Metadata } from "next";
import Link from "next/link";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CtaBand } from "@/components/trivoxa/ui";
import SplitScreenSticky from "@/components/patterns/SplitScreenSticky";
import ProcessLoader from "@/components/patterns/ProcessLoader";
import NumberedList from "@/components/patterns/NumberedList";
import { serviceCategories } from "@/lib/data/services";
import "@/app/styles/patterns.css";
import "@/app/styles/industries-page.css";
import "@/app/styles/service-exports-page.css";

export const metadata: Metadata = {
  title: "Service Exports | Trivoxa Group",
  description:
    "Trivoxa Group helps organizations grow through technology, software, AI, branding, digital marketing, and business support services.",
};

const BASE = "/businesses/service-exports";

const delivery = [
  { title: "Discovery Call", description: "Objectives, scope, technical needs, and success criteria." },
  { title: "Requirements & Scope", description: "A clear, agreed definition of what will be delivered." },
  { title: "Team Assembly", description: "We connect you with skilled professionals suited to your project." },
  { title: "Delivery Sprints", description: "Clear milestones and transparent communication throughout." },
  { title: "Ongoing Support", description: "Reliable delivery plus ongoing support as you scale." },
];

const strengths = [
  { title: "India Talent Network" },
  { title: "Time-Zone Advantage" },
  { title: "Quality Coordination" },
  { title: "Transparent Communication" },
  { title: "Scalable Teams" },
  { title: "Long-Term Partnership" },
];

export default function ServiceExportsPage() {
  return (
    <TrivoxaShell film="service-digital">
      {/* 1. HERO */}
      <PageHero
        crumb={[{ label: "Businesses", href: "/businesses/" }, { label: "Service Exports" }]}
        eyebrow="Service Exports"
        title="Global Service Exports."
        description="We help organizations accelerate growth through technology, software development, artificial intelligence, branding, digital marketing, and business support services. By connecting businesses with India's skilled professionals, we deliver practical solutions tailored to modern business challenges."
        actions={[{ label: "Request a Consultation", modal: true }, { label: "Explore Services", href: "#services", variant: "ghost" }]}
      />

      {/* 2. ABOUT — split-screen sticky, talent-network positioning */}
      <div className="container">
        <SplitScreenSticky
          eyebrow="About Service Exports"
          title="India's Skilled Professionals, Working as Your Team."
          paragraphs={[
            "Our service export division connects organizations with skilled professionals delivering technology, design, and business solutions.",
            "This is more than outsourced services — it is access to a talent network. Teams integrate with yours, communicate transparently, and scale as your needs grow.",
            "From software and AI to branding and business support, we help you move faster with dependable, quality-driven execution.",
          ]}
        />
      </div>

      {/* 3. SERVICE CATEGORIES — manifest rows with sub-service preview */}
      <Section id="services" eyebrow="Service Categories" title="A Full Spectrum of Professional Services.">
        <div className="industry-list">
          {serviceCategories.map((cat, i) => (
            <Link key={cat.slug} href={`${BASE}/${cat.slug}/`} className="industry-row">
              <span className="industry-row__index">{String(i + 1).padStart(2, "0")}</span>
              <span className="industry-row__name">{cat.name}</span>
              <span className="industry-row__desc service-row__preview">
                {cat.subServices.slice(0, 3).map((s) => s.name).join(" · ")}
              </span>
            </Link>
          ))}
        </div>
      </Section>

      {/* 4. DELIVERY PROCESS — step-by-step process loader */}
      <Section eyebrow="Delivery Process" title="How We Deliver, Reliably.">
        <ProcessLoader steps={delivery} />
      </Section>

      {/* 5. WHY CHOOSE TRIVOXA — numbered list */}
      <Section eyebrow="Why Choose Trivoxa" title="Practical Solutions, Long-Term Partnership.">
        <NumberedList items={strengths} />
      </Section>

      {/* 6. CTA */}
      <CtaBand
        title="Let's Build Something Together."
        description="Share your project or challenge, and we'll connect you with the right team to deliver it."
        actions={[{ label: "Book a Consultation", modal: true }, { label: "Request Proposal", href: "/rfq/", variant: "ghost" }]}
      />

      <p className="digital-note">
        Trivoxa Digital — a dedicated tech services arm of Trivoxa Group. Visit digital.trivoxagroup.com
      </p>
    </TrivoxaShell>
  );
}
