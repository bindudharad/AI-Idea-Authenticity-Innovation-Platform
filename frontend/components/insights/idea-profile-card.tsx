import { AnalyzeIdeaResponse } from "@/types/api";
import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";

export function IdeaProfileCard({ analysis }: { analysis: AnalyzeIdeaResponse }) {
  const profile = analysis.idea_profile;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Idea understanding engine</p>
          <h2 className="mt-3 text-2xl font-semibold text-white">{profile.industry}</h2>
        </div>
        <Badge tone="success">{profile.innovation_category}</Badge>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Problem statement</p>
          <p className="mt-3 text-sm leading-7 text-slate-200">{profile.problem_statement}</p>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Target users</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.target_users.map((user) => (
              <Badge key={user}>{user}</Badge>
            ))}
          </div>
        </div>
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-2">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Technology stack</p>
          <div className="mt-3 flex flex-wrap gap-2">
            {profile.technology_stack.map((item) => (
              <Badge key={item}>{item}</Badge>
            ))}
          </div>
        </div>
        <div className="rounded-3xl border border-white/10 bg-white/5 p-5">
          <p className="text-sm uppercase tracking-[0.16em] text-slate-500">Possible risks</p>
          <div className="mt-3 space-y-2">
            {profile.possible_risks.map((risk) => (
              <p key={risk} className="text-sm leading-7 text-slate-200">
                {risk}
              </p>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
}
