import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Careers | Trivoxa Group",
  description:
    "Build a long-term career at Trivoxa Group — a culture driven by curiosity, integrity, innovation, and continuous growth.",
};

const values = [
  { icon: "🚀", title: "Curiosity", description: "We ask better questions and stay hungry to learn across every market we enter." },
  { icon: "🤝", title: "Integrity", description: "We do the right thing — with partners, customers, and each other." },
  { icon: "✦", title: "Innovation", description: "We embrace new ideas, technology, and continuous improvement." },
  { icon: "🌱", title: "Continuous Growth", description: "We invest in people who want to build something larger than themselves." },
];

const areas = [
  { icon: "🌐", title: "Global Trade & Sourcing", description: "Coordinate product exports, supplier relationships, and international logistics." },
  { icon: "💻", title: "Technology & Services", description: "Software, AI, design, and digital delivery for our service export division." },
  { icon: "📈", title: "Business & Partnerships", description: "Growth, client relationships, and long-term partnership development." },
];

export default function CareersPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Careers"
        title="Build What's Next With Us."
        description={
          "Every great organization is built by people who believe in creating something larger than themselves.\n\n" +
          "At Trivoxa, we're building a culture driven by curiosity, integrity, innovation, and continuous growth — where ambitious people come together to create meaningful impact across global industries."
        }
        actions={[{ label: "Explore Opportunities", href: "#areas" }, { label: "Get in Touch", href: "/contact/", variant: "ghost" }]}
      />

      <Section eyebrow="Our Culture" title="A Culture Built for Ambitious People." lead="We combine the discipline of a manufacturing heritage with the energy of a growing international business — a place to do meaningful, lasting work.">
        <CardGrid cols={4} items={values} />
      </Section>

      <Section id="areas" eyebrow="Where You Fit" title="Areas We're Growing." lead="As Trivoxa expands across industries and markets, we're building teams across trade, technology, and partnerships.">
        <CardGrid cols={3} items={areas} />
      </Section>

      <CtaBand
        title="Grow With a Company Built to Endure."
        description="We're always interested in talented people who share our values. Introduce yourself and tell us how you'd like to contribute."
        actions={[{ label: "Get in Touch", href: "/contact/" }, { label: "Learn About the Group", href: "/group/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
