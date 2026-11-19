import { PageShell } from "@/components/layout/page-shell";
import GlobalInnovationMapPageView from "@/pages/GlobalInnovationMap";

export default function GlobalInnovationMapPage() {
  return (
    <PageShell
      title="Global Innovation Map"
      description="Geographic and ecosystem distribution of patents, research publications, and startups related to your concept."
    >
      <GlobalInnovationMapPageView />
    </PageShell>
  );
}
