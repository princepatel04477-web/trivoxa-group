import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CtaBand } from "@/components/trivoxa/ui";
import CategoryTable from "@/components/industries/CategoryTable";
import { exportCategories, getExportCategory } from "@/lib/data/product-categories";
import { getIndustryBySlug } from "@/lib/data/industries";
import "@/app/styles/patterns.css";

/** Category pages for every product-export division EXCEPT textile-apparel,
 * which has its own richer static route (and sub-category children). */
const dynamicCategories = exportCategories.filter((c) => c.slug !== "textile-apparel");

export function generateStaticParams() {
  return dynamicCategories.map((c) => ({ category: c.slug }));
}

export async function generateMetadata(props: PageProps<"/businesses/product-exports/[category]">): Promise<Metadata> {
  const { category } = await props.params;
  const cat = getExportCategory(category);
  if (!cat) return {};
  return {
    title: `${cat.name} | Trivoxa Group`,
    description: cat.description,
  };
}

export default async function ExportCategoryPage(props: PageProps<"/businesses/product-exports/[category]">) {
  const { category } = await props.params;
  const cat = getExportCategory(category);
  if (!cat || cat.slug === "textile-apparel") notFound();

  // Categories share slugs with industries where both exist — reuse the
  // industry's RFQ trade table when it has rows.
  const industry = getIndustryBySlug(cat.slug);

  return (
    <TrivoxaShell>
      <PageHero
        crumb={[
          { label: "Businesses", href: "/businesses/" },
          { label: "Product Exports", href: "/businesses/product-exports/" },
          { label: cat.name },
        ]}
        eyebrow={cat.name}
        title={`${cat.name} Exports.`}
        description={cat.description}
        actions={[
          { label: "Request a Quote", href: industry ? `/rfq/?category=${industry.slug}` : "/rfq/" },
          { label: "Contact Our Team", href: "/contact/", variant: "ghost" },
        ]}
      />

      {industry && industry.categories.length > 0 && (
        <Section eyebrow="Product Portfolio" title="What We Export" lead="Every category is quoted against real HS codes, minimum order quantities, and lead times. Click any row for the full specification.">
          <CategoryTable categories={industry.categories} />
        </Section>
      )}

      {industry ? (
        <Section eyebrow="Industry Context" title={`How We Serve ${cat.name}`}>
          <Link href={`/industries/${industry.slug}/`} className="tvx-btn tvx-btn--ghost">
            Explore the {industry.name} Industry →
          </Link>
        </Section>
      ) : (
        <Section
          eyebrow="Portfolio"
          title="Detailed Portfolio in Progress."
          lead="The product portfolio for this category is being finalized with our manufacturing partners. Share your requirement and our sourcing team will respond with availability, specifications, and pricing."
        />
      )}

      <CtaBand
        title={`Ready to source ${cat.name}?`}
        description="Send us your RFQ and our sourcing team responds within 24 business hours (IST)."
        actions={[{ label: "Send Us Your RFQ →", href: industry ? `/rfq/?category=${industry.slug}` : "/rfq/" }]}
        eagle={false}
      />
    </TrivoxaShell>
  );
}
