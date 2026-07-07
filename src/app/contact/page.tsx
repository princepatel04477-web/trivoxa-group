import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero, Section } from "@/components/trivoxa/ui";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact | Trivoxa Group",
  description: "Start a conversation with Trivoxa Group — source products, expand into new markets, or become a partner.",
};

export default function ContactPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Contact"
        title="Let's Build the Future Together."
        description="Whether you're looking to source products, expand into international markets, or establish a long-term business partnership, our team is ready to help you move forward with confidence."
      />
      <Section tight>
        <div className="tvx-split">
          <div className="tvx-contact-card">
            <h3 className="tvx-contact-heading">Drop us a line, and we&rsquo;ll get in touch.</h3>
            <ContactForm />
          </div>
          <div>
            <div className="tvx-info-row">
              <div className="tvx-info-label">Email</div>
              <a href="mailto:hello@trivoxagroup.com">hello@trivoxagroup.com</a>
            </div>
            <div className="tvx-info-row">
              <div className="tvx-info-label">Business</div>
              <p>Product Exports &amp; Service Exports</p>
            </div>
            <div className="tvx-info-row">
              <div className="tvx-info-label">Foundation</div>
              <p>Backed by Shiveshwar Textiles</p>
            </div>
            <div className="tvx-info-row">
              <div className="tvx-info-label">Follow</div>
              <p>LinkedIn · Instagram · X · YouTube</p>
            </div>
          </div>
        </div>
      </Section>
    </TrivoxaShell>
  );
}
