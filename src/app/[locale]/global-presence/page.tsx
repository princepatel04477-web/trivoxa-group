import type { Metadata } from "next";
import "@/app/styles/global-presence-page.css";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, Checklist, CtaBand } from "@/components/trivoxa/ui";
import GlobalPresenceMap from "@/components/presence/GlobalPresenceMap";
import PresenceStats from "@/components/presence/PresenceStats";
import LazyCrane from "@/components/LazyCrane";

export const metadata: Metadata = {
  title: "Global Presence | Trivoxa Group",
  description:
    "Trivoxa Group connects opportunities across borders through an expanding network of suppliers, partners, and clients.",
};

const regions = [
  { icon: "🇪🇺", title: "Europe", description: "Textiles, building materials, and professional services for established and emerging European markets.", categories: ["Textiles", "Building Materials", "Professional Services"] },
  { icon: "🕌", title: "Middle East", description: "Building materials, agriculture, and consumer goods for fast-growing Gulf and regional markets.", categories: ["Building Materials", "Agriculture", "Consumer Goods"] },
  { icon: "🌍", title: "Africa", description: "Agriculture, pharmaceuticals, and industrial products supporting infrastructure and development.", categories: ["Agriculture", "Pharmaceuticals", "Industrial Products"] },
  { icon: "🗽", title: "North America", description: "Textiles, home goods, and technology services for demanding, quality-focused buyers.", categories: ["Textiles", "Home Goods", "Technology Services"] },
  { icon: "🌎", title: "South America", description: "Sourcing partnerships and consumer goods for expanding regional supply chains.", categories: ["Sourcing Partnerships", "Consumer Goods"] },
  { icon: "🌏", title: "Asia-Pacific", description: "Manufacturing collaboration, technology services, and cross-border trade across APAC.", categories: ["Manufacturing Collaboration", "Technology Services", "Cross-Border Trade"] },
];

// Export ports — Layer 2 (commerce/logistics data, honestly placed on the
// logistics page rather than the homepage). UN/LOCODEs are the standard
// public codes for these ports, not invented; the descriptors are public
// knowledge about each port's role in Indian trade.
const exportPorts = [
  {
    name: "Mundra",
    code: "INMUN",
    role: "India's largest commercial port by cargo volume",
    detail: "All-weather, deep-draft port on the Gulf of Kutch — the workhorse for containerized and bulk export cargo out of Gujarat.",
  },
  {
    name: "Kandla",
    code: "INKLA",
    role: "Major gateway for dry and liquid bulk",
    detail: "Deendayal Port anchors agri-commodity and bulk exports — a natural fit for spices, grains, and castor shipments.",
  },
  {
    name: "Nhava Sheva (JNPT)",
    code: "INNSA",
    role: "India's largest container port",
    detail: "Handles roughly half of India's containerized trade — the default corridor for European and American consignments.",
  },
];

/** Honest presence numbers derived from what the site actually publishes. */
const presenceStats = [
  { value: 6, label: "Regions served" },
  { value: 8, label: "Industries covered" },
  { value: 3, label: "Export ports" },
  { value: 24, suffix: "h", label: "Response window (IST)" },
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
        <GlobalPresenceMap regions={regions.map((r) => ({ title: r.title, categories: r.categories }))} />
        <div className="tvx-lanes">
          {regions.map((r) => (
            <div className="tvx-lane" key={r.title}>
              <span className="tvx-lane__name">{r.title}</span>
              <span className="tvx-lane__desc">{r.description}</span>
            </div>
          ))}
        </div>
      </Section>

      {/* Presence in numbers — animated counters (spec §3/§4) */}
      <Section eyebrow="Presence in Numbers" title="The Network, Measured Honestly.">
        <PresenceStats stats={presenceStats} />
      </Section>

      <Section eyebrow="Export Ports" title="Where Shipments Leave From." lead="Every shipment is coordinated through established Indian export ports, regardless of destination.">
        <div className="presence-crane" aria-hidden="true">
          <LazyCrane variant="subtle" />
        </div>
        <div className="presence-ports presence-ports--cards">
          {exportPorts.map((p) => (
            <div className="presence-port presence-port--card" key={p.code}>
              <div className="presence-port__head">
                <span className="presence-port__name">{p.name}</span>
                <span className="presence-port__code">{p.code}</span>
              </div>
              <span className="presence-port__role">{p.role}</span>
              <p className="presence-port__detail">{p.detail}</p>
            </div>
          ))}
        </div>
      </Section>

      <Section eyebrow="Our Ecosystem" title="How Trivoxa Connects the World." lead="From manufacturing partners to global buyers, our ecosystem turns complex international trade into seamless business relationships.">
        <div className="tvx-strip">
          {ecosystem.flatMap((e, i) => {
            const nodes = [
              <div className="tvx-strip__item" key={`item-${e.title}`}>
                <span className="tvx-strip__label">{e.title}</span>
                <p className="tvx-strip__desc">{e.desc}</p>
              </div>,
            ];
            if (i < ecosystem.length - 1) {
              nodes.push(
                <span className="tvx-strip__sep" aria-hidden="true" key={`sep-${e.title}`}>
                  &middot;
                </span>
              );
            }
            return nodes;
          })}
        </div>
      </Section>

      <Section eyebrow="Trade & Operations" title="Managing International Business, End to End." lead="We coordinate the practical realities of global trade so our partners can focus on growth.">
        <Checklist items={operations} />
      </Section>

      <Section eyebrow="Growing Across Borders" title="Clear Ambition, Built Responsibly." lead="Instead of overstating reach, we focus on the growth that creates real, lasting value.">
        <Checklist items={growth} />
      </Section>

      <Section eyebrow="Why Trivoxa" title="Why Global Businesses Choose Trivoxa.">
        <div className="tvx-statements">
          {why.map((w) => (
            <div className="tvx-statement" key={w.title}>
              <span className="tvx-statement__rule" aria-hidden="true" />
              <h3 className="tvx-statement__title">{w.title}</h3>
              <p className="tvx-statement__desc">{w.description}</p>
            </div>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Let's Connect Across Borders."
        description="Wherever your business is headed, Trivoxa Group is ready to help you source, expand, and build lasting partnerships across international markets."
        actions={[{ label: "Start a Conversation", href: "/contact/" }, { label: "Request a Quote", modal: true, variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
