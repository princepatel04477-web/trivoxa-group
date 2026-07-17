/** Service-export taxonomy — sub-service names and their capability items
 * verbatim from the master content doc §7.2 "Service-Based Exports",
 * grouped under the six §4.5 top-level categories. */

export type DeliveryModel = "project" | "retainer" | "staff-aug" | "flexible";

export interface SubService {
  name: string;
  /** Capability items verbatim from §7.2 — rendered as mono chips. */
  items: string[];
}

export interface ServiceCategory {
  slug: string;
  name: string;
  description: string;
  deliveryModel: DeliveryModel;
  subServices: SubService[];
}

export const serviceCategories: ServiceCategory[] = [
  {
    slug: "technology",
    name: "Technology Solutions",
    description: "Cloud, data & analytics, cybersecurity, and enterprise technology.",
    deliveryModel: "flexible",
    subServices: [
      { name: "Cloud Services", items: ["AWS", "Microsoft Azure", "Google Cloud", "DevOps", "Cloud Migration"] },
      { name: "Cybersecurity", items: ["Security Audits", "Penetration Testing", "Compliance", "Network Security"] },
      { name: "Data & Analytics", items: ["Power BI Dashboards", "Tableau Dashboards", "Data Analysis", "Business Intelligence", "Reporting Automation"] },
    ],
  },
  {
    slug: "ai",
    name: "AI Solutions",
    description: "AI chatbots, automation, workflow automation, and custom AI integration.",
    deliveryModel: "project",
    subServices: [
      { name: "AI Services", items: ["AI Chatbots", "AI Automation", "Workflow Automation", "AI Integration", "Custom AI Solutions"] },
    ],
  },
  {
    slug: "software",
    name: "Software Development",
    description: "Custom software, SaaS, CRM/ERP, web, and mobile app development.",
    deliveryModel: "staff-aug",
    subServices: [
      { name: "Software Development", items: ["Custom Software Development", "Enterprise Software", "SaaS Development", "CRM Development", "ERP Development", "API Development"] },
      { name: "Website Development", items: ["Corporate Websites", "E-commerce Websites", "Landing Pages", "CMS Development", "Web Portals", "Website Maintenance"] },
      { name: "Mobile App Development", items: ["Android Apps", "iOS Apps", "Cross-Platform Apps", "Flutter Development", "React Native Development"] },
    ],
  },
  {
    slug: "design",
    name: "Design & Branding",
    description: "UI/UX, brand identity, graphic design, and packaging.",
    deliveryModel: "project",
    subServices: [
      { name: "UI/UX Design", items: ["UI Design", "UX Design", "Wireframing", "Prototyping", "Design Systems"] },
      { name: "Graphic Design", items: ["Logo Design", "Brand Identity", "Brochures", "Flyers", "Catalogs", "Packaging Design", "Business Cards", "Social Media Graphics"] },
      { name: "Creative Services", items: ["Video Editing", "Motion Graphics", "Animation", "Product Photography", "Commercial Photography"] },
    ],
  },
  {
    slug: "marketing",
    name: "Digital Marketing",
    description: "SEO, paid ads, social, email, and content marketing.",
    deliveryModel: "retainer",
    subServices: [
      { name: "Digital Marketing", items: ["SEO", "Google Ads", "Meta Ads", "LinkedIn Marketing", "Email Marketing", "Content Marketing", "Social Media Marketing"] },
      { name: "E-commerce Services", items: ["Shopify Development", "WooCommerce Development", "Amazon Store Setup", "Etsy Store Setup", "Marketplace Management"] },
    ],
  },
  {
    slug: "business-support",
    name: "Business Support Services",
    description: "Virtual assistance, support, back-office operations, and consulting.",
    deliveryModel: "retainer",
    subServices: [
      { name: "Content Services", items: ["Copywriting", "Technical Writing", "Blog Writing", "Product Descriptions", "Documentation"] },
      { name: "Translation & Localization", items: ["Website Translation", "App Localization", "Document Translation", "Multilingual Content"] },
      { name: "Business Support", items: ["Virtual Assistance", "Customer Support", "Technical Support", "Back Office Operations", "Data Entry"] },
      { name: "Consulting", items: ["Business Consulting", "IT Consulting", "Export Consulting", "Supply Chain Consulting", "Process Optimization"] },
    ],
  },
];

export function getServiceCategory(slug: string): ServiceCategory | undefined {
  return serviceCategories.find((c) => c.slug === slug);
}

export function getRelatedServices(slug: string, count = 3): ServiceCategory[] {
  return serviceCategories.filter((c) => c.slug !== slug).slice(0, count);
}
