import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, Pills, Checklist, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Textile & Apparel Accessories | Trivoxa Group",
  description: "Elastics, trims, labels, fastenings, and sewing materials for apparel and textile manufacturing.",
};

const groups = [
  {
    label: "Elastic Solutions",
    items: ["Elastic Tapes", "Waistband Elastic", "Bra Strap Elastic", "Knitted Elastic", "Woven Elastic", "Fold-Over Elastic", "Jacquard Elastic", "Printed Elastic"],
  },
  { label: "Trims & Tapes", items: ["Drawcords", "Ribbons", "Tapes"] },
  { label: "Labels & Branding", items: ["Woven Labels", "Printed Labels", "Brand Labels"] },
  { label: "Fastening Solutions", items: ["Zippers", "Buttons", "Hook & Eye Fasteners"] },
  { label: "Sewing Materials", items: ["Sewing Threads", "Interlinings", "Laces"] },
];

const quality = [
  "Specification-driven, consistent supply",
  "Trusted accessory manufacturing partners",
  "Custom branding and label programs",
  "Export documentation and logistics",
];

export default function AccessoriesPage() {
  return (
    <TrivoxaShell>
      <PageHero
        crumb={[
          { label: "Businesses", href: "/businesses/" },
          { label: "Textile & Apparel", href: "/businesses/textile-apparel/" },
          { label: "Accessories" },
        ]}
        eyebrow="Textile & Apparel Accessories"
        title="Every Detail That Finishes a Garment."
        description="From elastics and trims to labels, fastenings, and sewing materials — we supply the accessories that complete apparel and textile production."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Back to Textile & Apparel", href: "/businesses/textile-apparel/", variant: "ghost" }]}
      />

      <Section
        eyebrow="Category Overview"
        title="A Complete Accessories Portfolio."
        lead="Accessories are small components with a big impact on quality and brand. We coordinate a wide range of elastics, trims, labels, and fastenings to match your product and standards."
      />

      <Section eyebrow="Product Portfolio" title="Accessories We Supply.">
        {groups.map((g) => (
          <div key={g.label} className="tvx-group">
            <div className="tvx-group__label">{g.label}</div>
            <Pills items={g.items} />
          </div>
        ))}
      </Section>

      <Section eyebrow="Quality Standards" title="Consistency in Every Component.">
        <Checklist items={quality} />
      </Section>

      <CtaBand
        title="Source Accessories With Confidence."
        description="Share your accessory requirements and specifications — we'll coordinate dependable supply."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Explore Fabrics", href: "/businesses/fabrics/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
