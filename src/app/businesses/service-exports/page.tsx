import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CardGrid, Steps, Checklist, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "Service Exports | Trivoxa Group",
  description:
    "Trivoxa Group helps organizations grow through technology, software, AI, branding, digital marketing, and business support services.",
};

const services = [
  { icon: "💻", title: "Technology Solutions", description: "Cloud, data & analytics, cybersecurity, and enterprise technology." },
  { icon: "🤖", title: "AI Solutions", description: "AI chatbots, automation, workflow automation, and custom AI integration." },
  { icon: "⌨️", title: "Software Development", description: "Custom software, SaaS, CRM/ERP, web, and mobile app development." },
  { icon: "🎨", title: "Design & Branding", description: "UI/UX, brand identity, graphic design, and packaging." },
  { icon: "📈", title: "Digital Marketing", description: "SEO, paid ads, social, email, and content marketing." },
  { icon: "🛠️", title: "Business Support Services", description: "Virtual assistance, support, back-office operations, and consulting." },
];

const process = [
  { title: "Understand the Brief", desc: "Objectives, scope, technical needs, and success criteria." },
  { title: "Assemble the Right Team", desc: "We connect you with skilled professionals suited to your project." },
  { title: "Execute & Communicate", desc: "Clear milestones and transparent communication throughout." },
  { title: "Deliver & Support", desc: "Reliable delivery plus ongoing support as you scale." },
];

const why = [
  "Access to India's skilled professional talent",
  "Practical solutions tailored to real business challenges",
  "Quality-driven, transparent execution",
  "Scalable teams that grow with your needs",
  "Long-term partnership beyond a single project",
];

export default function ServiceExportsPage() {
  return (
    <TrivoxaShell>
      <PageHero
        crumb={[{ label: "Businesses", href: "/businesses/" }, { label: "Service Exports" }]}
        eyebrow="Service Exports"
        title="Professional Services That Accelerate Growth."
        description="We help organizations accelerate growth through technology, software development, artificial intelligence, branding, digital marketing, and business support services. By connecting businesses with India's skilled professionals, we deliver practical solutions tailored to modern business challenges."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Contact Our Team", href: "/contact/", variant: "ghost" }]}
      />

      <Section
        eyebrow="About Service Exports"
        title="World-Class Talent, Delivered Globally."
        lead={
          "Our service export division connects organizations with skilled professionals delivering technology, design, and business solutions.\n\n" +
          "From software and AI to branding and business support, we help you move faster with dependable, quality-driven execution."
        }
      />

      <Section eyebrow="Service Categories" title="A Full Spectrum of Professional Services.">
        <CardGrid cols={3} items={services} />
      </Section>

      <Section eyebrow="Delivery Process" title="How We Deliver, Reliably.">
        <Steps items={process} row />
      </Section>

      <Section eyebrow="Why Choose Trivoxa" title="Practical Solutions, Long-Term Partnership.">
        <Checklist items={why} />
      </Section>

      <CtaBand
        title="Let's Build Your Next Solution."
        description="Share your project or challenge, and we'll connect you with the right team to deliver it."
        actions={[{ label: "Request a Quote", modal: true }, { label: "Explore Product Exports", href: "/businesses/product-exports/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
