import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section, CtaBand } from "@/components/trivoxa/ui";

export const metadata: Metadata = {
  title: "About | Trivoxa Group",
  description:
    "Trivoxa Group's origin story — built from a woven-textile manufacturing floor in Surat, Gujarat, into an international trade and export group.",
};

export default function AboutPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="About"
        title="Built From a Manufacturing Floor in Surat."
        description="Trivoxa Group didn't start as a trading company. It started on the production floor of a textile manufacturer — and carried that discipline into international trade."
      />

      <Section
        eyebrow="Our Origin"
        title="From One Factory to a Growing Export Group."
        lead={
          "Trivoxa Group began as the international trade arm of Shiveshwar Textiles, a woven-textile manufacturer based in Surat, Gujarat. Years spent running production floors — managing looms, holding delivery windows, answering to quality checks — shaped how the company approaches export: reliability first, everything else second.\n\n" +
          "As buyer inquiries grew beyond textiles into healthcare, building materials, agriculture, and engineering goods, Trivoxa Group formed to carry that same manufacturing discipline into new categories — sourcing through vetted partners rather than manufacturing in-house, but holding every shipment to the standard the parent company built its name on."
        }
      />

      <section className="tvx-section tvx-section--tight">
        <div className="container">
          <blockquote className="tvx-pullquote">
            <p>
              We didn&rsquo;t set out to be a trading house. We set out to make sure a manufacturing
              promise made in Surat still holds by the time it reaches a warehouse in Rotterdam.
            </p>
            <cite>— Trivoxa Group</cite>
          </blockquote>
        </div>
      </section>

      <Section eyebrow="Leadership" title="The Person Behind the Group.">
        <div className="tvx-founder-pending">
          <div className="tvx-founder-pending__avatar" aria-hidden="true">
            <svg width="56" height="56" viewBox="0 0 56 56">
              <circle cx="28" cy="28" r="26" fill="none" strokeDasharray="4 4" />
              <circle cx="28" cy="21" r="9" fill="none" />
              <path d="M11 46c2-10 9-15 17-15s15 5 17 15" fill="none" />
            </svg>
          </div>
          <div>
            <p className="tvx-founder-pending__label">Founder profile — in progress</p>
            <p className="tvx-founder-pending__note">
              Name, photo, and a personal note from the founder will be added here. We&rsquo;d rather
              leave this section honestly incomplete than fill it with a stand-in.
            </p>
          </div>
        </div>
      </Section>

      <Section eyebrow="Registered Details" title="Company &amp; Contact.">
        <div className="tvx-info-row">
          <div className="tvx-info-label">Registered Name</div>
          <p>Available on request</p>
        </div>
        <div className="tvx-info-row">
          <div className="tvx-info-label">Year Founded</div>
          <p>Available on request</p>
        </div>
        <div className="tvx-info-row">
          <div className="tvx-info-label">Registered Address</div>
          <p>Surat, Gujarat, India — full address available on request</p>
        </div>
        <div className="tvx-info-row">
          <div className="tvx-info-label">IEC (Import Export Code)</div>
          <p className="tvx-mono">Available on request</p>
        </div>
        <div className="tvx-info-row">
          <div className="tvx-info-label">GST</div>
          <p className="tvx-mono">Available on request</p>
        </div>
        <div className="tvx-info-row">
          <div className="tvx-info-label">Email</div>
          <a href="mailto:hello@trivoxagroup.com">hello@trivoxagroup.com</a>
        </div>
      </Section>

      <CtaBand
        title="Have a Question About Our Group?"
        description="Reach out and our team will get back to you within one business day."
        actions={[{ label: "Contact Our Team", href: "/contact/" }, { label: "Explore the Group", href: "/group/", variant: "ghost" }]}
      />
    </TrivoxaShell>
  );
}
