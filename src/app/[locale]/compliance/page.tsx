import type { Metadata } from "next";
import TrivoxaShell from "@/components/trivoxa/TrivoxaShell";
import { PageHero } from "@/components/trivoxa/ui";
import CertificationsStrip from "@/components/sections/CertificationsStrip";
import "@/app/styles/flagship-sections.css";

export const metadata: Metadata = {
  title: "Compliance | Trivoxa Group",
  description:
    "Trivoxa Group's certifications and standards — active operational licensing, and sector certifications currently in progress.",
};

export default function CompliancePage() {
  return (
    <TrivoxaShell>
      <PageHero
        eyebrow="Compliance"
        title="Certifications & Standards."
        description="Operational licensing is active. Sector-specific certifications are being secured on a public timeline, listed here as they progress."
      />
      <CertificationsStrip />
    </TrivoxaShell>
  );
}
