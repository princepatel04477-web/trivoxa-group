/** Industry taxonomy — the eight industries from the master content doc
 * (§5.3 "Industries We Serve"), copy verbatim. `categories` feeds the RFQ
 * form/API (name + hsCode); logistics fields on carried-over categories
 * predate the master doc and remain until real trade data replaces them. */

export interface ProductCategory {
  name: string;
  hsCode: string;
  moq: string;
  incoterms: ("FOB" | "CIF" | "EXW" | "DDP")[];
  leadTime: string;
  packaging: string;
  specSheetUrl?: string;
}

export interface Industry {
  slug: string;
  name: string;
  /** Verbatim card copy from master doc §5.3. */
  description: string;
  image: string;
  /** Slug into /businesses/product-exports/[category] when this industry
   * maps to a product-export category. */
  productCategorySlug?: string;
  /** Where "What We Offer" routes when the industry is service-led. */
  serviceHref?: string;
  categories: ProductCategory[];
}

export const industries: Industry[] = [
  {
    slug: "textile-apparel",
    name: "Textile & Apparel",
    description:
      "Supporting manufacturers, brands, wholesalers, and sourcing companies with fabrics, home textiles, apparel accessories, and customized sourcing solutions.",
    image: "/images/industries/textile-editorial.png",
    productCategorySlug: "textile-apparel",
    categories: [
      { name: "Cotton Yarn", hsCode: "5205.11", moq: "5 MT", incoterms: ["FOB", "CIF"], leadTime: "15–20 days", packaging: "50kg cones on pallets" },
      { name: "Cotton & Denim Fabric", hsCode: "5209.42", moq: "3,000 m", incoterms: ["FOB", "CIF", "EXW"], leadTime: "20–25 days", packaging: "Rolls, poly-wrapped, 40ft container" },
      { name: "Home Textiles", hsCode: "6302.60", moq: "2,000 pcs", incoterms: ["FOB", "CIF", "DDP"], leadTime: "25–30 days", packaging: "Poly bags, export cartons" },
      { name: "Readymade Apparel", hsCode: "6109.10", moq: "1,000 pcs/style", incoterms: ["FOB", "DDP"], leadTime: "30–40 days", packaging: "Individually bagged, carton export pack" },
      { name: "Technical & Non-Woven Textiles", hsCode: "5603.94", moq: "2 MT", incoterms: ["FOB", "CIF"], leadTime: "20–25 days", packaging: "Rolls on pallets" },
    ],
  },
  {
    slug: "healthcare-pharmaceuticals",
    name: "Healthcare & Pharmaceuticals",
    description:
      "Providing access to trusted pharmaceutical products and healthcare solutions through responsible sourcing and quality-focused manufacturing partnerships.",
    image: "/images/industries/healthcare-editorial.png",
    productCategorySlug: "healthcare-pharmaceuticals",
    categories: [
      { name: "Generic Formulations", hsCode: "3004.90", moq: "10,000 units", incoterms: ["FOB", "CIF", "DDP"], leadTime: "30–35 days", packaging: "Blister strips, export cartons, cold-chain optional" },
      { name: "Active Pharmaceutical Ingredients", hsCode: "2941.90", moq: "25 kg", incoterms: ["FOB", "CIF"], leadTime: "20–25 days", packaging: "HDPE drums, GMP-sealed" },
      { name: "Ayurvedic & Herbal Extracts", hsCode: "1302.19", moq: "50 kg", incoterms: ["FOB", "CIF", "EXW"], leadTime: "15–20 days", packaging: "Vacuum-sealed pouches, fibre drums" },
      { name: "Surgical Disposables", hsCode: "9018.90", moq: "5,000 units", incoterms: ["FOB", "CIF"], leadTime: "20–30 days", packaging: "Sterile-sealed, export cartons" },
      { name: "Nutraceuticals & Supplements", hsCode: "2106.90", moq: "5,000 units", incoterms: ["FOB", "CIF", "DDP"], leadTime: "25–30 days", packaging: "Bottled, shrink-wrapped export pack" },
    ],
  },
  {
    slug: "building-materials",
    name: "Building Materials",
    description:
      "Supplying natural stone, marble, granite, ceramic products, and construction materials for residential, commercial, and infrastructure projects.",
    image: "/images/industries/building-editorial.png",
    productCategorySlug: "building-materials",
    categories: [
      { name: "Vitrified & Ceramic Tiles", hsCode: "6907.21", moq: "1 FCL (18,000 sqft)", incoterms: ["FOB", "CIF"], leadTime: "20–25 days", packaging: "Wooden pallets, edge-protected cartons" },
      { name: "Sanitaryware", hsCode: "6910.10", moq: "500 pcs", incoterms: ["FOB", "CIF", "DDP"], leadTime: "25–30 days", packaging: "Individually crated, palletized" },
      { name: "Marble & Granite Slabs", hsCode: "6802.91", moq: "200 sqm", incoterms: ["FOB", "CIF"], leadTime: "30–35 days", packaging: "A-frame crates, seaworthy bracing" },
      { name: "Engineered Quartz", hsCode: "6810.99", moq: "150 sqm", incoterms: ["FOB", "CIF", "EXW"], leadTime: "25–30 days", packaging: "A-frame crates" },
      { name: "Cement & Clinker", hsCode: "2523.29", moq: "500 MT", incoterms: ["FOB", "CIF"], leadTime: "10–15 days", packaging: "Bulk vessel or 50kg bags on pallets" },
    ],
  },
  {
    slug: "furniture-interiors",
    name: "Furniture & Interiors",
    description:
      "Connecting businesses with quality furniture and interior solutions for residential, commercial, and hospitality environments.",
    image: "/images/industries/furniture-editorial.png",
    productCategorySlug: "furniture-interiors",
    categories: [],
  },
  {
    slug: "agriculture-food",
    name: "Agriculture & Food",
    description:
      "Supporting international buyers with carefully sourced agricultural products, fresh produce, spices, and processed food solutions.",
    image: "/images/industries/agriculture.jpg",
    productCategorySlug: "agriculture-food",
    categories: [
      { name: "Cumin & Whole Spices", hsCode: "0909.31", moq: "10 MT", incoterms: ["FOB", "CIF"], leadTime: "12–18 days", packaging: "25kg PP bags, food-grade liners" },
      { name: "Groundnuts", hsCode: "1202.42", moq: "20 MT", incoterms: ["FOB", "CIF", "EXW"], leadTime: "15–20 days", packaging: "50kg jute/PP bags" },
      { name: "Castor Oil & Derivatives", hsCode: "1515.30", moq: "20 MT", incoterms: ["FOB", "CIF"], leadTime: "15–20 days", packaging: "Flexi-tanks or 200L drums" },
      { name: "Processed & Dehydrated Foods", hsCode: "2005.99", moq: "5 MT", incoterms: ["FOB", "CIF", "DDP"], leadTime: "20–25 days", packaging: "Vacuum pouches, export cartons" },
      { name: "Dry Fruits", hsCode: "0802.90", moq: "5 MT", incoterms: ["FOB", "CIF"], leadTime: "10–15 days", packaging: "Food-grade cartons, nitrogen-flushed" },
    ],
  },
  {
    slug: "engineering-industrial",
    name: "Engineering & Industrial",
    description:
      "Delivering industrial products, engineering components, and manufacturing solutions that support industrial growth and infrastructure development.",
    image: "/images/industries/engineering.jpg",
    productCategorySlug: "engineering-industrial",
    categories: [
      { name: "Industrial Pumps & Motors", hsCode: "8413.70", moq: "50 units", incoterms: ["FOB", "CIF", "DDP"], leadTime: "25–30 days", packaging: "Wooden crates, export palletized" },
      { name: "Valves & Pipe Fittings", hsCode: "8481.80", moq: "500 units", incoterms: ["FOB", "CIF"], leadTime: "20–25 days", packaging: "Carton boxes on pallets" },
      { name: "Auto & Machine Components", hsCode: "8708.99", moq: "1,000 units", incoterms: ["FOB", "CIF", "EXW"], leadTime: "20–30 days", packaging: "Anti-rust wrapped, export cartons" },
      { name: "Industrial Fasteners", hsCode: "7318.15", moq: "2 MT", incoterms: ["FOB", "CIF"], leadTime: "15–20 days", packaging: "25kg cartons on pallets" },
      { name: "Machine Tools", hsCode: "8459.61", moq: "10 units", incoterms: ["FOB", "CIF", "DDP"], leadTime: "35–40 days", packaging: "Custom wooden crates" },
    ],
  },
  {
    slug: "technology",
    name: "Technology",
    description:
      "Providing software development, artificial intelligence, digital transformation, and technology solutions for modern businesses.",
    image: "/images/industries/technology.jpg",
    serviceHref: "/businesses/service-exports/",
    categories: [],
  },
  {
    slug: "retail-consumer-goods",
    name: "Retail & Consumer Goods",
    description:
      "Helping retailers, distributors, and consumer brands strengthen their supply chains with scalable sourcing and business solutions.",
    image: "/images/industries/retail-editorial.png",
    categories: [],
  },
];

export function getIndustryBySlug(slug: string): Industry | undefined {
  return industries.find((i) => i.slug === slug);
}

export function getAllCategoriesWithIndustry(): { industrySlug: string; industryName: string; category: ProductCategory }[] {
  return industries.flatMap((i) => i.categories.map((category) => ({ industrySlug: i.slug, industryName: i.name, category })));
}
