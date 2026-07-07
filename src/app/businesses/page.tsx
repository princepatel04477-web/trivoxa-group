import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, Steps, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Businesses | Trivoxa Group",
  description:
    "Trivoxa Group operates through two divisions — Product Exports and Service Exports — delivering integrated solutions across global markets.",
};

const divisions = [
  {
    icon: "📦",
    title: "Global Product Exports",
    description:
      "We source and deliver high-quality products through a trusted network of manufacturing partners across India — from industrial materials and textiles to healthcare products and consumer goods.",
    href: "/businesses/product-exports/",
    cta: "Explore Product Exports",
  },
  {
    icon: "💻",
    title: "Global Service Exports",
    description:
      "We help organizations accelerate growth through technology, software development, artificial intelligence, branding, digital marketing, and business support services.",
    href: "/businesses/service-exports/",
    cta: "Explore Service Exports",
  },
];

const steps = [
  { title: "Understand Your Requirements", desc: "We begin by understanding your business objectives, technical specifications, and commercial expectations." },
  { title: "Recommend the Right Solution", desc: "We identify the most suitable products, manufacturing partners, or professional service teams." },
  { title: "Coordinate Production or Execution", desc: "We manage sourcing, production, or project execution with clear communication throughout." },
  { title: "Verify Quality", desc: "Every solution is supported by quality-focused coordination and careful attention to agreed requirements." },
  { title: "Deliver with Confidence", desc: "From documentation and logistics to project delivery and ongoing support, we ensure a reliable experience." },
];

const strengths = [
  { icon: "🏭", title: "Manufacturing Foundation", description: "Built upon the manufacturing expertise of our parent company, Shiveshwar Textiles." },
  { icon: "🤝", title: "Trusted Partner Network", description: "A growing ecosystem of carefully selected manufacturers, professionals, and solution providers." },
  { icon: "✓", title: "Quality-Driven Approach", description: "Every project is guided by attention to quality, reliability, and long-term value." },
  { icon: "🌐", title: "Global Perspective", description: "Supporting businesses across international markets with solutions designed for global trade." },
  { icon: "📈", title: "Scalable Solutions", description: "Flexible capabilities that grow alongside our clients' evolving needs." },
  { icon: "♾", title: "Long-Term Relationships", description: "Sustainable success is achieved through lasting partnerships rather than one-time transactions." },
];

export default function BusinessesPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Our Businesses"
        title="Global Solutions for Modern Business."
        description="Trivoxa Group delivers integrated product sourcing and professional service solutions that help businesses expand across international markets. Through trusted partnerships, manufacturing expertise, and a commitment to excellence, we connect organizations with the products, services, and opportunities they need to grow with confidence."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Explore Our Divisions", href: "#divisions", variant: "ghost" }]}
      />

      <Section
        eyebrow="Our Businesses"
        title="Two Divisions. One Shared Commitment to Excellence."
        lead={
          "Trivoxa Group operates through two complementary business divisions designed to support organizations across global markets.\n\n" +
          "Our Product Export Division connects international buyers with trusted manufacturers and carefully sourced products from India, while our Service Export Division provides access to skilled professionals delivering technology, design, and business solutions.\n\n" +
          "Together, these divisions enable us to offer integrated solutions that combine manufacturing strength, professional expertise, and long-term partnership."
        }
      />

      <Section id="divisions" eyebrow="Our Divisions" title="Two Divisions, Built to Scale With You.">
        <CardGrid cols={2} items={divisions} />
      </Section>

      <Section eyebrow="Our Process" title="A Structured Approach to Global Business." lead="Every successful partnership begins with understanding. Our process is designed to ensure clarity, quality, and confidence at every stage of the journey.">
        <Steps items={steps} />
      </Section>

      <Section eyebrow="Why Trivoxa" title="Built on Experience. Focused on Partnership.">
        <CardGrid cols={3} items={strengths} />
      </Section>

      <CtaBand
        title="Let's Build Global Business Together."
        description="Whether you're sourcing products, seeking professional expertise, or exploring new international opportunities, Trivoxa Group is ready to help you move forward with confidence."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
