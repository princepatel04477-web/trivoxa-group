import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, Steps, Checklist, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Product Exports | Trivoxa Group",
  description:
    "Trivoxa Group sources and delivers high-quality products through a trusted network of manufacturing partners across India.",
};

const industries = [
  { icon: "🧵", title: "Textile & Apparel", description: "Fabrics, home textiles, and apparel accessories.", href: "/businesses/textile-apparel/", cta: "Explore" },
  { icon: "💊", title: "Healthcare & Pharmaceuticals", description: "Pharmaceutical products and medical supplies through responsible sourcing." },
  { icon: "🏗️", title: "Building Materials", description: "Marble, granite, stone, cement, tiles, and construction materials." },
  { icon: "🪑", title: "Furniture & Interiors", description: "Furniture and interior solutions for home, office, and hospitality." },
  { icon: "🌾", title: "Agriculture & Food", description: "Fresh produce, spices, dry fruits, and processed foods." },
  { icon: "⚙️", title: "Engineering & Industrial", description: "Engineering components, industrial products, and automotive parts." },
  { icon: "💎", title: "Jewellery & Precious Products", description: "Gold, silver, diamond, and gemstone jewellery." },
];

const sourcing = [
  { title: "Understand Requirements", desc: "Specifications, volumes, quality standards, and commercial expectations." },
  { title: "Identify Manufacturing Partners", desc: "We match your needs to the right vetted producers across India." },
  { title: "Coordinate Production", desc: "We manage timelines and communication through every stage." },
  { title: "Quality & Documentation", desc: "Quality-focused coordination plus complete export documentation." },
  { title: "Global Delivery", desc: "Logistics coordination and dependable international delivery." },
];

const quality = [
  "Quality-focused coordination at every stage",
  "Careful attention to agreed specifications",
  "Trusted, vetted manufacturing partners",
  "Complete export documentation",
  "Reliable logistics and delivery",
];

export default function ProductExportsPage() {
  return (
    <TrivoxaShell>
      <PageHero
        crumb={[{ label: "Businesses", href: "/businesses/" }, { label: "Product Exports" }]}
        eyebrow="Product Exports"
        title="Dependable Products. Delivered Worldwide."
        description="We connect international buyers with carefully selected manufacturing partners across India to deliver quality products through dependable sourcing and export solutions."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />

      <Section
        eyebrow="About Product Exports"
        title="A Single, Trusted Gateway to India's Manufacturing Strength."
        lead={
          "From industrial materials and textiles to healthcare products and consumer goods, our focus is on connecting global buyers with dependable supply solutions that meet international expectations.\n\n" +
          "Backed by the manufacturing foundation of Shiveshwar Textiles, we combine practical production knowledge with a growing network of trusted partners."
        }
      />

      <Section eyebrow="Industries We Serve" title="Products Across Every Major Sector." lead="Explore the industries we support through our product export division.">
        <CardGrid cols={4} items={industries} />
      </Section>

      <Section eyebrow="Global Sourcing Process" title="A Structured Path From Requirement to Delivery.">
        <Steps items={sourcing} />
      </Section>

      <Section eyebrow="Quality Assurance" title="Quality You Can Rely On." lead="Every order is supported by a quality-focused, documentation-driven process built for international trade.">
        <Checklist items={quality} />
      </Section>

      <CtaBand
        title="Let's Source Your Next Product Together."
        description="Tell us what you need to source, and our team will connect you with the right manufacturing partners and a dependable export process."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Explore Textile & Apparel", href: "/businesses/textile-apparel/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
