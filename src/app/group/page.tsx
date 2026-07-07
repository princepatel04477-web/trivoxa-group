import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, Checklist, CtaBand, Split } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Group | Trivoxa Group",
  description:
    "Trivoxa Group is an international business group built on the manufacturing foundation of Shiveshwar Textiles.",
};

const principles = [
  { icon: "◇", title: "Vision", description: "We think beyond today's opportunities and build for tomorrow." },
  { icon: "◈", title: "Integrity", description: "Trust is earned through honesty, transparency, and consistency." },
  { icon: "◆", title: "Excellence", description: "We pursue the highest standards in everything we deliver." },
  { icon: "✦", title: "Innovation", description: "We embrace new ideas, technology, and continuous improvement." },
  { icon: "❖", title: "Partnership", description: "We believe sustainable success is created together." },
  { icon: "✧", title: "Impact", description: "We measure success by the lasting value we create for partners, communities, and future generations." },
];

const ecosystem = [
  { title: "Product Export Division", description: "Sourcing and delivering quality products through trusted manufacturing partners." },
  { title: "Service Export Division", description: "Technology, design, and professional services delivered by skilled teams." },
  { title: "Manufacturing Network", description: "Anchored by Shiveshwar Textiles and a growing partner base." },
  { title: "Technology Partners", description: "Specialists enabling digital transformation and automation." },
  { title: "Logistics Partners", description: "Coordinated export, documentation, and supply-chain delivery." },
  { title: "Global Client Network", description: "Buyers and organizations we serve across international markets." },
];

const commitments = [
  "Ethical Business Practices",
  "Responsible Sourcing",
  "Quality Without Compromise",
  "Transparent Communication",
  "Long-Term Partnerships",
  "Sustainable Business Growth",
  "Continuous Innovation",
];

export default function GroupPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="The Group"
        title="Building an Organization Designed to Endure."
        description="Trivoxa Group is an international business group built on a strong manufacturing foundation and driven by a global vision. Through trusted partnerships, strategic sourcing, and professional services, we connect businesses with opportunities while creating lasting value across international markets."
        actions={[{ label: "Discover Our Story", href: "#our-story" }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />

      <Section
        eyebrow="Who We Are"
        title="A Global Business Group Built on Trust, Purpose, and Long-Term Vision."
        lead={
          "Trivoxa Group is an international business group committed to connecting global businesses with trusted products, strategic sourcing solutions, and professional services.\n\n" +
          "Built upon the manufacturing expertise of our parent company, Shiveshwar Textiles, we combine industry knowledge with a forward-looking approach to international business. By bringing together trusted manufacturers, skilled professionals, and global partners, we help organizations build stronger supply chains, access new opportunities, and achieve sustainable growth.\n\n" +
          "At Trivoxa, we believe meaningful business is built on trust, quality, and relationships that last far beyond a single transaction."
        }
      />

      <Section eyebrow="Our Foundation" title="Built on Manufacturing Excellence. Inspired by Global Opportunity.">
        <div style={{ marginTop: 40 }}>
          <Split>
            <div className="tvx-lead" style={{ marginTop: 0 }}>
              <p>Every great organization is built on a strong foundation.</p>
              <p>Trivoxa Group was established as the international business arm of Shiveshwar Textiles, a manufacturing company with extensive expertise in woven textile production and quality-focused operations.</p>
              <p>This manufacturing heritage provides us with practical industry knowledge, a deep understanding of production processes, and a commitment to delivering reliable solutions to global markets.</p>
              <p>While Trivoxa continues to expand into new industries and business services, our foundation remains rooted in the principles that have guided us from the beginning — quality, reliability, integrity, and long-term partnerships.</p>
            </div>
          </Split>
        </div>
      </Section>

      <Section
        id="our-story"
        eyebrow="Our Story"
        title="Creating Opportunities Beyond Borders."
        lead={
          "Trivoxa was founded with a vision to bridge the gap between global demand and India's extraordinary capabilities.\n\n" +
          "We recognized that businesses around the world needed more than products — they needed a trusted partner capable of understanding their requirements, connecting them with reliable manufacturing, and supporting them throughout every stage of international trade.\n\n" +
          "Guided by this purpose, Trivoxa was created to build long-term relationships that extend beyond commerce and contribute to sustainable business growth for partners across the world."
        }
      />

      <Section
        eyebrow="Our Vision"
        title="Building the Future of Global Commerce."
        lead={
          "To become one of the world's most trusted international business groups by creating lasting value through global trade, innovation, and enduring partnerships.\n\n" +
          "Our vision is to build an organization that continues creating opportunities across industries and international markets for generations to come."
        }
      />

      <Section eyebrow="Our Philosophy" title="The Trivoxa Way" lead="Every decision we make is guided by principles that define who we are and how we build relationships.">
        <CardGrid cols={3} items={principles} />
      </Section>

      <Section
        eyebrow="Leadership"
        title="Leading with Purpose. Building with Vision."
        lead={
          "Leadership at Trivoxa is driven by a commitment to long-term thinking, responsible decision-making, and continuous improvement.\n\n" +
          "Our responsibility extends beyond business growth. We are building an organization founded on trust, guided by integrity, and dedicated to creating meaningful value for our customers, partners, and communities.\n\n" +
          "As Trivoxa grows, our leadership will continue to uphold the principles that define our organization while embracing innovation and new opportunities across global markets."
        }
      />

      <Section eyebrow="Our Ecosystem" title="One Connected Network. Endless Opportunities." lead="Trivoxa Group brings together manufacturing expertise, strategic sourcing, technology, logistics, and professional services within one integrated business ecosystem.">
        <CardGrid cols={3} items={ecosystem} />
      </Section>

      <Section
        eyebrow="Strategic Partners"
        title="Growing Through Trusted Partnerships."
        lead={
          "Strong partnerships are the foundation of sustainable business.\n\n" +
          "As the parent company of Trivoxa Group, Shiveshwar Textiles provides the manufacturing expertise and industry experience that support our commitment to quality and reliability.\n\n" +
          "Alongside our parent company, we continue building relationships with trusted manufacturers, logistics providers, technology partners, and industry specialists who share our values. Together, we are creating a global network designed to deliver long-term value across industries and international markets."
        }
      />

      <Section eyebrow="Our Commitments" title="Our Commitment to Every Relationship." lead="Every partnership begins with trust and is strengthened through consistent action. We are committed to conducting business responsibly, delivering reliable solutions, and continuously improving the way we serve our partners around the world.">
        <Checklist items={commitments} />
      </Section>

      <Section
        eyebrow="Looking Ahead"
        title="Building for the Next Generation of Global Business."
        lead={
          "Our journey is only beginning.\n\n" +
          "As we look ahead, Trivoxa will continue expanding into new industries, strengthening international partnerships, embracing emerging technologies, and developing innovative solutions that create lasting value.\n\n" +
          "Our ambition is not simply to grow as a business, but to build an organization that future generations will be proud to lead and global partners will continue to trust."
        }
      />

      <CtaBand
        title="Let's Build the Future Together."
        description="Whether you're looking to source products, expand into international markets, or establish a long-term business partnership, our team is ready to help you move forward with confidence."
        actions={[{ label: "Partner With Us", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
