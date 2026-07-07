import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, Checklist, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Textile & Apparel | Trivoxa Group",
  description:
    "Fabrics, home textiles, and apparel accessories sourced through trusted manufacturing partners, anchored by Shiveshwar Textiles.",
};

const categories = [
  { icon: "🧵", title: "Fabrics", description: "Polyester, cotton, blended, dyed, and finished fabrics for every application.", href: "/businesses/fabrics/", cta: "Explore Fabrics" },
  { icon: "🏠", title: "Home Textiles", description: "Bed linen, towels, curtains, cushions, rugs, and upholstery.", href: "/businesses/textile-apparel/", cta: "Explore" },
  { icon: "🧷", title: "Textile & Apparel Accessories", description: "Elastics, zippers, buttons, labels, trims, and sewing materials.", href: "/businesses/textile-apparel-accessories/", cta: "Explore Accessories" },
];

const capabilities = [
  "Woven textile production expertise (Shiveshwar Textiles)",
  "Greige, dyed, printed, and finished fabric supply",
  "Custom sourcing for brands and wholesalers",
  "Quality-focused coordination and inspection",
  "Complete export documentation and logistics",
];

const applications = [
  "Apparel & Fashion Brands",
  "Home & Interior Retailers",
  "Wholesalers & Distributors",
  "Sourcing & Buying Houses",
  "Hospitality & Institutional",
];

export default function TextileApparelPage() {
  return (
    <TrivoxaShell>
      <PageHero
        crumb={[{ label: "Businesses", href: "/businesses/" }, { label: "Product Exports", href: "/businesses/product-exports/" }, { label: "Textile & Apparel" }]}
        eyebrow="Textile & Apparel"
        title="Textiles, Rooted in Manufacturing Heritage."
        description="Supporting manufacturers, brands, wholesalers, and sourcing companies with fabrics, home textiles, apparel accessories, and customized sourcing solutions — built on the woven-textile expertise of Shiveshwar Textiles."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Explore Fabrics", href: "/businesses/fabrics/", variant: "ghost" }]}
      />

      <Section
        eyebrow="Industry Overview"
        title="From Fibre to Finished Product."
        lead={
          "Textile & Apparel is where Trivoxa's story begins. Our parent company, Shiveshwar Textiles, brings deep expertise in woven textile production and quality-focused operations.\n\n" +
          "Today we extend that heritage into a full sourcing capability — connecting global buyers with fabrics, home textiles, and apparel accessories through a trusted partner network."
        }
      />

      <Section eyebrow="Product Categories" title="Three Core Categories.">
        <CardGrid cols={3} items={categories} />
      </Section>

      <Section eyebrow="Manufacturing Capabilities" title="Built on Real Production Knowledge.">
        <Checklist items={capabilities} />
      </Section>

      <Section eyebrow="Applications" title="Who We Support." lead="Our textile sourcing serves partners across the apparel and interior value chain.">
        <div className="tvx-pills" style={{ marginTop: 30 }}>
          {applications.map((a) => (
            <span key={a} className="tvx-pill">{a}</span>
          ))}
        </div>
      </Section>

      <CtaBand
        title="Let's Build Your Textile Supply Chain."
        description="Whether you need greige fabric, finished textiles, or apparel accessories, our team is ready to source with confidence."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
