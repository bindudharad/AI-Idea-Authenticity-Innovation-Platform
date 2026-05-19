"use client";

import { useEffect, useMemo, useState } from "react";
import { Trophy } from "lucide-react";

import { PageShell } from "@/components/layout/page-shell";
import { AuthRequiredState } from "@/components/shared/module-state";
import { readAccessToken } from "@/services/auth-session";
import { getUserIdeas } from "@/services/idea-service";
import { Card } from "@/ui/card";
import { Badge } from "@/ui/badge";
import { IdeaResponse } from "@/types/api";
import { formatStableDate } from "@/lib/format";

export default function InnovationLeaderboardPage() {
  const [ideas, setIdeas] = useState<IdeaResponse[]>([]);
  const [token, setToken] = useState<string | null>(null);
  const [authReady, setAuthReady] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setToken(readAccessToken());
    setAuthReady(true);
  }, []);

  useEffect(() => {
    if (!authReady) {
      return;
    }
    let active = true;
    if (!token) {
      setLoading(false);
      return;
    }

    void getUserIdeas(token)
      .then((response) => {
        if (active) {
          setIdeas(response);
        }
      })
      .catch(() => {
        if (active) {
          setIdeas([]);
        }
      })
      .finally(() => {
        if (active) {
          setLoading(false);
        }
      });

    return () => {
      active = false;
    };
  }, [authReady, token]);

  const leaderboard = useMemo(() => {
    return [...ideas].sort((a, b) => b.innovation_score - a.innovation_score).slice(0, 12);
  }, [ideas]);

  if (!authReady) {
    return (
      <PageShell title="Innovation Leaderboard" description="Top ideas ranked by innovation score across the platform.">
        <Card className="h-48 animate-pulse bg-white/[0.04]">
          <div className="h-full" />
        </Card>
      </PageShell>
    );
  }

  if (!token) {
    return (
      <PageShell title="Innovation Leaderboard" description="Top ideas ranked by innovation score across the platform.">
        <AuthRequiredState title="Sign in to view the innovation leaderboard" />
      </PageShell>
    );
  }

  return (
    <PageShell
      title="Innovation Leaderboard"
      description="Top ideas ranked by innovation score across the platform."
    >
      <Card>
        <div className="flex items-center justify-between">
          <div>
            <p className="panel-heading">Leaderboard</p>
            <h2 className="panel-subtitle">Global innovation rankings</h2>
          </div>
          <div className="rounded-2xl bg-amber-400/10 p-3 text-amber-300">
            <Trophy className="h-5 w-5" />
          </div>
        </div>
        <div className="mt-6 space-y-3">
          {loading ? (
            <div className="rounded-[24px] border border-white/10 bg-white/[0.04] p-5 text-sm text-slate-300">
              Loading leaderboard entries...
            </div>
          ) : leaderboard.length === 0 ? (
            <div className="rounded-[24px] border border-dashed border-white/12 bg-white/[0.03] p-5 text-sm text-slate-300">
              No leaderboard entries yet. Run analyses to populate the innovation rankings.
            </div>
          ) : (
            leaderboard.map((entry, index) => (
              <div key={entry.id} className="flex flex-wrap items-center justify-between gap-4 rounded-[24px] border border-white/10 bg-white/[0.04] p-5">
                <div>
                  <p className="text-lg font-semibold text-white">{entry.title}</p>
                  <p className="mt-2 text-sm text-slate-400">Updated {formatStableDate(entry.updated_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <Badge tone="info">#{index + 1}</Badge>
                  <p className="text-2xl font-semibold text-white">{Math.round(entry.innovation_score)}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </Card>
    </PageShell>
  );
}
