"use client";

import { PitchGeneratorClient } from "@/components/insights/pitch-generator-client";
import { PageShell } from "@/components/layout/page-shell";

export default function PitchGenerator() {
  return (
    <PageShell
      title="Pitch Generator"
      description="Automatically generate a startup pitch deck from the latest analysis, then export it as PDF or PowerPoint for investor-ready sharing."
    >
      <PitchGeneratorClient />
    </PageShell>
  );
}
