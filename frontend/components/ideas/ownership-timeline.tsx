"use client";

import { Badge } from "@/ui/badge";
import { Card } from "@/ui/card";
import type { IdeaVersionResponse } from "@/types/api";
import { formatStableDateTime } from "@/lib/format";

type OwnershipTimelineProps = {
  versions?: IdeaVersionResponse[];
  ideaTitle?: string;
};

export function OwnershipTimeline({ versions = [], ideaTitle }: OwnershipTimelineProps) {
  return (
    <Card>
      <p className="text-sm uppercase tracking-[0.18em] text-slate-500">Idea version history</p>
      {ideaTitle ? (
        <p className="mt-2 text-sm text-slate-400">Tracking backend ownership snapshots for {ideaTitle}.</p>
      ) : null}

      <div className="mt-6 space-y-5">
        {versions.length > 0 ? (
          versions.map((version) => (
            <div key={version.id} className="flex gap-4">
              <div className="flex flex-col items-center">
                <div className="h-3 w-3 rounded-full bg-glow" />
                <div className="mt-2 h-full w-px bg-white/10" />
              </div>
              <div className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-4">
                <div className="flex items-center justify-between gap-4">
                  <div>
                    <p className="text-sm uppercase tracking-[0.18em] text-slate-500">V{version.version_number}</p>
                    <p className="mt-2 font-medium text-white">{version.description}</p>
                  </div>
                  <Badge tone="success">{Math.round(version.innovation_score)}</Badge>
                </div>
                <p className="mt-3 text-sm text-slate-400">{formatStableDateTime(version.created_at)}</p>
              </div>
            </div>
          ))
        ) : (
          <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm leading-7 text-slate-300">
            Save an idea from the results page to create a real backend version timeline.
          </div>
        )}
      </div>
    </Card>
  );
}
