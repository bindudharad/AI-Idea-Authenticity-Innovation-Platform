import { PageShell } from "@/components/layout/page-shell";
import { InnovationLabClient } from "@/components/insights/innovation-lab-client";

export default function InnovationLabPage() {
  return (
    <PageShell
      title="Innovation Acceleration Lab"
      description="Fine-tune architecture, explore iterative differentiators, and stress-test competitive moats."
    >
      <InnovationLabClient />
    </PageShell>
  );
}
