import { CommunityFeedClient } from "@/components/ideas/community-feed-client";
import { PageShell } from "@/components/layout/page-shell";
import { Card } from "@/ui/card";

export default function CommunityPage() {
  return (
    <PageShell
      title="Community Ideas Page"
      description="Explore public submissions ranked by innovation, recency, and traction to understand where the ecosystem is heading."
    >
      <Card>
        <p className="panel-heading">Innovation leaderboard</p>
        <h2 className="panel-subtitle">Top innovators this week</h2>
        <div className="mt-6 grid gap-3 md:grid-cols-3">
          {[
            { name: "Nova Labs", score: 96 },
            { name: "Atlas Foundry", score: 93 },
            { name: "Skyline Ventures", score: 91 },
          ].map((team) => (
            <div key={team.name} className="rounded-[22px] border border-white/10 bg-white/[0.04] p-4 text-sm text-slate-200">
              <p className="font-semibold text-white">{team.name}</p>
              <p className="mt-2 text-xs uppercase tracking-[0.18em] text-slate-500">Innovation score</p>
              <p className="text-2xl font-semibold text-sky-300">{team.score}</p>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Explorer controls</p>
            <h2 className="mt-3 text-2xl font-semibold text-white">Public innovation feed</h2>
          </div>
        </div>
      </Card>
      <CommunityFeedClient />
    </PageShell>
  );
}
