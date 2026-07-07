import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, Steps, Checklist, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Global Presence | Trivoxa Group",
  description:
    "Trivoxa Group connects opportunities across borders through an expanding network of suppliers, partners, and clients.",
};

const regions = [
  { icon: "🇪🇺", title: "Europe", description: "Textiles, building materials, and professional services for established and emerging European markets." },
  { icon: "🕌", title: "Middle East", description: "Building materials, agriculture, and consumer goods for fast-growing Gulf and regional markets." },
  { icon: "🌍", title: "Africa", description: "Agriculture, pharmaceuticals, and industrial products supporting infrastructure and development." },
  { icon: "🗽", title: "North America", description: "Textiles, home goods, and technology services for demanding, quality-focused buyers." },
  { icon: "🌎", title: "South America", description: "Sourcing partnerships and consumer goods for expanding regional supply chains." },
  { icon: "🌏", title: "Asia-Pacific", description: "Manufacturing collaboration, technology services, and cross-border trade across APAC." },
];

const ecosystem = [
  { title: "Manufacturing Partners", desc: "Trusted producers anchored by Shiveshwar Textiles." },
  { title: "Product Export Division", desc: "Physical goods sourced and delivered worldwide." },
  { title: "Service Export Division", desc: "Technology, design, and professional teams." },
  { title: "Logistics Partners", desc: "Coordinated export, documentation, and delivery." },
  { title: "Global Buyers", desc: "Organizations we serve across international markets." },
  { title: "Long-Term Partnerships", desc: "Relationships built to endure and expand." },
];

const operations = [
  "Global Sourcing",
  "Export Coordination",
  "Documentation",
  "Quality Assurance",
  "Supply Chain Management",
  "International Communication",
];

const growth = [
  "Expanding Partnerships",
  "Emerging Markets",
  "New Industries",
  "Global Collaboration",
  "Long-Term Growth",
];

const why = [
  { icon: "🌐", title: "Global Business Perspective", description: "An international outlook shaping every solution we deliver." },
  { icon: "🏭", title: "Manufacturing Heritage", description: "Real production knowledge from our parent company." },
  { icon: "🤝", title: "Trusted Partner Network", description: "A growing ecosystem of vetted partners worldwide." },
  { icon: "🧭", title: "Cross-Border Expertise", description: "Experience navigating international trade and compliance." },
  { icon: "💬", title: "Professional Communication", description: "Clear, reliable coordination across time zones." },
  { icon: "♾", title: "Long-Term Relationships", description: "Partnerships designed to grow across markets and years." },
];

export default function GlobalPresencePage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Global Presence"
        title="Connecting Opportunities Across Borders."
        description="International business is built on trust, collaboration, and strong relationships. Through an expanding network of suppliers, partners, and clients, Trivoxa Group is building meaningful connections that enable organizations to grow confidently across international markets."
        actions={[{ label: "Start a Conversation", href: "/contact/" }, { label: "Request a Quote", modal: true, variant: "ghost" }]}
      />

      <Section
        eyebrow="Our Global Approach"
        title="One Vision. Connected Across Markets."
        lead={
          "Our global approach is built on a simple belief: meaningful business grows through cross-border collaboration and long-term relationships.\n\n" +
          "We connect markets, simplify international trade, and bring together manufacturers, professionals, and buyers into a single, dependable network — guided by an international business philosophy focused on trust and shared success."
        }
      />

      <Section eyebrow="Regions We Serve" title="Building Presence Across Six Global Regions." lead="Rather than counting borders, we focus on building durable relationships across the regions where our partners operate and grow.">
        <CardGrid cols={3} items={regions} />
      </Section>

      <Section eyebrow="Our Ecosystem" title="How Trivoxa Connects the World." lead="From manufacturing partners to global buyers, our ecosystem turns complex international trade into seamless business relationships.">
        <Steps items={ecosystem} row />
      </Section>

      <Section eyebrow="Trade & Operations" title="Managing International Business, End to End." lead="We coordinate the practical realities of global trade so our partners can focus on growth.">
        <Checklist items={operations} />
      </Section>

      <Section eyebrow="Growing Across Borders" title="Clear Ambition, Built Responsibly." lead="Instead of overstating reach, we focus on the growth that creates real, lasting value.">
        <Checklist items={growth} />
      </Section>

      <Section eyebrow="Why Trivoxa" title="Why Global Businesses Choose Trivoxa.">
        <CardGrid cols={3} items={why} />
      </Section>

      <CtaBand
        title="Let's Connect Across Borders."
        description="Wherever your business is headed, Trivoxa Group is ready to help you source, expand, and build lasting partnerships across international markets."
        actions={[{ label: "Start a Conversation", href: "/contact/" }, { label: "Request a Quote", modal: true, variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
