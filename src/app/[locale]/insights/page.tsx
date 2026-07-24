import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, Pills, CtaBand } from "@/components/trivoxa/ui";
import InsightsTeaser from "@/components/insights/InsightsTeaser";
import { PageAccent } from "@/components/visuals/PageAccent";
import "@/app/styles/insights-page.css";

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

/** Planned topics for the teaser (spec §4 — no articles exist yet, so no
 * dead "Read Insight" links; readers vote on what publishes first). */
const upcomingTopics = [
  { title: "Navigating Global Sourcing in a Connected Economy", category: "Market Intelligence", readingTime: "~8 min read", description: "How modern businesses build resilient, cross-border supply chains." },
  { title: "The Future of Textile & Apparel Exports", category: "Industry Insights", readingTime: "~6 min read", description: "Where fabric innovation, quality, and demand are heading next." },
  { title: "Service Exports: Technology as a Growth Engine", category: "Export Guide", readingTime: "~7 min read", description: "Why software, AI, and design are reshaping international trade." },
  { title: "Reading an HS Code: A Buyer's Field Guide", category: "Export Guide", readingTime: "~5 min read", description: "What those digits actually commit you to — duties, documentation, and compliance." },
  { title: "Mundra vs Nhava Sheva: Choosing Your Export Corridor", category: "Market Intelligence", readingTime: "~6 min read", description: "How port choice shapes lead time, cost, and risk for India-origin cargo." },
  { title: "Pharma Exports and Destination-Country Licensing", category: "Industry Insights", readingTime: "~9 min read", description: "The regulatory landscape a first-time pharmaceutical importer should map early." },
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
        accent={<PageAccent variant="paper-layers" seed="insights" />}
        grain
      />

      <Section eyebrow="Categories" title="Knowledge Across Global Trade." lead="Three focused streams of thinking, built to help partners make confident decisions.">
        <Pills items={categories.map((category) => category.title)} />
      </Section>

      <Section
        id="featured"
        eyebrow="In the Works"
        title="Vote on What We Publish First."
        lead="The first wave of insights is being written now. Pick the topics you want, leave your email, and the reading list — plus your votes — go straight to the team."
      >
        <InsightsTeaser topics={upcomingTopics} />
      </Section>

      <CtaBand
        title="Turn Insight Into Opportunity."
        description="Have a market, product, or service in mind? Our team is ready to help you move from perspective to partnership."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
