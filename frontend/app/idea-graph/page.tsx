import { PageShell } from "@/components/layout/page-shell";
import IdeaGraphPageView from "@/pages/IdeaGraph";

export default function IdeaGraphPage() {
  return (
    <PageShell
      title="Global Idea Graph"
      description="Interactive multi-dimensional knowledge graph mapping concepts, technologies, competitors, and domain clusters."
    >
      <IdeaGraphPageView />
    </PageShell>
  );
}
