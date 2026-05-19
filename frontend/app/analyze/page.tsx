import { ArchitectureViewer } from "@/components/analytics/architecture-viewer";
import { IdeaFormStream } from "@/components/ideas/idea-form-stream";
import { AnalyzePreview } from "@/components/ideas/analyze-preview";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/ui/card";

export default function AnalyzePage() {
  return (
    <PageShell
      title="Business Intelligence Intake"
      description="Choose Startup Idea or Business Idea, then generate a focused AI workspace with the right analysis path."
    >
      <IdeaFormStream />
      <AnalyzePreview />
      <div className="grid gap-8 lg:grid-cols-[2fr_1fr] lg:gap-[30px]">
        <Card className="panel-hover h-full">
          <p className="panel-heading">How analysis works</p>
          <h2 className="panel-subtitle">Card-based intelligence pipeline</h2>
          <div className="mt-6 grid gap-4">
            {[
              "Embed the idea description using all-MiniLM-L6-v2.",
              "Compare vectors against curated and public idea corpora.",
              "Adapt scoring based on Startup Idea or Business Idea.",
              "Generate the right dashboard: startup intelligence or business viability."
            ].map((item) => (
              <div key={item} className="rounded-[24px] border border-white/10 bg-white/[0.04] px-5 py-4 text-sm text-slate-200">
                {item}
              </div>
            ))}
          </div>
        </Card>
        <ArchitectureViewer />
      </div>
    </PageShell>
  );
}
