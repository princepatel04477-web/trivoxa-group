import type { Metadata } from "next";
import "@/app/styles/patterns.css";
import "@/app/styles/product-exports-page.css";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CtaBand } from "@/components/trivoxa/ui";
import HorizontalTimeline from "@/components/patterns/HorizontalTimeline";
import NumberedList from "@/components/patterns/NumberedList";
import IndustryManifest from "@/components/industries/IndustryManifest";
import { exportCategories } from "@/lib/data/product-categories";

export const metadata: Metadata = {
  title: "Product Exports | Trivoxa Group",
  description:
    "Trivoxa Group sources and delivers high-quality products through a trusted network of manufacturing partners across India.",
};

const sourcing = [
  { title: "Understand Requirements", description: "Specifications, volumes, quality standards, and commercial expectations." },
  { title: "Identify Manufacturing Partners", description: "We match your needs to the right vetted producers across India." },
  { title: "Coordinate Production", description: "We manage timelines and communication through every stage." },
  { title: "Quality & Documentation", description: "Quality-focused coordination plus complete export documentation." },
  { title: "Global Delivery", description: "Logistics coordination and dependable international delivery." },
];

const quality = [
  { title: "Quality-Focused Coordination", description: "Quality-focused coordination at every stage of production." },
  { title: "Specification Discipline", description: "Careful attention to agreed specifications." },
  { title: "Vetted Partners", description: "Trusted, vetted manufacturing partners." },
  { title: "Complete Documentation", description: "Complete export documentation." },
  { title: "Reliable Delivery", description: "Reliable logistics and delivery." },
];

export default function ProductExportsPage() {
  return (
    <TrivoxaShell>
      {/* 1. HERO */}
      <PageHero
        crumb={[{ label: "Businesses", href: "/businesses/" }, { label: "Product Exports" }]}
        eyebrow="Product Exports"
        title="Global Product Exports."
        description="We connect international buyers with carefully selected manufacturing partners across India to deliver quality products through dependable sourcing and export solutions."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />

      {/* 2. ABOUT PRODUCT EXPORTS */}
      <Section
        eyebrow="About Product Exports"
        title="A Single, Trusted Gateway to India's Manufacturing Strength."
        lead={
          "From industrial materials and textiles to healthcare products and consumer goods, our focus is on connecting global buyers with dependable supply solutions that meet international expectations.\n\n" +
          "Backed by the manufacturing foundation of Shiveshwar Textiles, we combine practical production knowledge with a growing network of trusted partners."
        }
      />

      {/* 3. INDUSTRIES WE SERVE — 7-row manifest into category pages */}
      <Section eyebrow="Industries We Serve" title="Products Across Every Major Sector." lead="Explore the industries we support through our product export division.">
        <IndustryManifest
          rows={exportCategories.map((c) => ({
            name: c.name,
            description: c.description,
            href: `/businesses/product-exports/${c.slug}/`,
            image: c.image,
          }))}
        />
      </Section>

      {/* 4. GLOBAL SOURCING PROCESS — horizontal timeline */}
      <Section eyebrow="Global Sourcing Process" title="A Structured Path From Requirement to Delivery.">
        <HorizontalTimeline steps={sourcing} />
      </Section>

      {/* 5. QUALITY ASSURANCE */}
      <Section eyebrow="Quality Assurance" title="Quality You Can Rely On." lead="Every order is supported by a quality-focused, documentation-driven process built for international trade.">
        <NumberedList items={quality} />
      </Section>

      {/* 6. CTA */}
      <CtaBand
        title="Let's Source Your Next Product Together."
        description="Tell us what you need to source, and our team will connect you with the right manufacturing partners and a dependable export process."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Explore Textile & Apparel", href: "/businesses/product-exports/textile-apparel/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
