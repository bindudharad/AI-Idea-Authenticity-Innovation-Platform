"use client";

import { useEffect, useState } from "react";

import { CommunityFeed } from "@/components/ideas/community-feed";
import { LoginRequiredCard } from "@/components/shared/module-state";
import { readAccessToken } from "@/services/auth-session";
import { getDemoAccessToken } from "@/services/demo-session";
import { getCommunityIdeas } from "@/services/idea-service";
import { CommunityIdea } from "@/types/idea";
import { Button } from "@/ui/button";
import { Card } from "@/ui/card";
import { BarChart3, Clock, Flame } from "lucide-react";
import clsx from "clsx";

function hashString(value: string) {
  let hash = 0;
  for (let index = 0; index < value.length; index += 1) {
    hash = (hash * 31 + value.charCodeAt(index)) >>> 0;
  }
  return hash;
}

function mapToCommunityIdea(
  item: { title: string; description: string; source: string; innovation_score: number; created_at?: string },
  index: number
): CommunityIdea {
  const stableSeed = hashString(`${item.title}:${item.source}:${index}`);
  const popularityBoost = stableSeed % 11;
  const fallbackDate = new Date(Date.UTC(2025, 0, 1) + (stableSeed % 365) * 86400000).toISOString();

  return {
    id: index + 1,
    title: item.title,
    description: item.description,
    category: item.source,
    source: item.source,
    innovation: item.innovation_score,
    popularity: Math.max(40, Math.round(item.innovation_score + popularityBoost)),
    date: item.created_at || fallbackDate
  };
}

export function CommunityFeedClient() {
  const [ideas, setIdeas] = useState<CommunityIdea[]>([]);
  const [sortType, setSortType] = useState<"innovation" | "recent" | "popularity">("innovation");
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    const token = readAccessToken();
    setIsAuthenticated(Boolean(token));

    if (!token) {
      setIdeas([]);
      setIsLoading(false);
      return;
    }

    let mounted = true;

    async function loadCommunity() {
      setIsLoading(true);
      try {
        const token = await getDemoAccessToken();
        if (!token) {
          if (mounted) {
            setIdeas([]);
          }
          return;
        }
        const response = await getCommunityIdeas(token);
        if (mounted && response && response.length > 0) {
          const mapped = response.map(mapToCommunityIdea);
          setIdeas(mapped.sort((a, b) => b.innovation - a.innovation));
        } else {
          setIdeas([]);
        }
      } catch {
        if (mounted) {
          setIdeas([]);
        }
      } finally {
        if (mounted) setIsLoading(false);
      }
    }

    void loadCommunity();
    return () => {
      mounted = false;
    };
  }, []);

  if (!isAuthenticated) {
    return (
      <div className="space-y-6">
        <LoginRequiredCard
          title="Login Required"
          description="To access community features, please sign in or create an account."
        />
      </div>
    );
  }

  const handleSort = (type: "innovation" | "recent" | "popularity") => {
    setSortType(type);
    const sorted = [...ideas];
    if (type === "innovation") {
      sorted.sort((a, b) => b.innovation - a.innovation);
    } else if (type === "recent") {
      sorted.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
    } else if (type === "popularity") {
      sorted.sort((a, b) => b.popularity - a.popularity);
    }
    setIdeas(sorted);
  };

  return (
    <div className="space-y-8">
      {/* Sorting Controls */}
      <div className="flex flex-wrap items-center gap-3 border-b border-white/5 pb-6">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSort("innovation")}
          className={clsx(
            "gap-2 rounded-xl transition-all",
            sortType === "innovation" 
              ? "bg-cyan-500/10 text-cyan-400 border-cyan-500/50 shadow-[0_0_15px_rgba(34,211,238,0.2)]" 
              : "border-white/10 text-slate-400 hover:text-white"
          )}
        >
          <BarChart3 className="h-4 w-4" />
          Sort by Innovation
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSort("recent")}
          className={clsx(
            "gap-2 rounded-xl transition-all",
            sortType === "recent" 
              ? "bg-purple-500/10 text-purple-400 border-purple-500/50 shadow-[0_0_15px_rgba(168,85,247,0.2)]" 
              : "border-white/10 text-slate-400 hover:text-white"
          )}
        >
          <Clock className="h-4 w-4" />
          Recent Submissions
        </Button>
        <Button
          variant="secondary"
          size="sm"
          onClick={() => handleSort("popularity")}
          className={clsx(
            "gap-2 rounded-xl transition-all",
            sortType === "popularity" 
              ? "bg-amber-500/10 text-amber-400 border-amber-500/50 shadow-[0_0_15px_rgba(245,158,11,0.2)]" 
              : "border-white/10 text-slate-400 hover:text-white"
          )}
        >
          <Flame className="h-4 w-4" />
          Popularity
        </Button>
      </div>

      {isLoading ? (
        <div className="grid gap-5 lg:grid-cols-2 animate-pulse">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-40 rounded-3xl border border-white/5 bg-white/[0.02]" />
          ))}
        </div>
      ) : ideas.length === 0 ? (
        <Card className="rounded-[24px] border-white/10 bg-white/[0.04] p-6 text-sm leading-7 text-slate-300">
          No public community ideas are available yet.
        </Card>
      ) : (
        <CommunityFeed ideas={ideas} />
      )}
    </div>
  );
}
