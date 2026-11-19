import { PageShell } from "@/components/layout/page-shell";
import { TeamWorkspace } from "@/components/ideas/team-workspace";

export default function TeamWorkspacePage() {
  return (
    <PageShell
      title="Team Workspace & Collaboration"
      description="Real-time multi-founder workspace: collaborate on hypotheses, assign tasks, review feedback, and share analysis."
    >
      <TeamWorkspace idea={null} />
    </PageShell>
  );
}
