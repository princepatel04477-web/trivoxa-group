import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, Pills, Checklist, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Fabrics | Trivoxa Group",
  description: "Polyester greige, dyed, finished, cotton, and blended fabrics sourced through trusted manufacturing partners.",
};

const portfolio = [
  "Polyester Greige Fabric",
  "Dyed Fabric",
  "Finished Fabric",
  "Cotton Fabric",
  "Blended Fabric",
  "Linen Fabric",
  "Rayon & Viscose",
  "Denim Fabric",
  "Knitted Fabric",
  "Printed Fabric",
];

const applications = [
  "Apparel & garment manufacturing",
  "Home textiles and furnishings",
  "Industrial and technical uses",
  "Private-label and brand programs",
];

const quality = [
  "Consistent, specification-driven supply",
  "Greige to finished fabric coordination",
  "Trusted, vetted manufacturing partners",
  "Export documentation and logistics",
];

export default function FabricsPage() {
  return (
    <TrivoxaShell>
      <PageHero
        crumb={[
          { label: "Businesses", href: "/businesses/" },
          { label: "Textile & Apparel", href: "/businesses/textile-apparel/" },
          { label: "Fabrics" },
        ]}
        eyebrow="Fabrics"
        title="Quality Fabrics, Sourced With Confidence."
        description="From polyester greige to finished fabric, we supply a broad range of woven and knitted textiles built on genuine manufacturing expertise."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Back to Textile & Apparel", href: "/businesses/textile-apparel/", variant: "ghost" }]}
      />

      <Section
        eyebrow="Category Overview"
        title="A Complete Fabric Portfolio."
        lead="Fabrics are the foundation of our textile capability. We coordinate supply from greige through dyeing and finishing, matched to your specifications and quality standards."
      />

      <Section eyebrow="Product Portfolio" title="Fabrics We Supply.">
        <Pills items={portfolio} />
      </Section>

      <Section eyebrow="Applications" title="Where These Fabrics Are Used.">
        <Checklist items={applications} />
      </Section>

      <Section eyebrow="Manufacturing & Quality" title="Consistency You Can Depend On.">
        <Checklist items={quality} />
      </Section>

      <CtaBand
        title="Request Fabric Specifications & Pricing."
        description="Tell us the construction, GSM, and finish you need — we'll coordinate the right supply."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Explore Accessories", href: "/businesses/textile-apparel-accessories/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
