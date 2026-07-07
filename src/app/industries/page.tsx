import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, Steps, Checklist, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Industries | Trivoxa Group",
  description:
    "Trivoxa Group serves diverse industries with tailored product sourcing and professional service solutions across global markets.",
};

const industries = [
  { icon: "🧵", title: "Textile & Apparel", description: "Fabrics, home textiles, apparel accessories, and customized sourcing solutions for brands and wholesalers.", href: "/businesses/textile-apparel/", cta: "Explore Industry" },
  { icon: "💊", title: "Healthcare & Pharmaceuticals", description: "Trusted pharmaceutical products and healthcare solutions through responsible, quality-focused sourcing.", href: "/industries/", cta: "Explore Industry" },
  { icon: "🏗️", title: "Building Materials", description: "Natural stone, marble, granite, ceramics, and construction materials for global projects.", href: "/industries/", cta: "Explore Industry" },
  { icon: "🪑", title: "Furniture & Interiors", description: "Quality furniture and interior solutions for residential, commercial, and hospitality environments.", href: "/industries/", cta: "Explore Industry" },
  { icon: "🌾", title: "Agriculture & Food", description: "Carefully sourced agricultural products, fresh produce, spices, and processed food solutions.", href: "/industries/", cta: "Explore Industry" },
  { icon: "⚙️", title: "Engineering & Industrial", description: "Industrial products, engineering components, and manufacturing solutions for infrastructure growth.", href: "/industries/", cta: "Explore Industry" },
  { icon: "💻", title: "Technology", description: "Software development, AI, and digital transformation solutions for modern businesses.", href: "/businesses/service-exports/", cta: "Explore Industry" },
  { icon: "🛒", title: "Retail & Consumer Goods", description: "Scalable sourcing and business solutions that strengthen retailer and distributor supply chains.", href: "/industries/", cta: "Explore Industry" },
];

const solutions = [
  "Strategic Product Sourcing",
  "Professional Service Solutions",
  "Manufacturing Partnerships",
  "Quality Coordination",
  "Export Documentation",
  "Logistics Coordination",
  "Technology Integration",
  "Long-Term Business Support",
];

const approach = [
  { title: "Understand Industry Requirements", desc: "We understand your business, technical specifications, compliance requirements, and commercial objectives before recommending a solution." },
  { title: "Connect the Right Partners", desc: "Our network of manufacturers, professionals, logistics providers, and technology specialists assembles solutions tailored to your industry." },
  { title: "Deliver Reliable Solutions", desc: "Whether sourcing products or delivering services, we focus on quality, transparency, and dependable execution." },
  { title: "Build Long-Term Relationships", desc: "The strongest relationships are built through trust, consistent performance, and a shared commitment to growth." },
];

const strengths = [
  { icon: "🏭", title: "Manufacturing Foundation", description: "Built upon the manufacturing expertise of Shiveshwar Textiles." },
  { icon: "🎯", title: "Industry Understanding", description: "Solutions developed around the operational realities of each industry." },
  { icon: "🤝", title: "Trusted Network", description: "A growing ecosystem of manufacturers, technology, logistics, and business professionals." },
  { icon: "✓", title: "Quality-Driven Operations", description: "Committed to consistency, reliability, and continuous improvement." },
  { icon: "🌐", title: "Global Perspective", description: "International sourcing, professional services, and global partnerships." },
  { icon: "♾", title: "Long-Term Relationships", description: "Partnerships that continue creating value well beyond individual projects." },
];

export default function IndustriesPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Industries"
        title="Industry Expertise. Global Opportunities."
        description="Every industry has unique challenges, standards, and opportunities. Trivoxa Group combines manufacturing expertise, strategic sourcing, and professional services to deliver solutions tailored to the evolving needs of businesses across international markets."
        actions={[{ label: "Explore Industries", href: "#industries" }, { label: "Request a Quote", modal: true, variant: "ghost" }]}
      />

      <Section
        eyebrow="Our Industries"
        title="Supporting Industries Through Knowledge, Partnership, and Global Solutions."
        lead={
          "At Trivoxa, we believe successful partnerships begin with understanding the industries we serve.\n\n" +
          "Every sector has its own operational requirements, quality standards, and commercial expectations. By combining manufacturing expertise, international trade experience, and professional services, we deliver solutions designed to address industry-specific challenges while creating long-term business value.\n\n" +
          "Whether supporting manufacturers, distributors, retailers, healthcare organizations, or technology-driven businesses, our goal remains the same: helping our partners grow with confidence in an increasingly connected global marketplace."
        }
      />

      <Section id="industries" eyebrow="Industries We Serve" title="Solutions Across Diverse Industries." lead="Trivoxa Group supports a growing portfolio of industries through trusted partnerships, responsible sourcing, and tailored business solutions.">
        <CardGrid cols={4} items={industries} />
      </Section>

      <Section
        eyebrow="Understanding Your Industry"
        title="Every Industry Has Different Challenges. Every Solution Should Be Different."
        lead={
          "No two industries operate in exactly the same way.\n\n" +
          "From regulatory compliance and quality assurance to supply chain reliability, production efficiency, and changing market expectations, every sector presents its own set of opportunities and challenges.\n\n" +
          "At Trivoxa, we begin by understanding these realities before recommending solutions that align with our clients' operational, technical, and commercial objectives."
        }
      />

      <Section eyebrow="Our Capabilities" title="Solutions Designed Around Industry Requirements." lead="Our capabilities extend beyond supplying products or delivering services. We work with businesses to develop practical solutions that support operational efficiency, international growth, and long-term success.">
        <Checklist items={solutions} />
      </Section>

      <Section eyebrow="Our Approach" title="Building Strong Partnerships Across Every Industry." lead="Every successful partnership follows a structured approach built on understanding, collaboration, and long-term commitment.">
        <Steps items={approach} row />
      </Section>

      <Section eyebrow="Why Trivoxa" title="Built on Experience. Driven by Partnership." lead="Businesses choose Trivoxa because we combine practical industry knowledge with a long-term approach to international business.">
        <CardGrid cols={3} items={strengths} />
      </Section>

      <CtaBand
        title="Let's Build Industry Solutions Together."
        description="Whether you're seeking trusted sourcing, professional expertise, or a long-term international business partner, Trivoxa is ready to help your business move forward with confidence."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
