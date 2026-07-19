import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, Pills, CtaBand } from "@/components/trivoxa/ui";
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

const featured = [
  { icon: "🌍", title: "Navigating Global Sourcing in a Connected Economy", description: "How modern businesses build resilient, cross-border supply chains.", cta: "Read Insight", category: "Market Intelligence" },
  { icon: "🧵", title: "The Future of Textile & Apparel Exports", description: "Where fabric innovation, quality, and demand are heading next.", cta: "Read Insight", category: "Industry Insights" },
  { icon: "🤖", title: "Service Exports: Technology as a Growth Engine", description: "Why software, AI, and design are reshaping international trade.", cta: "Read Insight", category: "Export Guide" },
];

const [primaryFeature, ...secondaryFeatures] = featured;

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
        <Pills items={categories.map((category) => category.title)} />
      </Section>

      <Section id="featured" eyebrow="Featured" title="Latest Perspectives." lead="A closer look at the trends shaping international sourcing and services.">
        <div className="insights-magazine">
          <article className="insights-magazine__primary">
            <div className="insights-magazine__image" aria-hidden="true">
              <span className="insights-magazine__image-icon">{primaryFeature.icon}</span>
            </div>
            <span className="insights-magazine__tag">{primaryFeature.category}</span>
            <h3 className="insights-magazine__headline">{primaryFeature.title}</h3>
            <p className="insights-magazine__desc">{primaryFeature.description}</p>
            <span className="insights-magazine__cta">{primaryFeature.cta}</span>
          </article>

          <div className="insights-magazine__secondary">
            {secondaryFeatures.map((item) => (
              <article key={item.title} className="insights-magazine__item">
                <span className="insights-magazine__tag">{item.category}</span>
                <h3 className="insights-magazine__item-title">{item.title}</h3>
                <p className="insights-magazine__item-desc">{item.description}</p>
                <span className="insights-magazine__cta insights-magazine__cta--sm">{item.cta}</span>
              </article>
            ))}
          </div>
        </div>

      </Section>

      <CtaBand
        title="Turn Insight Into Opportunity."
        description="Have a market, product, or service in mind? Our team is ready to help you move from perspective to partnership."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
