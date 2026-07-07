import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Insights | Trivoxa Group",
  description:
    "Perspectives on global trade, sourcing strategies, emerging industries, and market intelligence from Trivoxa Group.",
};

const categories = [
  { icon: "📘", title: "Export Guide", description: "Practical guidance on international trade, documentation, and dependable sourcing." },
  { icon: "📊", title: "Market Intelligence", description: "Trends and analysis across the industries and regions we serve." },
  { icon: "🔎", title: "Industry Insights", description: "Sector-specific perspectives on challenges, standards, and opportunities." },
];

const featured = [
  { icon: "🌍", title: "Navigating Global Sourcing in a Connected Economy", description: "How modern businesses build resilient, cross-border supply chains.", cta: "Read Insight" },
  { icon: "🧵", title: "The Future of Textile & Apparel Exports", description: "Where fabric innovation, quality, and demand are heading next.", cta: "Read Insight" },
  { icon: "🤖", title: "Service Exports: Technology as a Growth Engine", description: "Why software, AI, and design are reshaping international trade.", cta: "Read Insight" },
];

export default function InsightsPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Insights"
        title="Perspectives That Drive Global Business."
        description={
          "Markets evolve. Industries transform. New opportunities emerge every day.\n\n" +
          "Our insights explore global trade, sourcing strategies, emerging industries, market intelligence, and business innovation to help organizations make informed decisions."
        }
        actions={[{ label: "Explore Insights", href: "#featured" }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />

      <Section eyebrow="Categories" title="Knowledge Across Global Trade." lead="Three focused streams of thinking, built to help partners make confident decisions.">
        <CardGrid cols={3} items={categories} />
      </Section>

      <Section id="featured" eyebrow="Featured" title="Latest Perspectives." lead="A closer look at the trends shaping international sourcing and services.">
        <CardGrid cols={3} items={featured} />
      </Section>

      <CtaBand
        title="Turn Insight Into Opportunity."
        description="Have a market, product, or service in mind? Our team is ready to help you move from perspective to partnership."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
