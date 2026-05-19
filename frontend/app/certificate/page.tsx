import { CertificatePreview } from "@/components/insights/certificate-preview";
import { PageShell } from "@/components/layout/page-shell";

export default function CertificatePage() {
  return (
    <PageShell
      title="Certificate Page"
      description="Generate proof of idea ownership with submission date, owner attribution, and innovation score for records or competition submissions."
    >
      <CertificatePreview />
    </PageShell>
  );
}
