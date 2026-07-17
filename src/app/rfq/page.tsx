import type { Metadata } from "next";
import { Suspense } from "react";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero } from "@/components/trivoxa/ui";
import RfqForm from "@/components/rfq/RfqForm";
import "@/app/styles/rfq-page.css";

export const metadata: Metadata = {
  title: "Request a Quote | Trivoxa Group",
  description:
    "Submit an export RFQ — product category, quantity, incoterms, and delivery window — and hear back within 24 business hours.",
};

export default function RfqPage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Request For Quote"
        title="Send Us Your RFQ"
        description="Three steps. Real HS codes, real lead times. Our sourcing team responds within 24 business hours (IST)."
      />
      <section className="tvx-section tvx-section--tight">
        <div className="container">
          <Suspense fallback={null}>
            <RfqForm />
          </Suspense>
        </div>
      </section>
    </TrivoxaShell>
  );
}
